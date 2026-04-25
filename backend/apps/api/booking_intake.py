"""Consumer booking: job reference allocation and workshop notes."""

from __future__ import annotations

import secrets
import uuid

from django.utils import timezone

from apps.core.models import DeviceCatalog, RepairFaultCode, RepairIssueCategory, RepairJob


def allocate_consumer_job_reference() -> str:
    for _ in range(50):
        ref = f"HH-{timezone.now().strftime('%y%m%d')}-{secrets.token_hex(3).upper()}"
        if not RepairJob.objects.filter(job_reference=ref).exists():
            return ref
    return f"HH-{uuid.uuid4().hex[:10].upper()}"


def build_workshop_notes(
    *,
    device: DeviceCatalog | None,
    imei: str,
    category: RepairIssueCategory,
    fault: RepairFaultCode,
    description: str,
) -> str:
    lines = [
        "— Web booking intake —",
        f"Category: {category.label} ({category.code})",
        f"Fault code: {fault.label} ({fault.code})",
    ]
    if description.strip():
        lines.append(f"Customer description: {description.strip()}")
    if device:
        lines.append(f"Device: {device.brand} {device.model_name}" + (f" (SKU {device.sku})" if device.sku else ""))
    if imei:
        lines.append(f"IMEI: {imei}")
    return "\n".join(lines)
