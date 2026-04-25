from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("devices/", views.DeviceCatalogListView.as_view(), name="device-list"),
    path("repair-jobs/", views.RepairJobPublicListView.as_view(), name="repair-job-list"),
    path("contact/", views.ContactMessageCreateView.as_view(), name="contact-create"),
    path(
        "booking/warranty-check/",
        views.WarrantyCheckView.as_view(),
        name="booking-warranty-check",
    ),
    path("booking/quote/", views.QuoteView.as_view(), name="booking-quote"),
    path(
        "booking/issue-options/",
        views.BookingIssueOptionsView.as_view(),
        name="booking-issue-options",
    ),
    path("booking/submit/", views.BookingSubmitView.as_view(), name="booking-submit"),
    path("tracking/lookup/", views.TrackLookupView.as_view(), name="tracking-lookup"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("partner/me/", views.PartnerMeView.as_view(), name="partner-me"),
    path("partner/jobs/", views.PartnerJobListView.as_view(), name="partner-jobs"),
    path(
        "partner/jobs/<str:job_reference>/",
        views.PartnerJobDetailView.as_view(),
        name="partner-job-detail",
    ),
    path("partner/sla/", views.PartnerSlaSummaryView.as_view(), name="partner-sla"),
    path(
        "partner/rma/uploads/",
        views.PartnerBulkRmaListView.as_view(),
        name="partner-rma-upload-list",
    ),
    path(
        "partner/rma/uploads/<int:pk>/",
        views.PartnerBulkRmaDetailView.as_view(),
        name="partner-rma-upload-detail",
    ),
    path("partner/rma/bulk/", views.PartnerBulkRmaView.as_view(), name="partner-rma-bulk"),
    path("partner/invoices/", views.PartnerInvoiceListView.as_view(), name="partner-invoices"),
    path("partner/invites/", views.PartnerInviteCreateView.as_view(), name="partner-invite-create"),
    path(
        "partner/invites/lookup/",
        views.PartnerInviteLookupView.as_view(),
        name="partner-invite-lookup",
    ),
    path(
        "partner/invites/accept/",
        views.PartnerInviteAcceptView.as_view(),
        name="partner-invite-accept",
    ),
]
