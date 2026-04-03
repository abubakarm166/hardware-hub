from django.utils import timezone
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import ContactMessage, DeviceCatalog, RepairJob

from .serializers import (
    ContactMessageCreateSerializer,
    DeviceCatalogSerializer,
    RepairJobPublicSerializer,
)


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
