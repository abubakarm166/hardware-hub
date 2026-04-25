from rest_framework.throttling import AnonRateThrottle


class TrackLookupThrottle(AnonRateThrottle):
    """Limit anonymous job lookup attempts (anti-enumeration + abuse)."""

    rate = "60/hour"


class BookingSubmitThrottle(AnonRateThrottle):
    """Limit anonymous booking submissions."""

    rate = "25/hour"
