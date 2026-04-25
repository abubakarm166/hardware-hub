# Phase 2 — what we have built so far

Simple summary for managers. Technical detail lives in [PHASE2.md](PHASE2.md). ERP wiring is vendor-neutral — see [ERP_INTEGRATION.md](ERP_INTEGRATION.md).

---

## Update — 3 April 2026

### In short

Customers can start **Book a repair** on the website. The main steps on screen are:

1. **Pick a device** — catalog model or **15-digit IMEI**.
2. **Issue** — category + fault code + optional free-text description.
3. **Warranty check** — configurable warranty URL when connected; otherwise in-app result.
4. **Quote** — catalog tariffs or generic band (IMEI-only).
5. **Documents (optional)** — proof of purchase, damage photos, other PDF/images (limits apply).
6. **Your details** — contact + address.
7. **Review & submit** — then confirmation with job reference.

### What works today

- Booking wizard (**8 steps** before success): device → issue (category + fault + text) → warranty → quote → **optional documents** (PDF/JPEG/PNG/WEBP, up to 8×5 MB) → contact → review → confirmation. Submissions create `RepairJob` + `RepairJobAttachment` rows; files live under `MEDIA_ROOT` (see Django admin on the job).
- **Warranty:** HTTP integration is **not tied to any ERP brand** — set `ERP_WARRANTY_API_URL` (or alternatives in `.env.example`) when ready.
- **Pricing:** managed in **Django admin** (per device model). Staff can change prices there.
- **What is still to do:** **PayFast** payments, **courier** booking, **email/SMS** confirmations, cloud object storage for production scale, full **ERP job sync**, consumer login (beyond partner JWT), and polish on the **business portal**.

### What we need from the client

- **Warranty:** the **HTTPS warranty endpoint** (and authentication), once they have chosen an ERP or middleware — not a specific product name.

---

### Later update — partner & tracking

- **Track repair:** `POST /api/tracking/lookup/` with job reference + email (must match `RepairJob.customer_email`). Timeline UI on `/track`. Demo email set by `seed_dummy_data`.
- **Contact:** honeypot field `website` (must be empty) on API + form.
- **Auth:** JWT via `djangorestframework-simplejwt` — `POST /api/auth/token/` with Django `username` + `password`.
- **Corporate portal:** models `Organization`, `OrganizationMember`, `BulkRmaUpload`, `PartnerInvoiceRecord`; pages `/partner/login`, `/partner/dashboard`; glossary on `/corporate#glossary` and **[CORPORATE_PORTAL.md](CORPORATE_PORTAL.md)**.

---

*Last updated: 3 April 2026 (progress log appended 2026-04-21).*
