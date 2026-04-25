"""
Warranty check: optional HTTP call to the client's warranty endpoint (any ERP or middleware).

Configure ERP_WARRANTY_API_URL (or WARRANTY_PROVIDER_API_URL; legacy VISION_WARRANTY_API_URL).
Same request/response contract regardless of vendor — see docs/ERP_INTEGRATION.md.
"""

from __future__ import annotations

import json
import logging
import ssl
from dataclasses import dataclass
from http.client import HTTPResponse
from typing import TYPE_CHECKING, Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings

from .warranty_stub import stub_warranty_result

if TYPE_CHECKING:
    from apps.core.models import DeviceCatalog

logger = logging.getLogger(__name__)

# API response field for clients / analytics — not tied to a product name.
SOURCE_ERP_LIVE = "erp_live"
SOURCE_STUB = "erp_stub"


@dataclass
class WarrantyCheckOutcome:
    in_warranty: bool
    summary: str
    next_action: str
    source: str
    disclaimer: str
    error: str | None = None


def _build_request_payload(
    *,
    device: DeviceCatalog | None,
    imei_digits: str | None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "imei": imei_digits,
        "device_catalog_id": device.pk if device else None,
        "brand": device.brand if device else None,
        "model_name": device.model_name if device else None,
        "sku": device.sku if device else None,
    }
    return {k: v for k, v in payload.items() if v not in (None, "")}


def _coerce_bool(val: Any) -> bool | None:
    if isinstance(val, bool):
        return val
    if val in (1, "1", "true", "True", "yes", "Yes"):
        return True
    if val in (0, "0", "false", "False", "no", "No"):
        return False
    return None


def _normalize_erp_response(raw: dict[str, Any]) -> tuple[bool, str, str] | None:
    if not isinstance(raw, dict):
        return None
    iw = raw.get("in_warranty")
    if iw is None:
        iw = raw.get("warranty_active")
    if iw is None:
        iw = raw.get("is_under_warranty")
    flag = _coerce_bool(iw)
    if flag is None:
        return None

    summary = raw.get("summary") or raw.get("message") or ""
    if not isinstance(summary, str):
        summary = str(summary)
    summary = summary.strip()
    if not summary:
        summary = (
            "Manufacturer warranty applies for this device (subject to inspection and policy)."
            if flag
            else "No active manufacturer warranty on file. You can proceed to an out-of-warranty quote."
        )

    na = raw.get("next_action")
    if na not in ("warranty_intake", "out_of_warranty_quote"):
        na = "warranty_intake" if flag else "out_of_warranty_quote"

    return flag, summary, na


def _post_erp_warranty(payload: dict[str, Any]) -> dict[str, Any] | None:
    url = getattr(settings, "ERP_WARRANTY_API_URL", "") or ""
    if not url:
        return None

    timeout = int(getattr(settings, "ERP_WARRANTY_API_TIMEOUT", 15))
    api_key = (getattr(settings, "ERP_WARRANTY_API_KEY", "") or "").strip()
    verify_ssl = bool(getattr(settings, "ERP_WARRANTY_VERIFY_SSL", True))

    body = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    ctx = ssl.create_default_context()
    if not verify_ssl:
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

    req = Request(url, data=body, headers=headers, method="POST")
    try:
        with urlopen(req, timeout=timeout, context=ctx) as resp:
            if not isinstance(resp, HTTPResponse):
                return None
            if resp.status < 200 or resp.status >= 300:
                logger.warning("ERP warranty endpoint HTTP %s", resp.status)
                return None
            text = resp.read().decode("utf-8", errors="replace")
            data = json.loads(text)
            if not isinstance(data, dict):
                return None
            return data
    except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError, ValueError) as exc:
        logger.warning("ERP warranty endpoint request failed: %s", exc)
        return None


def resolve_warranty_check(
    *,
    device: DeviceCatalog | None,
    imei_digits: str | None,
) -> WarrantyCheckOutcome:
    """
    Call configured warranty URL when set; otherwise use the local stub.
    """
    api_url = getattr(settings, "ERP_WARRANTY_API_URL", "") or ""
    fallback_stub = bool(getattr(settings, "ERP_WARRANTY_FALLBACK_STUB", True))
    payload = _build_request_payload(device=device, imei_digits=imei_digits)

    if api_url:
        raw = _post_erp_warranty(payload)
        if raw is not None:
            normalized = _normalize_erp_response(raw)
            if normalized is not None:
                iw, summary, na = normalized
                return WarrantyCheckOutcome(
                    in_warranty=iw,
                    summary=summary,
                    next_action=na,
                    source=SOURCE_ERP_LIVE,
                    disclaimer="",
                )
            logger.warning("ERP warranty endpoint returned JSON we could not parse: %s", raw.keys())
        if not fallback_stub:
            return WarrantyCheckOutcome(
                in_warranty=False,
                summary="",
                next_action="out_of_warranty_quote",
                source=SOURCE_ERP_LIVE,
                disclaimer="",
                error="Warranty service is temporarily unavailable. Please try again later.",
            )
        iw, summary, na = stub_warranty_result(device=device, imei_digits=imei_digits)
        return WarrantyCheckOutcome(
            in_warranty=iw,
            summary=summary,
            next_action=na,
            source=SOURCE_STUB,
            disclaimer=(
                "The external warranty service did not return a valid response. "
                "Showing a temporary offline result — retry or contact support."
            ),
        )

    iw, summary, na = stub_warranty_result(device=device, imei_digits=imei_digits)
    return WarrantyCheckOutcome(
        in_warranty=iw,
        summary=summary,
        next_action=na,
        source=SOURCE_STUB,
        disclaimer=(
            "No warranty API is configured yet. Set ERP_WARRANTY_API_URL (or WARRANTY_PROVIDER_API_URL) "
            "when your ERP or middleware endpoint is ready."
        ),
    )
