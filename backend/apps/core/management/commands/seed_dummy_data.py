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
# Replace or extend via Django admin when the client supplies the final taxonomy.
ISSUE_SEED = [
    (
        "CAT_DISPLAY",
        "Display & touchscreen",
        10,
        [
            ("DISP_CRACK", "Cracked / shattered glass", 0),
            ("DISP_NO_TOUCH", "Touch not responding", 1),
            ("DISP_IMAGE", "Lines, spots, or discolouration", 2),
        ],
    ),
    (
        "CAT_POWER",
        "Power & charging",
        20,
        [
            ("PWR_NO_POWER", "Won't power on", 0),
            ("PWR_BATTERY", "Battery drains fast / won't hold charge", 1),
            ("PWR_CHARGE_PORT", "Charging port / cable issue", 2),
        ],
    ),
    (
        "CAT_AUDIO",
        "Audio",
        30,
        [
            ("AUD_SPEAKER", "Speaker / earpiece fault", 0),
            ("AUD_MIC", "Microphone fault", 1),
        ],
    ),
    (
        "CAT_CONNECT",
        "Connectivity",
        40,
        [
            ("NET_WIFI", "Wi‑Fi issues", 0),
            ("NET_CELL", "Mobile signal / SIM", 1),
            ("NET_BT", "Bluetooth", 2),
        ],
    ),
    (
        "CAT_CAMERA",
        "Camera",
        50,
        [
            ("CAM_REAR", "Rear camera fault", 0),
            ("CAM_FRONT", "Front camera fault", 1),
        ],
    ),
    (
        "CAT_SOFTWARE",
        "Software & system",
        60,
        [
            ("SW_CRASH", "Freezes / crashes", 0),
            ("SW_UPDATE", "Update / restore needed", 1),
        ],
    ),
    (
        "CAT_OTHER",
        "Other / not listed",
        90,
        [
            ("OTH_WATER", "Liquid damage suspected", 0),
            ("OTH_UNKNOWN", "Not sure — needs assessment", 1),
        ],
    ),
]


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

        for cat_code, cat_label, cat_sort, faults in ISSUE_SEED:
            cat, _ = RepairIssueCategory.objects.update_or_create(
                code=cat_code,
                defaults={
                    "label": cat_label,
                    "sort_order": cat_sort,
                    "is_active": True,
                },
            )
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
        for ref, status, dev_idx in JOB_SEED:
            device = devices[dev_idx] if dev_idx is not None else None
            job, created = RepairJob.objects.update_or_create(
                job_reference=ref,
                defaults={
                    "status": status,
                    "device": device,
                    "customer_email": demo_track_email,
                    "organization": demo_org,
                    "notes": "Seeded demo job — replace when ERP integration is live.",
                },
            )
            self.stdout.write(
                f"  Job {'created' if created else 'updated'}: {job.job_reference} ({job.get_status_display()})"
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Dummy data ready. APIs: /api/devices/, /api/repair-jobs/, /api/booking/issue-options/."
            )
        )
