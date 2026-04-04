import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = (
        "Create a staff superuser when BOOTSTRAP_ADMIN=1. "
        "Set BOOTSTRAP_ADMIN_USERNAME (default admin), BOOTSTRAP_ADMIN_PASSWORD, "
        "optional BOOTSTRAP_ADMIN_EMAIL. Uses set_password so short passwords work."
    )

    def handle(self, *args, **options):
        flag = os.environ.get("BOOTSTRAP_ADMIN", "").strip().lower()
        if flag not in ("1", "true", "yes", "on"):
            return

        username = os.environ.get("BOOTSTRAP_ADMIN_USERNAME", "admin").strip() or "admin"
        password = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD", "")
        email = os.environ.get("BOOTSTRAP_ADMIN_EMAIL", "admin@localhost").strip() or "admin@localhost"

        if not password:
            self.stderr.write(
                self.style.ERROR("BOOTSTRAP_ADMIN=1 requires BOOTSTRAP_ADMIN_PASSWORD.")
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User {username!r} already exists; skipping."))
            return

        user = User(
            username=username,
            email=email,
            is_staff=True,
            is_superuser=True,
        )
        user.set_password(password)
        user.save()
        self.stdout.write(self.style.SUCCESS(f"Created superuser {username!r}."))
