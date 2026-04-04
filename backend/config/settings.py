import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY", "dev-only-change-in-production-not-for-staging-or-prod"
)

DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() in ("1", "true", "yes")


def _normalize_hostname(raw: str) -> str:
    """Strip scheme/path/port so pasted URLs work in DJANGO_ALLOWED_HOSTS."""
    h = raw.strip()
    if not h:
        return ""
    for prefix in ("https://", "http://"):
        if h.startswith(prefix):
            h = h[len(prefix) :]
            break
    return h.split("/")[0].split(":")[0].strip()


def _build_allowed_hosts() -> list[str]:
    raw = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")
    hosts: list[str] = []
    for part in raw.split(","):
        n = _normalize_hostname(part)
        if n and n not in hosts:
            hosts.append(n)
    # Optional single host (e.g. Railway) if you prefer not to edit the comma list
    extra = _normalize_hostname(os.environ.get("PUBLIC_HOSTNAME", ""))
    if extra and extra not in hosts:
        hosts.append(extra)
    return hosts


ALLOWED_HOSTS = _build_allowed_hosts()

# Django 4+ — HTTPS admin / forms behind a proxy (e.g. Vercel). Comma-separated origins, no path.
_csrf_origins = os.environ.get("CSRF_TRUSTED_ORIGINS", "").strip()
CSRF_TRUSTED_ORIGINS = (
    [o.strip() for o in _csrf_origins.split(",") if o.strip()] if _csrf_origins else []
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "apps.core",
    "apps.api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

USE_SQLITE = os.environ.get("USE_SQLITE", "true").lower() in ("1", "true", "yes")

# Production on Vercel / serverless: set DATABASE_URL to PostgreSQL (Neon, Supabase, Railway, etc.).
# Do not raise here if missing — Vercel’s build imports settings before all env vars are applied;
# SQLite at runtime on Vercel is read-only (OperationalError) until DATABASE_URL is set.
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=0,
        )
    }
elif USE_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("POSTGRES_DB", "hardware_hub"),
            "USER": os.environ.get("POSTGRES_USER", "postgres"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", ""),
            "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-za"
TIME_ZONE = "Africa/Johannesburg"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
# Required for `manage.py collectstatic` (local deploys, some hosts).
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}

CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]
