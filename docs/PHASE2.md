# Hardware Hub — Phase 2: How we will build it

This document explains **what Phase 2 adds** on top of [Phase 1](PHASE1.md) and **how we will implement it**—milestones, technical approach, and where work lands in the repo. It is a living plan: dates and vendor choices (e.g. PayFast vs another gateway) can be updated as decisions are made.

**Shipped work log (dated):** [PHASE2_PROGRESS.md](PHASE2_PROGRESS.md)

**ERP without vendor lock-in:** [ERP_INTEGRATION.md](ERP_INTEGRATION.md)

---

## 1. What Phase 2 is

Phase 1 delivered the **marketing shell**, **placeholder routes**, and **foundational models** (`DeviceCatalog`, `RepairJob`, `AuditLog`) with a DRF API that is barely used by the public site.

**Phase 2** turns the platform into an **operational product**: real booking and tracking, money movement, logistics hooks, durable file storage, customer communications, and—when ready—ERP alignment and a **corporate B2B** surface.

---

## 2. Principles (how we work)

1. **Backend-first for truth** — Job state, payments, and documents are owned by Django; the Next.js app is a client (and may use Server Actions or Route Handlers to call the API securely).
2. **PostgreSQL in staging/production** — Phase 2 assumes a real database for concurrency, backups, and growth (SQLite remains fine for quick local experiments only).
3. **Small releasable slices** — Ship **track-before-pay** or **book-without-courier** if it reduces risk; avoid a single “big bang” release.
4. **POPIA by design** — Log access to personal data (`AuditLog` and friends), minimise retention, encrypt secrets, document subprocessors.
5. **Integrations behind interfaces** — ERP, courier, and payment adapters should be **swappable** (abstract client + webhook handlers) so tests and outages are manageable.

---

## 3. Recommended milestone order

This order balances **user value**, **dependency chains**, and **learning** about your real workshop process.

| Milestone | Focus | Outcome |
|-----------|--------|---------|
| **2A — Core consumer flows** | Auth (light), booking API + UI, tracking API + UI, notifications (email first) | Customers can create and follow real jobs end-to-end without ERP. |
| **2B — Money & assets** | PayFast (or chosen gateway), cloud file storage for RMA/photos | Deposits/settlement and compliant document handling. |
| **2C — Logistics** | Courier provider API(s), waybill status | Collection/delivery visible in tracking. |
| **2D — ERP** | Chosen operations system: warranty/job sync, status updates | Single source of truth for operations; web stays in sync. |
| **2E — Corporate B2B** | Partner accounts, bulk RMA, SLA views, invoicing exports | Segments from `/corporate` become logged-in experiences. |

**Note:** **2D** and **2E** can overlap with **2C** once **2A** is stable; some teams start B2B intake before full ERP if partners need CSV/API upload first.

---

## 4. Workstreams — how each part gets done

### 4.1 API hardening and contracts

- **What:** Version or document public endpoints (e.g. `/api/v1/...`), consistent error shape, pagination, rate limits on anonymous lookup.
- **Where:** `backend/apps/api/`, new serializers/views as needed, `backend/config/settings.py` for throttling/CORS.
- **How:** OpenAPI schema (drf-spectacular or similar) optional but useful for frontend codegen and partner docs.

### 4.2 Identity and access

- **Consumer:** Email magic link, OTP, or classic email+password—pick one strategy and stick to it for Phase 2. Sessions or JWT: if Next.js talks server-side to Django, **httpOnly cookies** issued by the API (or BFF pattern) are usually simpler than exposing tokens in the browser.
- **Staff:** Django admin remains; add **role flags** or groups before building custom dashboards.
- **B2B (2E):** Separate “organisation” model, membership, and permissions (who can upload bulk RMA, who sees invoices).

### 4.3 Book repair (`/book-repair`)

- **Backend:** Endpoints to resolve device (from `DeviceCatalog` or ERP), create `RepairJob`, attach customer details, optional draft vs confirmed state.
- **Frontend:** `frontend/src/app/book-repair/` — multi-step form, validation, optimistic UI where safe, clear error messages from API.
- **How:** Start with **manual device selection** + reference generation; add IMEI/warranty when ERP or rules exist.

### 4.4 Track repair (`/track`)

- **Backend:** Read-only (or scoped) job lookup by reference + verification (e.g. email or SMS code) to prevent enumeration.
- **Frontend:** Timeline UI driven by status history; later, courier events merged into the same timeline.

### 4.5 Payments (2B)

- **Backend:** Create payment intent/order, handle **webhooks** (idempotent), map to `RepairJob` or `Invoice` model, reconcile states (pending, paid, failed, refunded).
- **Config:** Secrets only in env (`backend/.env`); never in frontend. Use PayFast’s test mode until flows are proven.
- **Frontend:** Redirect or hosted checkout per gateway docs; return URL lands on confirmation page.

### 4.6 File storage (2B)

- **Backend:** Presigned upload URLs or direct upload to **S3-compatible** storage; virus scan policy if required; link files to `RepairJob`.
- **Never** accept unlimited anonymous uploads without auth and quotas.

### 4.7 Notifications

- **Start with email** (transactional provider: SendGrid, Postmark, SES, etc.).
- **SMS** optional for OTP and “out for delivery”—provider and POPIA consent recorded.
- **Backend:** Celery (or Django-Q) + Redis/RabbitMQ for async sends; retry and dead-letter handling.

### 4.8 Courier integration (2C)

- **Adapter module** in backend: `book_collection`, `track_parcel`, webhook for status updates.
- **Data:** Store carrier name, tracking number, and raw payload references on the job or a related `Shipment` model.

### 4.9 External ERP (2D)

- **Approach:** Define **sync direction** (master for price/warranty in ERP vs web for customer-facing copy). Implement **idempotent** upserts and a **reconciliation job** (scheduled) plus manual “force sync” in admin.
- **Where:** New `apps.integrations` or `apps.erp` package; **no** ERP SDK calls scattered in views.

### 4.10 Corporate B2B portal (2E)

- **Backend:** Org-scoped APIs, bulk CSV/Excel upload validation, async processing for large batches, SLA fields on jobs or contracts.
- **Frontend:** New route group e.g. `frontend/src/app/(partner)/` or subdomain later; reuse design tokens from `globals.css`.
- **Auth:** Stronger requirements (2FA for admins); audit every export and bulk action.

---

## 5. Frontend integration pattern

1. **Server-side fetch** from Next.js Route Handlers or Server Components where credentials must stay secret.
2. **Shared types:** Generate from OpenAPI or maintain a thin `frontend/src/lib/api-types.ts`.
3. **Revalidate** or **client refetch** after mutations (React Query/TanStack Query is a good fit for forms and tracking).
4. Keep **`NEXT_PUBLIC_*`** only for non-secret values (e.g. public site URL); API keys stay on Django or Next server only.

---

## 6. Environments and checklists

Before calling Phase 2 “live” for real customers:

- [ ] PostgreSQL with backups
- [ ] `DEBUG=false`, strong `SECRET_KEY`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, CORS allowlist
- [ ] HTTPS everywhere
- [ ] Error monitoring (e.g. Sentry) on frontend and backend
- [ ] Webhook endpoints authenticated and idempotent (payments, courier)
- [ ] Privacy policy and consent for marketing vs transactional comms

---

## 7. Where to look in the repo today

| Area | Location |
|------|----------|
| Public pages | `frontend/src/app/` |
| Layout / nav | `frontend/src/components/layout/` |
| Core models | `backend/apps/core/models.py` |
| API routes | `backend/apps/api/` |
| Phase 1 scope recap | [PHASE1.md](PHASE1.md) |
| Deploy notes | [README.md](../README.md), `docs/HOSTING_*.md` |

---

## 8. Summary

Phase 2 is implemented as **milestones 2A–2E**: consumer flows and notifications first, then payments and files, then couriers, then ERP and B2B. Each slice extends the same Django models and Next.js routes you already have, with **clear API contracts** and **integration boundaries** so vendors and workflows can change without rewriting the whole app.

---

*Update this file when milestone scope or vendor choices change.*
