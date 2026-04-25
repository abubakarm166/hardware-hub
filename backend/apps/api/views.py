from __future__ import annotations

import json
import os
from datetime import timedelta
from decimal import ROUND_HALF_UP, Decimal
from uuid import UUID

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.models import (
    BulkRmaUpload,
    ContactMessage,
    DeviceCatalog,
    Organization,
    OrganizationMember,
    PartnerInvite,
    PartnerInvoiceRecord,
    RepairFaultCode,
    RepairIssueCategory,
    RepairJob,
    RepairJobAttachment,
    RepairTariff,
)

from .booking_attachments import validate_booking_files
from .booking_intake import allocate_consumer_job_reference, build_workshop_notes
from .partner_audit import log_partner_action
from .partner_bulk import process_bulk_rma_csv
from .partner_permissions import IsPartnerAdmin, IsPartnerUser
from .serializers import (
    BookingIssueOptionTreeSerializer,
    BookingSubmitSerializer,
    BulkRmaUploadDetailSerializer,
    BulkRmaUploadListSerializer,
    ContactMessageCreateSerializer,
    DeviceCatalogSerializer,
    PartnerBulkRmaSerializer,
    PartnerInviteAcceptSerializer,
    PartnerInviteCreateSerializer,
    PartnerInvoiceSerializer,
    PartnerRepairJobSerializer,
    QuoteInputSerializer,
    RepairJobPublicSerializer,
    TrackLookupSerializer,
    WarrantyCheckInputSerializer,
)
from .throttles import BookingSubmitThrottle, TrackLookupThrottle
from .warranty_resolve import resolve_warranty_check

User = get_user_model()


def _partner_org_ids(user):
    return list(
        OrganizationMember.objects.filter(user=user).values_list("organization_id", flat=True)
    )


def _mask_email(email: str) -> str:
    e = (email or "").strip().lower()
    if "@" not in e:
        return "***"
    local, _, domain = e.partition("@")
    if len(local) <= 1:
        return f"{local[:1]}***@{domain}"
    return f"{local[0]}***@{domain}"


@api_view(["GET"])
def health(request):
    return Response(
        {
            "status": "ok",
            "service": "hardware-hub-api",
            "time": timezone.now().isoformat(),
        }
    )


class DeviceCatalogListView(ListAPIView):
    """Active devices for marketing / catalog sections (public read-only)."""

    serializer_class = DeviceCatalogSerializer
    queryset = DeviceCatalog.objects.filter(is_active=True).order_by("brand", "model_name")


class RepairJobPublicListView(ListAPIView):
    """Sample repair jobs for demo tracking UI (no PII). Draft jobs are hidden."""

    serializer_class = RepairJobPublicSerializer
    queryset = RepairJob.objects.exclude(status=RepairJob.Status.DRAFT).select_related(
        "device"
    ).order_by("-updated_at")[:50]


class ContactMessageCreateView(generics.CreateAPIView):
    """Public contact form — no session auth (avoids CSRF issues for API POST)."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    authentication_classes = []
    permission_classes = [AllowAny]


class WarrantyCheckView(APIView):
    """
    Book repair step 2 — warranty via configurable ERP/middleware HTTP when configured, else stub.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = WarrantyCheckInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data

        device = None
        catalog_id = vd.get("device_catalog_id")
        if catalog_id is not None:
            device = DeviceCatalog.objects.filter(pk=catalog_id, is_active=True).first()
            if device is None:
                return Response(
                    {"detail": "Unknown or inactive device_catalog_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        imei_digits = vd.get("imei") or None
        if imei_digits == "":
            imei_digits = None

        outcome = resolve_warranty_check(device=device, imei_digits=imei_digits)
        if outcome.error:
            return Response({"detail": outcome.error}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        payload = {
            "source": outcome.source,
            "checked_at": timezone.now().isoformat(),
            "device": DeviceCatalogSerializer(device).data if device else None,
            "imei": imei_digits,
            "in_warranty": outcome.in_warranty,
            "summary": outcome.summary,
            "next_action": outcome.next_action,
            "disclaimer": outcome.disclaimer,
        }
        return Response(payload, status=status.HTTP_200_OK)


# Indicative lines when customer used IMEI-only (no catalog device) — replace with ERP model lookup later.
_GENERIC_OOW_LINES: list[dict] = [
    {
        "code": "generic_assessment",
        "label": "Workshop assessment (estimated)",
        "parts_cents": 0,
        "labour_cents": 39900,
    },
    {
        "code": "generic_repair_band",
        "label": "Typical out-of-warranty repair band (indicative parts + labour)",
        "parts_cents": 249900,
        "labour_cents": 79900,
    },
]


class QuoteView(APIView):
    """
    Book repair step 3 — out-of-warranty tariffs from DB, or warranty-channel messaging.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = QuoteInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data

        in_warranty = vd["in_warranty"]
        catalog_id = vd.get("device_catalog_id")
        imei_raw = vd.get("imei") or ""
        imei_clean = imei_raw if imei_raw else None

        device: DeviceCatalog | None = None
        if catalog_id is not None:
            device = DeviceCatalog.objects.filter(pk=catalog_id, is_active=True).first()
            if device is None:
                return Response(
                    {"detail": "Unknown or inactive device_catalog_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if in_warranty:
            return Response(
                {
                    "quote_mode": "warranty_channel",
                    "currency": "ZAR",
                    "vat_rate": 0.15,
                    "lines": [],
                    "subtotal_cents": 0,
                    "vat_cents": 0,
                    "total_cents": 0,
                    "summary": (
                        "Warranty repairs are finalised after physical inspection. "
                        "If any excess or non-covered work applies, we will confirm with you before proceeding."
                    ),
                    "disclaimer": "",
                    "source": "catalog",
                    "device": DeviceCatalogSerializer(device).data if device else None,
                    "imei": imei_clean,
                },
                status=status.HTTP_200_OK,
            )

        if device:
            tariffs = RepairTariff.objects.filter(device=device, is_active=True).order_by(
                "sort_order", "code"
            )
            lines = [
                {
                    "code": t.code,
                    "label": t.label,
                    "parts_cents": t.parts_cents,
                    "labour_cents": t.labour_cents,
                    "subtotal_cents": t.parts_cents + t.labour_cents,
                }
                for t in tariffs
            ]
            quote_source = "catalog"
        else:
            lines = [
                {
                    **row,
                    "subtotal_cents": row["parts_cents"] + row["labour_cents"],
                }
                for row in _GENERIC_OOW_LINES
            ]
            quote_source = "generic"

        subtotal_cents = sum(int(x["subtotal_cents"]) for x in lines)
        vat_cents = int(
            (Decimal(subtotal_cents) * Decimal("0.15")).quantize(
                Decimal("1"), rounding=ROUND_HALF_UP
            )
        )
        total_cents = subtotal_cents + vat_cents

        return Response(
            {
                "quote_mode": "out_of_warranty",
                "currency": "ZAR",
                "vat_rate": 0.15,
                "lines": lines,
                "subtotal_cents": subtotal_cents,
                "vat_cents": vat_cents,
                "total_cents": total_cents,
                "summary": (
                    "Indicative pricing for common repair types on this model. "
                    "Final quote is confirmed after workshop assessment."
                ),
                "disclaimer": (
                    "Prices include VAT where applicable; totals shown add 15% VAT to the subtotal. "
                    "Actual parts availability and fault type may change the final amount."
                ),
                "source": quote_source,
                "device": DeviceCatalogSerializer(device).data if device else None,
                "imei": imei_clean,
            },
            status=status.HTTP_200_OK,
        )


_TRACK_STATUS_ORDER: list[str] = [
    RepairJob.Status.INTAKE_SUBMITTED,
    RepairJob.Status.RECEIVED,
    RepairJob.Status.UNDER_ASSESSMENT,
    RepairJob.Status.REPAIR_IN_PROGRESS,
    RepairJob.Status.AWAITING_PARTS,
    RepairJob.Status.COMPLETED,
    RepairJob.Status.READY_FOR_RETURN,
]


def _repair_timeline(job: RepairJob) -> list[dict]:
    current = job.status
    if current not in _TRACK_STATUS_ORDER:
        idx = 0
    else:
        idx = _TRACK_STATUS_ORDER.index(current)
    out: list[dict] = []
    for i, code in enumerate(_TRACK_STATUS_ORDER):
        label = dict(RepairJob.Status.choices).get(code, code)
        out.append(
            {
                "status": code,
                "label": label,
                "complete": i <= idx,
            }
        )
    return out


class TrackLookupView(APIView):
    """
    Authenticated-style lookup: job reference + email must match RepairJob.customer_email.
    Returns 404 for any mismatch (avoid leaking whether a reference exists).
    """

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [TrackLookupThrottle]

    def post(self, request):
        serializer = TrackLookupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ref = serializer.validated_data["job_reference"].strip()
        email = serializer.validated_data["email"].strip().lower()

        job = (
            RepairJob.objects.filter(job_reference__iexact=ref)
            .exclude(status=RepairJob.Status.DRAFT)
            .select_related("device")
            .first()
        )
        stored = (job.customer_email or "").strip().lower() if job else ""
        if job is None or not stored or stored != email:
            return Response(
                {
                    "detail": "No repair found for this reference and email. "
                    "Check your details or contact us."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "job_reference": job.job_reference,
                "status": job.status,
                "status_display": job.get_status_display(),
                "device": DeviceCatalogSerializer(job.device).data if job.device else None,
                "updated_at": job.updated_at.isoformat(),
                "timeline": _repair_timeline(job),
            },
            status=status.HTTP_200_OK,
        )


class PartnerMeView(APIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]

    def get(self, request):
        memberships = OrganizationMember.objects.filter(user=request.user).select_related(
            "organization"
        )
        orgs = [
            {
                "id": m.organization_id,
                "name": m.organization.name,
                "slug": m.organization.slug,
                "role": m.role,
                "sla_target_days": m.organization.sla_target_days,
            }
            for m in memberships
        ]
        is_admin = OrganizationMember.objects.filter(
            user=request.user,
            role=OrganizationMember.Role.ADMIN,
        ).exists()
        return Response(
            {
                "user": {
                    "id": request.user.pk,
                    "username": request.user.username,
                    "email": request.user.email or "",
                },
                "organizations": orgs,
                "is_partner_admin": is_admin,
            }
        )


class PartnerJobListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]
    serializer_class = PartnerRepairJobSerializer

    def get_queryset(self):
        org_ids = _partner_org_ids(self.request.user)
        q = RepairJob.objects.filter(organization_id__in=org_ids).select_related("device")
        oid = self.request.query_params.get("organization_id")
        if oid:
            try:
                oid_i = int(oid)
            except ValueError:
                return RepairJob.objects.none()
            if oid_i not in org_ids:
                return RepairJob.objects.none()
            q = q.filter(organization_id=oid_i)
        return q.order_by("-created_at")


class PartnerJobDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]
    serializer_class = PartnerRepairJobSerializer
    lookup_field = "job_reference"
    lookup_url_kwarg = "job_reference"

    def get_queryset(self):
        org_ids = _partner_org_ids(self.request.user)
        return RepairJob.objects.filter(organization_id__in=org_ids).select_related("device")


class PartnerSlaSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]

    def get(self, request):
        org_ids = _partner_org_ids(request.user)
        orgs = Organization.objects.filter(pk__in=org_ids).order_by("name")
        oid = request.query_params.get("organization_id")
        if oid:
            try:
                oid_i = int(oid)
            except ValueError:
                return Response(
                    {"detail": "Invalid organization_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if oid_i not in org_ids:
                return Response(
                    {"detail": "You do not belong to that organization."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            orgs = orgs.filter(pk=oid_i)

        now = timezone.now()
        d30 = now - timedelta(days=30)
        d90 = now - timedelta(days=90)
        terminal = {RepairJob.Status.COMPLETED, RepairJob.Status.READY_FOR_RETURN}
        open_status = {
            RepairJob.Status.RECEIVED,
            RepairJob.Status.UNDER_ASSESSMENT,
            RepairJob.Status.REPAIR_IN_PROGRESS,
            RepairJob.Status.AWAITING_PARTS,
        }

        payload = []
        for org in orgs:
            base = RepairJob.objects.filter(organization=org)
            open_jobs = base.filter(status__in=open_status).count()
            completed_30 = base.filter(status__in=terminal, updated_at__gte=d30).count()
            recent_done = base.filter(status__in=terminal, updated_at__gte=d90)
            breaches = sum(
                1
                for j in recent_done
                if (j.updated_at - j.created_at).days > org.sla_target_days
            )
            payload.append(
                {
                    "organization_id": org.pk,
                    "name": org.name,
                    "slug": org.slug,
                    "sla_target_days": org.sla_target_days,
                    "open_jobs": open_jobs,
                    "completed_last_30_days": completed_30,
                    "sla_breaches_last_90_days": breaches,
                }
            )
        return Response({"organizations": payload})


class PartnerBulkRmaListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]
    serializer_class = BulkRmaUploadListSerializer

    def get_queryset(self):
        org_ids = _partner_org_ids(self.request.user)
        return BulkRmaUpload.objects.filter(organization_id__in=org_ids).order_by("-created_at")


class PartnerBulkRmaDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]
    serializer_class = BulkRmaUploadDetailSerializer

    def get_queryset(self):
        org_ids = _partner_org_ids(self.request.user)
        return BulkRmaUpload.objects.filter(organization_id__in=org_ids)


class PartnerBulkRmaView(APIView):
    permission_classes = [IsAuthenticated, IsPartnerAdmin]

    def post(self, request):
        serializer = PartnerBulkRmaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        admin_memberships = OrganizationMember.objects.filter(
            user=request.user,
            role=OrganizationMember.Role.ADMIN,
        ).select_related("organization")
        if not admin_memberships.exists():
            return Response(
                {"detail": "Bulk RMA upload requires a partner admin role."},
                status=status.HTTP_403_FORBIDDEN,
            )

        raw_org = request.data.get("organization_id")
        if raw_org is not None:
            try:
                org_id = int(raw_org)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Invalid organization_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            m = admin_memberships.filter(organization_id=org_id).first()
        else:
            m = admin_memberships.first()
        if m is None:
            return Response(
                {"detail": "Not an admin for that organization."},
                status=status.HTTP_403_FORBIDDEN,
            )

        csv_text = serializer.validated_data["csv"]
        batch = BulkRmaUpload.objects.create(
            organization=m.organization,
            created_by=request.user,
            csv_text=csv_text[:490_000],
            status=BulkRmaUpload.Status.PROCESSING,
            row_count=0,
            notes="",
        )
        try:
            result = process_bulk_rma_csv(
                organization=m.organization,
                csv_text=csv_text,
                upload=batch,
            )
        except Exception as exc:
            batch.status = BulkRmaUpload.Status.FAILED
            batch.notes = str(exc)[:500]
            batch.processed_at = timezone.now()
            batch.save(update_fields=["status", "notes", "processed_at"])
            return Response(
                {"detail": "Processing failed. Try again or contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if result.get("error"):
            batch.status = BulkRmaUpload.Status.FAILED
            batch.notes = result["error"][:500]
            batch.processed_at = timezone.now()
            batch.save(update_fields=["status", "notes", "processed_at"])
            return Response({"detail": result["error"]}, status=status.HTTP_400_BAD_REQUEST)

        log_partner_action(
            user=request.user,
            action="partner_bulk_rma_processed",
            entity_type="BulkRmaUpload",
            entity_id=str(batch.pk),
            metadata={
                "organization_id": m.organization_id,
                "valid": result.get("valid"),
                "invalid": result.get("invalid"),
                "jobs_created": result.get("jobs_created"),
            },
        )
        out = BulkRmaUploadDetailSerializer(batch).data
        return Response(out, status=status.HTTP_201_CREATED)


class PartnerInviteLookupView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        raw = request.query_params.get("token")
        if not raw:
            return Response({"detail": "Query parameter token is required."}, status.HTTP_400_BAD_REQUEST)
        try:
            UUID(str(raw))
        except ValueError:
            return Response({"detail": "Invalid token."}, status.HTTP_400_BAD_REQUEST)
        inv = PartnerInvite.objects.filter(token=raw).select_related("organization").first()
        if inv is None:
            return Response({"detail": "Invite not found."}, status.HTTP_404_NOT_FOUND)
        valid = inv.consumed_at is None and inv.expires_at >= timezone.now()
        return Response(
            {
                "valid": valid,
                "organization_name": inv.organization.name,
                "email_masked": _mask_email(inv.email),
                "expires_at": inv.expires_at.isoformat(),
                "role": inv.role,
            }
        )


class PartnerInviteAcceptView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PartnerInviteAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        invite = PartnerInvite.objects.select_related("organization").filter(token=token).first()
        if invite is None:
            return Response({"detail": "Invite not found."}, status.HTTP_404_NOT_FOUND)
        if invite.consumed_at:
            return Response({"detail": "This invite was already used."}, status.HTTP_400_BAD_REQUEST)
        if invite.expires_at < timezone.now():
            return Response({"detail": "This invite has expired."}, status.HTTP_400_BAD_REQUEST)

        email = invite.email.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            return Response(
                {
                    "detail": "An account with this email already exists. Sign in or ask an admin to add you."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        with transaction.atomic():
            user = User.objects.create_user(username=username, email=email, password=password)
            OrganizationMember.objects.create(
                user=user,
                organization=invite.organization,
                role=invite.role,
            )
            invite.consumed_at = timezone.now()
            invite.save(update_fields=["consumed_at"])

        log_partner_action(
            user=user,
            action="partner_invite_accepted",
            entity_type="PartnerInvite",
            entity_id=str(invite.pk),
            metadata={"organization_id": invite.organization_id},
        )
        return Response(
            {"detail": "Account created. You can sign in."},
            status=status.HTTP_201_CREATED,
        )


class PartnerInviteCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPartnerAdmin]

    def post(self, request):
        serializer = PartnerInviteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        admin_memberships = OrganizationMember.objects.filter(
            user=request.user,
            role=OrganizationMember.Role.ADMIN,
        ).select_related("organization")
        raw_org = request.data.get("organization_id")
        if raw_org is not None:
            try:
                org_id = int(raw_org)
            except (TypeError, ValueError):
                return Response(
                    {"detail": "Invalid organization_id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            m = admin_memberships.filter(organization_id=org_id).first()
        else:
            m = admin_memberships.first()
        if m is None:
            return Response(
                {"detail": "Not an admin for that organization."},
                status=status.HTTP_403_FORBIDDEN,
            )

        email = serializer.validated_data["email"].strip().lower()
        inv = PartnerInvite.objects.create(
            organization=m.organization,
            email=email,
            role=serializer.validated_data["role"],
            expires_at=timezone.now()
            + timedelta(days=serializer.validated_data["expires_days"]),
            created_by=request.user,
        )
        log_partner_action(
            user=request.user,
            action="partner_invite_created",
            entity_type="PartnerInvite",
            entity_id=str(inv.pk),
            metadata={"email": email, "organization_id": m.organization_id},
        )
        return Response(
            {
                "id": inv.pk,
                "token": str(inv.token),
                "email": email,
                "expires_at": inv.expires_at.isoformat(),
                "accept_path": f"/partner/accept?token={inv.token}",
            },
            status=status.HTTP_201_CREATED,
        )


class PartnerInvoiceListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsPartnerUser]
    serializer_class = PartnerInvoiceSerializer

    def get_queryset(self):
        org_ids = OrganizationMember.objects.filter(user=self.request.user).values_list(
            "organization_id", flat=True
        )
        return PartnerInvoiceRecord.objects.filter(organization_id__in=org_ids).order_by(
            "-created_at"
        )


class BookingIssueOptionsView(APIView):
    """Nested category + fault codes for the booking form (Vision-aligned stable `code` fields)."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        qs = (
            RepairIssueCategory.objects.filter(is_active=True)
            .prefetch_related(
                Prefetch(
                    "fault_codes",
                    queryset=RepairFaultCode.objects.filter(is_active=True).order_by(
                        "sort_order", "code"
                    ),
                )
            )
            .order_by("sort_order", "code")
        )
        data = BookingIssueOptionTreeSerializer(qs, many=True).data
        return Response({"categories": data})


class BookingSubmitView(APIView):
    """Create a consumer repair job and return `booking_payload` shape for future Vision API."""

    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [BookingSubmitThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        content_type = (request.content_type or "").lower()
        upload_files: list = []
        if "multipart/form-data" in content_type:
            raw_payload = request.POST.get("payload")
            if not raw_payload:
                return Response(
                    {"detail": "Missing form field `payload` (JSON booking data)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                data = json.loads(raw_payload)
            except json.JSONDecodeError:
                return Response(
                    {"detail": "Field `payload` must be valid JSON."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            upload_files = list(request.FILES.getlist("documents"))
        else:
            data = request.data

        serializer = BookingSubmitSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        vd = serializer.validated_data

        device: DeviceCatalog | None = None
        if vd.get("device_catalog_id"):
            device = DeviceCatalog.objects.filter(
                pk=vd["device_catalog_id"], is_active=True
            ).first()

        cat = vd["_category"]
        fault = vd["_fault"]
        imei = vd["imei_normalized"]
        description = (vd.get("issue_description") or "").strip()
        warranty = vd["warranty"]
        quote = vd["quote"]

        email = vd["customer_email"].strip().lower()
        name = vd["customer_name"].strip()
        phone = (vd.get("customer_phone") or "").strip()

        payload = {
            "schema_version": 1,
            "booking_source": "web",
            "submitted_at": timezone.now().isoformat(),
            "device": {
                "catalog_id": device.pk if device else None,
                "brand": device.brand if device else None,
                "model_name": device.model_name if device else None,
                "sku": (device.sku or None) if device else None,
                "imei": imei or None,
            },
            "issue": {
                "category": {"id": cat.pk, "code": cat.code, "label": cat.label},
                "fault_code": {"id": fault.pk, "code": fault.code, "label": fault.label},
                "customer_description": description or None,
            },
            "warranty": warranty,
            "quote": quote,
            "customer": {
                "full_name": name,
                "email": email,
                "phone": phone or None,
            },
            "shipping_address": {
                "line1": vd["shipping_line1"].strip(),
                "line2": (vd.get("shipping_line2") or "").strip() or None,
                "city": vd["shipping_city"].strip(),
                "province": vd["shipping_province"].strip(),
                "postal_code": vd["shipping_postal_code"].strip(),
                "country": (vd.get("shipping_country") or "ZA").strip().upper()[:2],
            },
        }

        notes = build_workshop_notes(
            device=device,
            imei=imei,
            category=cat,
            fault=fault,
            description=description,
        )

        try:
            validate_booking_files(upload_files)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        kind_key = vd.get("attachment_kind") or "other"
        attachment_kind = {
            "proof_of_purchase": RepairJobAttachment.Kind.PROOF_OF_PURCHASE,
            "damage_photo": RepairJobAttachment.Kind.DAMAGE_PHOTO,
            "other": RepairJobAttachment.Kind.OTHER,
        }.get(kind_key, RepairJobAttachment.Kind.OTHER)

        with transaction.atomic():
            job = RepairJob.objects.create(
                job_reference=allocate_consumer_job_reference(),
                status=RepairJob.Status.INTAKE_SUBMITTED,
                device=device,
                customer_email=email,
                customer_name=name,
                customer_phone=phone,
                imei=imei,
                issue_category=cat,
                issue_fault_code=fault,
                issue_description=description,
                shipping_line1=vd["shipping_line1"].strip(),
                shipping_line2=(vd.get("shipping_line2") or "").strip(),
                shipping_city=vd["shipping_city"].strip(),
                shipping_province=vd["shipping_province"].strip(),
                shipping_postal_code=vd["shipping_postal_code"].strip(),
                shipping_country=(vd.get("shipping_country") or "ZA").strip().upper()[:2],
                warranty_snapshot=warranty,
                quote_snapshot=quote,
                booking_payload=payload,
                notes=notes,
            )
            attachment_meta: list[dict] = []
            for f in upload_files:
                att = RepairJobAttachment.objects.create(
                    repair_job=job,
                    kind=attachment_kind,
                    file=f,
                    original_name=os.path.basename(f.name)[:255],
                    content_type=getattr(f, "content_type", "") or "",
                    size_bytes=int(getattr(f, "size", 0) or 0),
                )
                attachment_meta.append(
                    {
                        "id": att.pk,
                        "kind": att.kind,
                        "filename": att.original_name,
                    }
                )
            payload["attachments"] = attachment_meta
            payload["job_reference"] = job.job_reference
            payload["public_id"] = str(job.public_id)
            job.booking_payload = payload
            job.save(update_fields=["booking_payload"])

        return Response(
            {
                "job_reference": job.job_reference,
                "public_id": str(job.public_id),
                "attachments_uploaded": len(upload_files),
                "detail": "Booking received. Use your email and reference to track progress.",
            },
            status=status.HTTP_201_CREATED,
        )
