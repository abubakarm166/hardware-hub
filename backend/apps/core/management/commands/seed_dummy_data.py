from django.core.management.base import BaseCommand

from apps.core.models import (
    DeviceCatalog,
    Organization,
    RepairFaultCode,
    RepairIssueCategory,
    RepairJob,
    RepairTariff,
)


# Sample catalog — representative multi-brand line-up (dummy data).
DEVICE_SEED = [
    ("Samsung", "Galaxy S24 Ultra", "SM-S928B"),
    ("Samsung", "Galaxy A55 5G", "SM-A556E"),
    ("Apple", "iPhone 15 Pro", "A3101"),
    ("Apple", "iPhone 14", "A2882"),
    ("Huawei", "P60 Pro", "MNA-LX9"),
    ("OPPO", "Find X7 Ultra", "PHY110"),
    ("Xiaomi", "14 Ultra", "24030PN60G"),
    ("Google", "Pixel 8 Pro", "G1MNW"),
    ("Motorola", "Edge 50 Pro", "XT2403-1"),
]

# (job_reference, status, device_index or None)
JOB_SEED = [
    ("HH-DEMO-240001", RepairJob.Status.RECEIVED, 0),
    ("HH-DEMO-240002", RepairJob.Status.UNDER_ASSESSMENT, 2),
    ("HH-DEMO-240003", RepairJob.Status.REPAIR_IN_PROGRESS, 4),
    ("HH-DEMO-240004", RepairJob.Status.AWAITING_PARTS, 1),
    ("HH-DEMO-240005", RepairJob.Status.COMPLETED, 5),
    ("HH-DEMO-240006", RepairJob.Status.READY_FOR_RETURN, 3),
]

# (category_code, label, sort_order, [(fault_code, label, sort_order), ...])
# Client booking taxonomy (Excel). Re-run: python manage.py seed_dummy_data
ISSUE_SEED = [
    (
        "CAT_AUDIO",
        "Audio",
        10,
        [
            ("AUD_DISTORT", "Distorted / crackling / popping audio", 0),
            ("AUD_EARPIECE", "Earpiece (call audio) not working", 1),
            ("AUD_LOW_VOL", "Low volume or muffled sound", 2),
            ("AUD_MIC", "Microphone not working / muffled", 3),
            ("AUD_NO_OUT", "No audio output (speaker dead)", 4),
            ("AUD_STEREO", "Only speaker channel missing (stereo phones)", 5),
        ],
    ),
    (
        "CAT_BACK_COVER",
        "Back Cover Damaged",
        20,
        [
            ("BC_CRACK", "Back cover / glass cracked or shattered", 0),
            ("BC_SCRATCH", "Back cover heavily scratched / scuffed", 1),
            ("BC_LOOSE", "Back cover loose / detached / rattling", 2),
            ("BC_WATER", "Signs of water ingress on back cover", 3),
        ],
    ),
    (
        "CAT_CAMERA",
        "Camera",
        30,
        [
            ("CAM_BLUR", "Blurry / out of focus images", 0),
            ("CAM_APP_CRASH", "Camera app crashes or black screen", 1),
            ("CAM_ARTIFACT", "Color distortion / lines / artifacts", 2),
            ("CAM_FLASH", "Flash / torch not working", 3),
            ("CAM_FRONT", "Front camera not working / no image", 4),
            ("CAM_LENS", "Lens scratched / damaged / fogged", 5),
            ("CAM_REAR", "Rear camera not working / no image", 6),
        ],
    ),
    (
        "CAT_CHARGER_BATTERY",
        "Charger / Battery Life",
        40,
        [
            ("BAT_DRAIN", "Battery drains quickly", 0),
            ("BAT_HOLD", "Battery not holding charge", 1),
            ("BAT_SWOLLEN", "Battery swollen / bulging", 2),
            ("BAT_PORT", "Charging port loose / damaged", 3),
            ("BAT_NO_CHARGE", "Device won't charge at all", 4),
            ("BAT_HOT", "Overheating during charging", 5),
            ("BAT_SLOW", "Slow or intermittent charging", 6),
        ],
    ),
    (
        "CAT_KEYPAD",
        "Keypad",
        50,
        [
            ("KEY_NAV", "Home / other navigation button issues", 0),
            ("KEY_STUCK", "Keys sticky / jammed / require hard press", 1),
            ("KEY_POWER", "Power button faulty / unresponsive", 2),
            ("KEY_SPECIFIC", "Specific keys / buttons not responding", 3),
            ("KEY_VOLUME", "Volume buttons not working", 4),
        ],
    ),
    (
        "CAT_FREEZING",
        "Phone Freezing",
        60,
        [
            ("FRZ_NORMAL", "Freezes / locks up during normal use", 0),
            ("FRZ_BOOT", "Freezes during boot / startup", 1),
            ("FRZ_HEAT", "Freezing accompanied by overheating", 2),
        ],
    ),
    (
        "CAT_SIGNAL",
        "Poor Signal",
        70,
        [
            ("SIG_DROPS", "Dropped calls / intermittent signal", 0),
            ("SIG_NONE", "No signal / no service", 1),
            ("SIG_ANTENNA", "Physical antenna damage visible", 2),
            ("SIG_WEAK", "Poor / weak signal reception", 3),
        ],
    ),
    (
        "CAT_POWER",
        "Power Problem",
        80,
        [
            ("PWR_OVERHEAT", "Device overheats excessively", 0),
            ("PWR_NO_ON", "Device won't power on at all", 1),
            ("PWR_INTERMIT", "Intermittent power issues", 2),
            ("PWR_SHUTDOWN", "Random shutdowns / reboots", 3),
        ],
    ),
    (
        "CAT_RINGER",
        "Ringer / Vibrator",
        90,
        [
            ("RNG_SILENT", "No ringer / silent (even when volume up)", 0),
            ("RNG_LOW", "Ring volume too low / distorted", 1),
            ("RNG_NO_VIB", "Vibrator / haptic feedback not working", 2),
            ("RNG_VIB_WEAK", "Vibrator weak / intermittent", 3),
        ],
    ),
    (
        "CAT_SCREEN",
        "Screen",
        100,
        [
            ("SCR_BLEED", "Backlight bleed / uneven brightness", 0),
            ("SCR_CRACK", "Cracked / shattered screen (glass only)", 1),
            ("SCR_DEAD", "Dead pixels / lines / discoloration", 2),
            ("SCR_BLACK", "Screen black / no display", 3),
            ("SCR_FLICKER", "Screen flickers / flickers then goes black", 4),
            ("SCR_TOUCH", "Touchscreen unresponsive / ghost touches", 5),
        ],
    ),
    (
        "CAT_SIM",
        "SIM Card",
        110,
        [
            ("SIM_DUAL", "Dual SIM — one works, other doesn't", 0),
            ("SIM_NOT_DETECTED", "SIM card not detected", 1),
            ("SIM_ERROR", "SIM error / no service (one or both SIMs)", 2),
            ("SIM_TRAY", "SIM tray damaged / stuck / bent", 3),
        ],
    ),
    (
        "CAT_OTHER",
        "Other",
        120,
        [
            ("OTH_WATER", "Liquid damage suspected", 0),
            ("OTH_MULTIPLE", "Multiple faults / needs assessment", 1),
            ("OTH_UNKNOWN", "Not sure — describe below", 2),
        ],
    ),
]

ISSUE_CATEGORY_CODES = {row[0] for row in ISSUE_SEED}


class Command(BaseCommand):
    help = "Insert or update dummy DeviceCatalog and RepairJob rows for demos and the public site."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo jobs (HH-DEMO-*) and re-seed devices from scratch.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            deleted_jobs, _ = RepairJob.objects.filter(job_reference__startswith="HH-DEMO-").delete()
            self.stdout.write(self.style.WARNING(f"Removed {deleted_jobs} demo repair job(s)."))
            DeviceCatalog.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared device catalog."))

        devices: list[DeviceCatalog] = []
        for brand, model_name, sku in DEVICE_SEED:
            obj, created = DeviceCatalog.objects.update_or_create(
                brand=brand,
                model_name=model_name,
                defaults={"sku": sku, "is_active": True},
            )
            devices.append(obj)
            self.stdout.write(
                f"  Device {'created' if created else 'updated'}: {obj.brand} {obj.model_name}"
            )

        tariff_rows = [
            ("assessment", "Workshop assessment & diagnostics", 0, 34_900, 0),
            ("display_assy", "Display assembly (indicative)", 489_000, 89_900, 1),
            ("battery", "Battery replacement (indicative)", 129_000, 49_900, 2),
        ]
        for dev in devices:
            for code, label, parts_cents, labour_cents, sort_order in tariff_rows:
                t, t_created = RepairTariff.objects.update_or_create(
                    device=dev,
                    code=code,
                    defaults={
                        "label": label,
                        "parts_cents": parts_cents,
                        "labour_cents": labour_cents,
                        "sort_order": sort_order,
                        "is_active": True,
                    },
                )
                if t_created:
                    self.stdout.write(f"  Tariff created: {dev.brand} {dev.model_name} — {label}")

        RepairIssueCategory.objects.exclude(code__in=ISSUE_CATEGORY_CODES).update(
            is_active=False
        )
        RepairFaultCode.objects.exclude(category__code__in=ISSUE_CATEGORY_CODES).update(
            is_active=False
        )

        for cat_code, cat_label, cat_sort, faults in ISSUE_SEED:
            cat, _ = RepairIssueCategory.objects.update_or_create(
                code=cat_code,
                defaults={
                    "label": cat_label,
                    "sort_order": cat_sort,
                    "is_active": True,
                },
            )
            active_fault_codes = {fc[0] for fc in faults}
            RepairFaultCode.objects.filter(category=cat).exclude(
                code__in=active_fault_codes
            ).update(is_active=False)
            for fc_code, fc_label, fc_sort in faults:
                RepairFaultCode.objects.update_or_create(
                    category=cat,
                    code=fc_code,
                    defaults={
                        "label": fc_label,
                        "sort_order": fc_sort,
                        "is_active": True,
                    },
                )
            self.stdout.write(f"  Issue category ready: {cat.code}")

        demo_org, _ = Organization.objects.get_or_create(
            slug="demo-corp",
            defaults={
                "name": "Demo Corporate Ltd",
                "sla_target_days": 5,
            },
        )

        demo_track_email = "demo-track@hardwarehub.test"
        demo_track_imei = "356789012345678"  # 15 digits — use with demo email for IMEI track lookup
        for ref, status, dev_idx in JOB_SEED:
            device = devices[dev_idx] if dev_idx is not None else None
            defaults = {
                "status": status,
                "device": device,
                "customer_email": demo_track_email,
                "organization": demo_org,
                "notes": "Seeded demo job — replace when ERP integration is live.",
            }
            if ref == "HH-DEMO-240001":
                defaults["imei"] = demo_track_imei
            job, created = RepairJob.objects.update_or_create(
                job_reference=ref,
                defaults=defaults,
            )
            self.stdout.write(
                f"  Job {'created' if created else 'updated'}: {job.job_reference} ({job.get_status_display()})"
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Dummy data ready. APIs: /api/devices/, /api/repair-jobs/, /api/booking/issue-options/."
            )
        )
