from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.core.models import (
    BulkRmaUpload,
    ContactMessage,
    DeviceCatalog,
    OrganizationMember,
    PartnerInvoiceRecord,
    RepairFaultCode,
    RepairIssueCategory,
    RepairJob,
)

User = get_user_model()


class DeviceCatalogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceCatalog
        fields = ("id", "brand", "model_name", "sku")


class RepairJobPublicSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    device = DeviceCatalogSerializer(read_only=True)

    class Meta:
        model = RepairJob
        fields = ("job_reference", "status", "status_display", "device", "updated_at")

    def get_status_display(self, obj: RepairJob) -> str:
        return obj.get_status_display()


class WarrantyCheckInputSerializer(serializers.Serializer):
    """Step 2 input: device from catalog and/or IMEI (external warranty / ERP check)."""

    device_catalog_id = serializers.IntegerField(required=False, min_value=1)
    imei = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        max_length=32,
    )

    def validate_imei(self, value: str) -> str:
        if not (value or "").strip():
            return ""
        digits = "".join(c for c in value if c.isdigit())
        if len(digits) != 15:
            raise serializers.ValidationError("IMEI must be exactly 15 digits.")
        return digits

    def validate(self, attrs: dict) -> dict:
        did = attrs.get("device_catalog_id")
        imei = attrs.get("imei") or ""
        if not did and not imei:
            raise serializers.ValidationError(
                "Provide device_catalog_id (from step 1) and/or a 15-digit IMEI."
            )
        return attrs


class QuoteInputSerializer(serializers.Serializer):
    """Step 3 — automated quote (catalog tariffs or generic band for IMEI-only)."""

    device_catalog_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        min_value=1,
    )
    imei = serializers.CharField(required=False, allow_blank=True, default="")
    in_warranty = serializers.BooleanField()
    next_action = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_imei(self, value: str) -> str:
        if not (value or "").strip():
            return ""
        digits = "".join(c for c in value if c.isdigit())
        if len(digits) != 15:
            raise serializers.ValidationError("IMEI must be exactly 15 digits.")
        return digits


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    """Honeypot field `website` must stay empty (bots often fill hidden fields)."""

    website = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=256,
    )

    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "phone", "message", "created_at", "website")
        read_only_fields = ("id", "created_at")

    def validate_website(self, value: str) -> str:
        if value and value.strip():
            raise serializers.ValidationError("Invalid submission.")
        return ""

    def validate_message(self, value: str) -> str:
        text = value.strip()
        if len(text) < 10:
            raise serializers.ValidationError("Please enter at least 10 characters.")
        return text

    def create(self, validated_data: dict):
        validated_data.pop("website", None)
        return super().create(validated_data)


class TrackLookupSerializer(serializers.Serializer):
    job_reference = serializers.CharField(max_length=32)
    email = serializers.EmailField()


class PartnerBulkRmaSerializer(serializers.Serializer):
    csv = serializers.CharField(required=False, allow_blank=True, max_length=500_000)

    def validate_csv(self, value: str) -> str:
        if not value or not value.strip():
            raise serializers.ValidationError("Provide CSV content (paste or upload on client).")
        return value


class PartnerInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerInvoiceRecord
        fields = (
            "id",
            "invoice_reference",
            "period_label",
            "amount_cents",
            "pdf_url",
            "created_at",
        )
        read_only_fields = (
            "id",
            "invoice_reference",
            "period_label",
            "amount_cents",
            "pdf_url",
            "created_at",
        )


class PartnerRepairJobSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    device = DeviceCatalogSerializer(read_only=True)

    class Meta:
        model = RepairJob
        fields = (
            "job_reference",
            "status",
            "status_display",
            "partner_reference",
            "customer_email",
            "device",
            "organization_id",
            "created_at",
            "updated_at",
        )

    def get_status_display(self, obj: RepairJob) -> str:
        return obj.get_status_display()


class BulkRmaUploadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkRmaUpload
        fields = (
            "id",
            "organization_id",
            "row_count",
            "valid_row_count",
            "invalid_row_count",
            "jobs_created_count",
            "status",
            "notes",
            "created_at",
            "processed_at",
        )
        read_only_fields = fields


class BulkRmaUploadDetailSerializer(BulkRmaUploadListSerializer):
    class Meta(BulkRmaUploadListSerializer.Meta):
        fields = BulkRmaUploadListSerializer.Meta.fields + ("row_results", "csv_text")
        read_only_fields = fields


class PartnerInviteCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=OrganizationMember.Role.choices,
        default=OrganizationMember.Role.MEMBER,
    )
    expires_days = serializers.IntegerField(default=14, min_value=1, max_value=90)


class PartnerInviteAcceptSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    password_confirm = serializers.CharField(write_only=True, min_length=8, max_length=128)

    def validate_username(self, value: str) -> str:
        u = value.strip()
        if not u:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=u).exists():
            raise serializers.ValidationError("That username is already taken.")
        return u

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs


class BookingFaultCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairFaultCode
        fields = ("id", "code", "label")


class BookingIssueOptionTreeSerializer(serializers.ModelSerializer):
    fault_codes = BookingFaultCodeSerializer(many=True, read_only=True)

    class Meta:
        model = RepairIssueCategory
        fields = ("id", "code", "label", "fault_codes")


class BookingSubmitSerializer(serializers.Serializer):
    device_catalog_id = serializers.IntegerField(required=False, allow_null=True)
    imei = serializers.CharField(required=False, allow_blank=True, default="")
    issue_category_id = serializers.IntegerField(min_value=1)
    issue_fault_code_id = serializers.IntegerField(min_value=1)
    issue_description = serializers.CharField(max_length=4000, allow_blank=True, default="")
    warranty = serializers.DictField()
    quote = serializers.DictField()
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(required=False, allow_blank=True, default="")
    shipping_line1 = serializers.CharField(max_length=200)
    shipping_line2 = serializers.CharField(required=False, allow_blank=True, default="")
    shipping_city = serializers.CharField(max_length=120)
    shipping_province = serializers.CharField(max_length=120)
    shipping_postal_code = serializers.CharField(max_length=20)
    shipping_country = serializers.CharField(max_length=2, default="ZA")
    attachment_kind = serializers.ChoiceField(
        choices=("proof_of_purchase", "damage_photo", "other"),
        default="other",
        required=False,
    )

    def validate_device_catalog_id(self, value):
        if value is None:
            return value
        if not DeviceCatalog.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError("Unknown or inactive device.")
        return value

    def validate(self, attrs: dict) -> dict:
        did = attrs.get("device_catalog_id")
        imei_raw = (attrs.get("imei") or "").strip()
        imei_digits = "".join(c for c in imei_raw if c.isdigit()) if imei_raw else ""
        if did is None and len(imei_digits) != 15:
            raise serializers.ValidationError(
                "Provide a catalog device and/or a 15-digit IMEI from step 1."
            )
        if imei_raw and len(imei_digits) != 15:
            raise serializers.ValidationError({"imei": "IMEI must be exactly 15 digits."})
        attrs["imei_normalized"] = imei_digits if len(imei_digits) == 15 else ""

        cat = RepairIssueCategory.objects.filter(
            pk=attrs["issue_category_id"], is_active=True
        ).first()
        if not cat:
            raise serializers.ValidationError(
                {"issue_category_id": "Invalid or inactive category."}
            )
        fault = RepairFaultCode.objects.filter(
            pk=attrs["issue_fault_code_id"],
            category_id=cat.pk,
            is_active=True,
        ).first()
        if not fault:
            raise serializers.ValidationError(
                {
                    "issue_fault_code_id": (
                        "Fault code does not match the selected category."
                    )
                }
            )
        attrs["_category"] = cat
        attrs["_fault"] = fault
        return attrs
