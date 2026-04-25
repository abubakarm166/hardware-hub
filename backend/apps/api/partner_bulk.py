"""
Parse partner CSV and create repair jobs. Expected header includes `imei` (case-insensitive).
Optional: partner_reference, customer_email, notes
"""

from __future__ import annotations

import csv
import secrets
from io import StringIO
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.core.models import BulkRmaUpload, Organization, RepairJob

MAX_ROWS = 500


def _norm_header(h: str) -> str:
    return (h or "").strip().lower().replace(" ", "_")


def _unique_job_reference(org: Organization) -> str:
    for _ in range(20):
        ref = f"B2B-{org.pk}-{secrets.token_hex(3).upper()}"
        if not RepairJob.objects.filter(job_reference=ref).exists():
            return ref
    raise RuntimeError("Could not allocate job reference")


def process_bulk_rma_csv(
    *,
    organization: Organization,
    csv_text: str,
    upload: BulkRmaUpload,
) -> dict[str, Any]:
    text = csv_text.strip()
    if not text:
        return {"error": "Empty CSV."}

    reader = csv.DictReader(StringIO(text), skipinitialspace=True)
    if not reader.fieldnames:
        return {"error": "Missing CSV header row."}

    field_map = {_norm_header(h): h for h in reader.fieldnames if h}
    imei_key = None
    for candidate in ("imei", "imei1", "imei_1"):
        if candidate in field_map:
            imei_key = field_map[candidate]
            break
    if not imei_key:
        return {"error": "CSV must include an `imei` column."}

    pref_key = field_map.get("partner_reference") or field_map.get("reference")
    email_key = field_map.get("customer_email") or field_map.get("email")
    notes_key = field_map.get("notes") or field_map.get("note")

    rows_in_file = list(reader)
    if len(rows_in_file) == 0:
        return {"error": "No data rows in CSV (header only)."}
    if len(rows_in_file) > MAX_ROWS:
        return {"error": f"Maximum {MAX_ROWS} data rows per upload."}

    row_results: list[dict[str, Any]] = []
    valid = 0
    invalid = 0
    jobs_created = 0
    seen_imeis: set[str] = set()

    with transaction.atomic():
        for i, raw in enumerate(rows_in_file, start=2):
            line_no = i
            raw_imei = (raw.get(imei_key) or "").strip()
            digits = "".join(c for c in raw_imei if c.isdigit())
            err: str | None = None
            if len(digits) != 15:
                err = "IMEI must be exactly 15 digits."
            elif digits in seen_imeis:
                err = "Duplicate IMEI in this file."
            if err:
                invalid += 1
                row_results.append({"line": line_no, "imei": raw_imei or digits, "ok": False, "error": err})
                continue

            seen_imeis.add(digits)
            pref = ""
            if pref_key:
                pref = (raw.get(pref_key) or "").strip()[:128]
            cust_email = ""
            if email_key:
                cust_email = (raw.get(email_key) or "").strip()[:254]
            note_row = ""
            if notes_key:
                note_row = (raw.get(notes_key) or "").strip()[:2000]

            ref = _unique_job_reference(organization)
            notes_parts = [f"Bulk RMA upload #{upload.pk}", f"IMEI {digits}"]
            if note_row:
                notes_parts.append(note_row)
            RepairJob.objects.create(
                job_reference=ref,
                status=RepairJob.Status.RECEIVED,
                organization=organization,
                partner_reference=pref,
                customer_email=cust_email,
                device=None,
                notes="\n".join(notes_parts),
            )
            valid += 1
            jobs_created += 1
            row_results.append(
                {
                    "line": line_no,
                    "imei": digits,
                    "ok": True,
                    "job_reference": ref,
                }
            )

        upload.row_count = len(rows_in_file)
        upload.valid_row_count = valid
        upload.invalid_row_count = invalid
        upload.jobs_created_count = jobs_created
        upload.row_results = row_results
        upload.status = BulkRmaUpload.Status.COMPLETED
        upload.processed_at = timezone.now()
        upload.notes = f"Processed {valid} valid, {invalid} invalid rows."
        upload.save(
            update_fields=[
                "row_count",
                "valid_row_count",
                "invalid_row_count",
                "jobs_created_count",
                "row_results",
                "status",
                "processed_at",
                "notes",
            ]
        )

    return {
        "valid": valid,
        "invalid": invalid,
        "jobs_created": jobs_created,
        "row_results": row_results,
    }
