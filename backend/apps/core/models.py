import uuid

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


class RepairJob(models.Model):
    """Core repair job record; Vision ERP sync will attach in a later phase."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.job_reference


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


class AuditLog(models.Model):
    """POPIA-oriented audit trail foundation (expand in later phases)."""

    action = models.CharField(max_length=64)
    entity_type = models.CharField(max_length=64)
    entity_id = models.CharField(max_length=64, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
