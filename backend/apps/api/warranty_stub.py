"""
Local placeholder when no external warranty API is configured or when it fails (if fallback is on).

Live warranty comes from ERP_WARRANTY_API_URL — see warranty_resolve.py and docs/ERP_INTEGRATION.md.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.core.models import DeviceCatalog


def stub_warranty_result(
    *,
    device: DeviceCatalog | None,
    imei_digits: str | None,
) -> tuple[bool, str, str]:
    """
    Returns (in_warranty, summary, next_action).
    next_action is "warranty_intake" or "out_of_warranty_quote".
    Deterministic from IMEI or device pk so QA sees stable behaviour.
    """
    seed = 0
    if imei_digits and len(imei_digits) == 15 and imei_digits.isdigit():
        seed = sum(int(c) for c in imei_digits)
    elif device is not None:
        seed = device.pk * 37
    else:
        seed = 1

    in_warranty = seed % 3 != 0

    if in_warranty:
        summary = (
            "Manufacturer warranty appears active for this device (placeholder logic). "
            "Warranty repairs are subject to physical inspection and policy rules."
        )
        next_action = "warranty_intake"
    else:
        summary = (
            "No active manufacturer warranty found on file (placeholder logic). "
            "You can continue to an automated out-of-warranty quote in the next step."
        )
        next_action = "out_of_warranty_quote"

    return in_warranty, summary, next_action
