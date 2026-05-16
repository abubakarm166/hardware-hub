"""Manufacturer warranty periods from date of purchase (book repair step 4)."""

from __future__ import annotations

import calendar
from datetime import date

# OEM standard warranty periods (months from date of purchase).
OEM_WARRANTY_MONTHS: dict[str, int] = {
    "apple": 12,
    "samsung": 24,
    "huawei": 24,
    "oppo": 24,
    "honor": 24,
    "vivo": 24,
}


def normalize_brand_key(brand: str) -> str:
    return (brand or "").strip().lower()


def oem_warranty_months(brand: str) -> int | None:
    key = normalize_brand_key(brand)
    if not key:
        return None
    if key in OEM_WARRANTY_MONTHS:
        return OEM_WARRANTY_MONTHS[key]
    if key == "other":
        return 24
    return None


def add_months(purchase: date, months: int) -> date:
    y = purchase.year + (purchase.month - 1 + months) // 12
    m = (purchase.month - 1 + months) % 12 + 1
    last_day = calendar.monthrange(y, m)[1]
    return date(y, m, min(purchase.day, last_day))


def check_oem_warranty_from_purchase(*, brand: str, purchase_date: date, today: date | None = None) -> tuple[bool, str, int]:
    """
    Returns (in_warranty, summary, warranty_months).
    """
    today = today or date.today()
    months = oem_warranty_months(brand)
    if months is None:
        return (
            False,
            f"No standard warranty period is configured for “{brand.strip()}”. "
            "Our team will confirm eligibility after inspection.",
            0,
        )

    if purchase_date > today:
        return (
            False,
            "The date of purchase cannot be in the future.",
            months,
        )

    expiry = add_months(purchase_date, months)
    in_warranty = today <= expiry
    brand_display = brand.strip() or "Manufacturer"

    if in_warranty:
        summary = (
            f"{brand_display} standard warranty applies ({months} months from date of purchase). "
            f"Coverage runs until {expiry.strftime('%d %b %Y')} (subject to inspection and policy rules)."
        )
    else:
        summary = (
            f"No active {brand_display} standard warranty based on your purchase date "
            f"({months}-month period ended {expiry.strftime('%d %b %Y')}). "
            "You can continue to upload documents in the next step."
        )

    return in_warranty, summary, months
