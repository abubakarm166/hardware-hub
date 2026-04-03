from django.core.management.base import BaseCommand

from apps.core.models import DeviceCatalog, RepairJob


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

        for ref, status, dev_idx in JOB_SEED:
            device = devices[dev_idx] if dev_idx is not None else None
            job, created = RepairJob.objects.update_or_create(
                job_reference=ref,
                defaults={
                    "status": status,
                    "device": device,
                    "customer_email": "",
                    "notes": "Seeded demo job — replace when Vision ERP integration is live.",
                },
            )
            self.stdout.write(
                f"  Job {'created' if created else 'updated'}: {job.job_reference} ({job.get_status_display()})"
            )

        self.stdout.write(self.style.SUCCESS("Dummy data ready. Run the site against /api/devices/ and /api/repair-jobs/."))
