from django.contrib import admin
from django.urls import include, path

from apps.api import views as api_views

urlpatterns = [
    path("admin/", admin.site.urls),
    # Some hosts (e.g. Railway) default health checks to /healthcheck — same JSON as /api/health/
    path("healthcheck/", api_views.health),
    path("api/", include("apps.api.urls")),
]
