from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone

from apps.core.models import ContactMessage

logger = logging.getLogger(__name__)


def _body(message: ContactMessage) -> str:
    created = timezone.localtime(message.created_at) if message.created_at else timezone.localtime()
    rows = [
        ("Name", message.name),
        ("Email", message.email),
        ("Phone", message.phone),
        ("Company", message.company_name),
        ("Region", message.region),
        ("Enquiry type", message.lead_type),
        ("Received", created.strftime("%Y-%m-%d %H:%M %Z")),
    ]
    lines = [f"{label}: {value}" for label, value in rows if value]
    lines.append("")
    lines.append("Message:")
    lines.append(message.message)
    return "\n".join(lines)


def send_contact_notification(message: ContactMessage) -> bool:
    """
    Email the team a new contact submission.

    Never raises: the submission is already saved, so a mail outage must not turn a
    successful form post into an error for the visitor.
    """
    recipient = getattr(settings, "CONTACT_NOTIFICATION_EMAIL", "")
    if not recipient:
        return False

    try:
        email = EmailMessage(
            subject=f"New website enquiry — {message.name}",
            body=_body(message),
            to=[recipient],
            # Lets staff reply straight to the visitor from their inbox.
            reply_to=[message.email] if message.email else None,
        )
        email.send(fail_silently=False)
        return True
    except Exception:
        logger.exception("Contact notification failed for ContactMessage id=%s", message.pk)
        return False
