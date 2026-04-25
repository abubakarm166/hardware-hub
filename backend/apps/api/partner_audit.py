from __future__ import annotations

from typing import Any

from django.contrib.auth.models import AbstractBaseUser

from apps.core.models import AuditLog


def log_partner_action(
    *,
    user: AbstractBaseUser,
    action: str,
    entity_type: str,
    entity_id: str = "",
    metadata: dict[str, Any] | None = None,
) -> None:
    AuditLog.objects.create(
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata={
            "user_id": user.pk,
            "username": user.username,
            **(metadata or {}),
        },
    )
