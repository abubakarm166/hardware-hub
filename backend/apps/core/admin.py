from django.contrib import admin

from .models import (
    AuditLog,
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


class RepairTariffInline(admin.TabularInline):
    model = RepairTariff
    extra = 0
    ordering = ("sort_order", "code")


class RepairFaultCodeInline(admin.TabularInline):
    model = RepairFaultCode
    extra = 0
    ordering = ("sort_order", "code")


@admin.register(RepairIssueCategory)
class RepairIssueCategoryAdmin(admin.ModelAdmin):
    list_display = ("code", "label", "sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("code", "label")
    ordering = ("sort_order", "code")
    inlines = (RepairFaultCodeInline,)


@admin.register(RepairFaultCode)
class RepairFaultCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "label", "category", "sort_order", "is_active")
    list_filter = ("is_active", "category")
    search_fields = ("code", "label")


@admin.register(DeviceCatalog)
class DeviceCatalogAdmin(admin.ModelAdmin):
    list_display = ("brand", "model_name", "sku", "is_active", "created_at")
    list_filter = ("is_active", "brand")
    search_fields = ("model_name", "sku", "brand")
    inlines = (RepairTariffInline,)


@admin.register(RepairTariff)
class RepairTariffAdmin(admin.ModelAdmin):
    list_display = ("label", "device", "code", "parts_cents", "labour_cents", "is_active")
    list_filter = ("is_active", "device__brand")
    search_fields = ("label", "code", "device__model_name")


class RepairJobAttachmentInline(admin.TabularInline):
    model = RepairJobAttachment
    extra = 0
    readonly_fields = ("uploaded_at", "size_bytes", "content_type")


@admin.register(RepairJob)
class RepairJobAdmin(admin.ModelAdmin):
    list_display = (
        "job_reference",
        "status",
        "organization",
        "customer_name",
        "customer_email",
        "issue_category",
        "created_at",
    )
    list_filter = ("status", "organization", "issue_category")
    search_fields = ("job_reference", "customer_email", "partner_reference", "imei")
    inlines = (RepairJobAttachmentInline,)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)


class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 0


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sla_target_days", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    inlines = (OrganizationMemberInline,)


@admin.register(OrganizationMember)
class OrganizationMemberAdmin(admin.ModelAdmin):
    list_display = ("user", "organization", "role")
    list_filter = ("role", "organization")


@admin.register(BulkRmaUpload)
class BulkRmaUploadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "organization",
        "row_count",
        "valid_row_count",
        "invalid_row_count",
        "jobs_created_count",
        "status",
        "created_at",
        "processed_at",
    )
    list_filter = ("status", "organization")


@admin.register(PartnerInvite)
class PartnerInviteAdmin(admin.ModelAdmin):
    list_display = ("email", "organization", "role", "expires_at", "consumed_at", "created_at")
    list_filter = ("organization", "role")
    search_fields = ("email",)
    readonly_fields = ("token", "created_at")


@admin.register(PartnerInvoiceRecord)
class PartnerInvoiceRecordAdmin(admin.ModelAdmin):
    list_display = ("invoice_reference", "organization", "amount_cents", "created_at")
    list_filter = ("organization",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "created_at")
    list_filter = ("entity_type",)
