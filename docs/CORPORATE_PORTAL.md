# Corporate / B2B portal — glossary

Short definitions for stakeholders. The live app has **Partner login** (`/partner/login`) for authenticated users linked to an **organization** in Django admin.

## Bulk RMA

**RMA** = *Return Merchandise Authorisation* — the process of accepting a device (or batch of devices) into the repair workflow under a reference your partner or insurer uses.

**Bulk RMA** means the partner does **not** enter devices one-by-one on the consumer booking form. Instead they **upload many lines at once**, usually as a **CSV** or spreadsheet export from their own system (columns might include IMEI, serial, contract ID, fault code, etc.). The platform validates the file, creates or queues jobs, and (when ERP is connected) syncs with the workshop system.

## SLA

**SLA** = *Service Level Agreement* — the **contractual or operational time and quality targets** between Hardware Hub and the partner (e.g. “95% of jobs closed within 5 business days”, “same-day triage for insurer X”).

In software, the portal **surfaces SLA-related data**: deadlines, breaches, dashboards, and reports — often fed from job timestamps in your ERP or from rules stored in the platform.

## Invoices (partner-facing)

**Invoices** here mean **B2B billing documents**: monthly repair charges, excess fees, or service fees owed **by the partner to Hardware Hub** (or the reverse, depending on contract). The portal lists **invoice references**, amounts, periods, and **download links** (PDF or external billing system) so finance teams can reconcile without emailing spreadsheets.

---

## What the demo app does today

- **Partner login** (`/partner/login`) uses JWT access + refresh (refresh is stored for silent renewal).
- **Organizations & roles**: users are linked via `OrganizationMember` (`admin` or `member`). **Bulk RMA** and **inviting teammates** require **admin** on that organization.
- **Bulk RMA** (`POST /api/partner/rma/bulk/`): CSV must include an **`imei`** column (15 digits per row). Optional columns: **`partner_reference`**, **`customer_email`**, **`notes`**. Valid rows create **`RepairJob`** rows scoped to the org. Per-row results and counts are stored on **`BulkRmaUpload`**. List/history: **`GET /api/partner/rma/uploads/`** (detail: **`/api/partner/rma/uploads/<id>/`**).
- **Jobs & SLA (stub)**: **`GET /api/partner/jobs/`** (and job detail by reference). **`GET /api/partner/sla/`** returns open job counts, completions in the last 30 days, and a **heuristic** “breach” count (completed jobs in the last 90 days where calendar days from created → updated exceed the org’s `sla_target_days`).
- **Invites**: partner admins can **`POST /api/partner/invites/`**; recipients open **`/partner/accept?token=…`**, set username/password, and get an **`OrganizationMember`** row. Invite lookup is public: **`GET /api/partner/invites/lookup/?token=`**.
- **Audit**: bulk processing, invite create, and invite accept append rows to **`AuditLog`** (with user metadata).

ERP sync and production-grade SLA reporting remain integration follow-ons.
