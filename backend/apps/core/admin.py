from django.contrib import admin

from .models import AuditLog, ContactMessage, DeviceCatalog, RepairJob


@admin.register(DeviceCatalog)
class DeviceCatalogAdmin(admin.ModelAdmin):
    list_display = ("brand", "model_name", "sku", "is_active", "created_at")
    list_filter = ("is_active", "brand")
    search_fields = ("model_name", "sku", "brand")


@admin.register(RepairJob)
class RepairJobAdmin(admin.ModelAdmin):
    list_display = ("job_reference", "status", "customer_email", "created_at")
    list_filter = ("status",)
    search_fields = ("job_reference", "customer_email")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("action", "entity_type", "entity_id", "created_at")
    list_filter = ("entity_type",)
