from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("devices/", views.DeviceCatalogListView.as_view(), name="device-list"),
    path("repair-jobs/", views.RepairJobPublicListView.as_view(), name="repair-job-list"),
    path("contact/", views.ContactMessageCreateView.as_view(), name="contact-create"),
]
