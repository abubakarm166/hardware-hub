"""Validate files uploaded with consumer booking (POPIA: keep limits tight)."""

from __future__ import annotations

import os
from pathlib import Path

from django.core.files.uploadedfile import UploadedFile

MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024  # 5 MB per file
MAX_ATTACHMENTS_PER_REQUEST = 8
ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".pdf", ".webp"}


def validate_booking_files(files: list[UploadedFile]) -> None:
    if len(files) > MAX_ATTACHMENTS_PER_REQUEST:
        raise ValueError(
            f"Too many files (max {MAX_ATTACHMENTS_PER_REQUEST}). Remove some and try again."
        )
    for f in files:
        if f.size > MAX_ATTACHMENT_BYTES:
            raise ValueError(
                f'"{os.path.basename(f.name)}" is too large (max 5 MB per file).'
            )
        ext = Path(f.name).suffix.lower()
        if ext not in ALLOWED_SUFFIXES:
            raise ValueError(
                f'"{os.path.basename(f.name)}" is not an allowed type. '
                "Use PDF, JPG, PNG, or WEBP."
            )
