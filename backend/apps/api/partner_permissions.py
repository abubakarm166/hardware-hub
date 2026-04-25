from rest_framework.permissions import BasePermission

from apps.core.models import OrganizationMember


class IsPartnerUser(BasePermission):
    """User belongs to at least one organization."""

    message = "Partner portal access requires organization membership."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return OrganizationMember.objects.filter(user=request.user).exists()


class IsPartnerAdmin(BasePermission):
    """User is an admin on at least one organization (used for mutating operations)."""

    message = "This action requires a partner admin role."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return OrganizationMember.objects.filter(
            user=request.user,
            role=OrganizationMember.Role.ADMIN,
        ).exists()
