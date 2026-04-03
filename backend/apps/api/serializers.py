from rest_framework import serializers

from apps.core.models import ContactMessage, DeviceCatalog, RepairJob


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


class ContactMessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "phone", "message", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_message(self, value: str) -> str:
        text = value.strip()
        if len(text) < 10:
            raise serializers.ValidationError("Please enter at least 10 characters.")
        return text
