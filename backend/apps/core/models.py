import uuid

from django.conf import settings
from django.db import models


class DeviceCatalog(models.Model):
    """Placeholder for future quote engine / model identification."""

    brand = models.CharField(max_length=128)
    model_name = models.CharField(max_length=256)
    sku = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["brand", "model_name"]
        verbose_name_plural = "Device catalog entries"

    def __str__(self) -> str:
        return f"{self.brand} {self.model_name}"


class RepairTariff(models.Model):
    """
    Out-of-warranty price lines per catalog device (quote engine until ERP pricing sync is wired).
    Amounts in integer cents (ZAR) to avoid float rounding issues.
    """

    device = models.ForeignKey(
        DeviceCatalog,
        on_delete=models.CASCADE,
        related_name="repair_tariffs",
    )
    code = models.CharField(max_length=64)
    label = models.CharField(max_length=160)
    parts_cents = models.PositiveIntegerField(default=0)
    labour_cents = models.PositiveIntegerField(default=0)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["device", "sort_order", "code"]
        constraints = [
            models.UniqueConstraint(
                fields=["device", "code"],
                name="repair_tariff_device_code_uniq",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.device} · {self.label}"


class RepairIssueCategory(models.Model):
    """
    Booking intake category (client taxonomy). Stable `code` is used for Vision / ERP payloads.
    """

    code = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=160)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "code"]
        verbose_name_plural = "Repair issue categories"

    def __str__(self) -> str:
        return f"{self.code} — {self.label}"


class RepairFaultCode(models.Model):
    """Standard fault code within a category."""

    category = models.ForeignKey(
        RepairIssueCategory,
        on_delete=models.CASCADE,
        related_name="fault_codes",
    )
    code = models.CharField(max_length=64)
    label = models.CharField(max_length=200)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["category", "sort_order", "code"]
        constraints = [
            models.UniqueConstraint(
                fields=["category", "code"],
                name="repair_fault_category_code_uniq",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.category.code}:{self.code}"


class RepairJob(models.Model):
    """Core repair job record; external ERP sync will attach in a later phase."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        INTAKE_SUBMITTED = (
            "intake_submitted",
            "Booking confirmed — awaiting your device",
        )
        RECEIVED = "received", "Received"
        UNDER_ASSESSMENT = "under_assessment", "Under assessment"
        REPAIR_IN_PROGRESS = "repair_in_progress", "Repair in progress"
        AWAITING_PARTS = "awaiting_parts", "Awaiting parts"
        COMPLETED = "completed", "Completed"
        READY_FOR_RETURN = "ready_for_return", "Ready for return"

    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    job_reference = models.CharField(max_length=32, unique=True)
    status = models.CharField(
        max_length=32,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    device = models.ForeignKey(
        DeviceCatalog,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repair_jobs",
    )
    customer_email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    organization = models.ForeignKey(
        "Organization",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repair_jobs",
        help_text="B2B owner; consumer jobs leave null.",
    )
    partner_reference = models.CharField(
        max_length=128,
        blank=True,
        help_text="Partner's own reference / RMA line id from bulk upload.",
    )
    customer_name = models.CharField(max_length=200, blank=True)
    customer_phone = models.CharField(max_length=32, blank=True)
    imei = models.CharField(
        max_length=32,
        blank=True,
        help_text="15-digit IMEI when supplied on consumer booking.",
    )
    issue_category = models.ForeignKey(
        RepairIssueCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repair_jobs",
    )
    issue_fault_code = models.ForeignKey(
        RepairFaultCode,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="repair_jobs",
    )
    issue_description = models.TextField(blank=True)
    shipping_line1 = models.CharField(max_length=200, blank=True)
    shipping_line2 = models.CharField(max_length=200, blank=True)
    shipping_city = models.CharField(max_length=120, blank=True)
    shipping_province = models.CharField(max_length=120, blank=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=2, default="ZA")
    warranty_snapshot = models.JSONField(default=dict, blank=True)
    quote_snapshot = models.JSONField(default=dict, blank=True)
    booking_payload = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured consumer intake for Vision / ERP (schema_version, device, issue, customer, etc.).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "-created_at"]),
        ]

    def __str__(self) -> str:
        return self.job_reference


class RepairJobAttachment(models.Model):
    """Proof of purchase, damage photos, etc. linked to a consumer or workshop job."""

    class Kind(models.TextChoices):
        PROOF_OF_PURCHASE = "proof_of_purchase", "Proof of purchase"
        DAMAGE_PHOTO = "damage_photo", "Damage / condition photo"
        OTHER = "other", "Other document"

    repair_job = models.ForeignKey(
        RepairJob,
        on_delete=models.CASCADE,
        related_name="attachments",
    )
    kind = models.CharField(
        max_length=32,
        choices=Kind.choices,
        default=Kind.OTHER,
    )
    file = models.FileField(upload_to="repair_intake/%Y/%m/")
    original_name = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=128, blank=True)
    size_bytes = models.PositiveIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]

    def __str__(self) -> str:
        return f"{self.repair_job.job_reference} · {self.original_name or self.file.name}"


class ContactMessage(models.Model):
    """Inbound website contact form submissions (POPIA: minimise fields stored)."""

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name} <{self.email}>"


class Organization(models.Model):
    """B2B tenant — corporate portal."""

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, max_length=96)
    sla_target_days = models.PositiveSmallIntegerField(
        default=5,
        help_text="Target turnaround days for SLA reporting (display / rules stub).",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class OrganizationMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MEMBER = "member", "Member"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="organization_memberships",
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="members",
    )
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.MEMBER)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "organization"],
                name="org_member_user_org_uniq",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user} @ {self.organization}"


class BulkRmaUpload(models.Model):
    """CSV bulk RMA: validated rows may create RepairJob drafts for the organization."""

    class Status(models.TextChoices):
        RECEIVED = "received", "Received"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="bulk_rma_uploads",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bulk_rma_uploads",
    )
    csv_text = models.TextField(blank=True)
    row_count = models.PositiveIntegerField(default=0)
    valid_row_count = models.PositiveIntegerField(default=0)
    invalid_row_count = models.PositiveIntegerField(default=0)
    jobs_created_count = models.PositiveIntegerField(default=0)
    row_results = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.RECEIVED,
    )
    notes = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Bulk RMA {self.pk} ({self.organization})"


class PartnerInvite(models.Model):
    """One-time link for a partner user to set password and join an organization."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="invites",
    )
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    role = models.CharField(
        max_length=16,
        choices=OrganizationMember.Role.choices,
        default=OrganizationMember.Role.MEMBER,
    )
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="partner_invites_sent",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["token"]),
        ]

    def __str__(self) -> str:
        return f"Invite {self.email} → {self.organization}"


class PartnerInvoiceRecord(models.Model):
    """Downloadable invoice metadata for B2B partners (PDF URL or ERP link later)."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    invoice_reference = models.CharField(max_length=64)
    period_label = models.CharField(max_length=120, blank=True)
    amount_cents = models.PositiveIntegerField(default=0)
    pdf_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.invoice_reference


class AuditLog(models.Model):
    """POPIA-oriented audit trail foundation (expand in later phases)."""

    action = models.CharField(max_length=64)
    entity_type = models.CharField(max_length=64)
    entity_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
