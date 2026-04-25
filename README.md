# Hardware Hub — Phase 1 (MVP)

Premium repair-service web platform: **Next.js** frontend, **Django REST Framework** API, **PostgreSQL**-ready schema (SQLite by default for local dev).

## Repository layout

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js 15 (App Router, TypeScript, Tailwind) |
| `backend/` | Django 5 + DRF (`/api/health/` JSON health check) |

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+ (3.13 tested)
- Docker (optional, for PostgreSQL via `docker-compose.yml`)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pages: **Home**, **Services**, plus Book repair, Track, Corporate, Contact.

**Connect the site to the API:** copy `frontend/.env.local.example` to `frontend/.env.local` and set `API_URL` (and optionally `NEXT_PUBLIC_API_URL`) to your Django base URL, e.g. `http://127.0.0.1:8000`.

**Dummy data:** with the backend running, load sample devices and jobs:

```bash
cd backend
.\venv\Scripts\python manage.py seed_dummy_data
```

Use `seed_dummy_data --reset` to wipe demo rows and re-seed. The homepage “accreditations” strip, Services table, Track table, and Book repair examples read from `/api/devices/` and `/api/repair-jobs/`.

**Production build:** `npm run build` then `npm run start`.

**Chunk 404 / `Cannot find module './NNN.js'`:** stop the dev server, run `npm run clean` in `frontend/`, then `npm run dev` again. This clears a stale `.next` cache (often after interrupted builds or switching branches).

## Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   # adjust as needed
python manage.py migrate
python manage.py runserver
```

- API: `GET /api/health/`, `GET /api/devices/`, `GET /api/repair-jobs/` (demo list), `POST /api/contact/`, `POST /api/tracking/lookup/` (job ref + email), `POST /api/auth/token/` (JWT), `GET /api/partner/me/`, `POST /api/partner/rma/bulk/`, `GET /api/partner/invoices/` — Next.js proxies several of these under `frontend/src/app/api/…`.
- **Partner portal:** create a Django user, add an **Organization** (e.g. seed creates `demo-corp`), link the user under **Organization members**, then sign in at `/partner/login`.
- **Track demo:** after `seed_dummy_data`, use job `HH-DEMO-240001` and email `demo-track@hardwarehub.test`.
- Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) — create superuser with `python manage.py createsuperuser`

### PostgreSQL

1. Start Postgres: `docker compose up -d`
2. In `backend/.env`: set `USE_SQLITE=false` and match `POSTGRES_*` to `docker-compose.yml`
3. Run `python manage.py migrate`

## Staging (preview) deployment

**Step-by-step Vercel (free) for the Next.js app:** see **[docs/HOSTING_VERCEL.md](docs/HOSTING_VERCEL.md)**.

**Host the Django API elsewhere (Railway, Render, VPS):** see **[docs/HOSTING_DJANGO_BACKEND.md](docs/HOSTING_DJANGO_BACKEND.md)** (`backend/Procfile` + `gunicorn`).

Typical setup (adjust names/regions):

1. **Frontend:** Deploy `frontend/` to [Vercel](https://vercel.com) or similar — set root to `frontend`, build `npm run build`, output Next default.
2. **Backend:** Deploy `backend/` to [Railway](https://railway.app), [Render](https://render.com), or a VPS — run `gunicorn config.wsgi:application`, env from `backend/.env.example`. **SQLite** works only where the app has a **writable persistent disk** (typical local/VPS). **Vercel’s Django runtime cannot use SQLite reliably** — use Postgres there or host the API elsewhere; see **[docs/SQLITE_DEPLOYMENT.md](docs/SQLITE_DEPLOYMENT.md)**.
3. **Environment:** Set `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to your staging domains; set `DJANGO_DEBUG=false` and a strong `DJANGO_SECRET_KEY`.
4. **SSL:** Enforce HTTPS at the host (Vercel/Railway provide certificates).

This gives a **live staging URL** for stakeholder review without committing secrets to the repo.

## Phase 1 scope (reminder)

For a fuller explanation of Phase 1 and how the pieces fit together, see **[docs/PHASE1.md](docs/PHASE1.md)**.

**Phase 2 (how we build the operational product):** **[docs/PHASE2.md](docs/PHASE2.md)** — milestones, workstreams, and repo touchpoints.

Implemented: project structure, basic DB models (`DeviceCatalog`, `RepairJob`, `AuditLog`), health API, Home + Services UI, responsive layout.

Not in scope yet: full ERP sync, payments, courier APIs, auth flows.

## Ownership

Application code is intended for **Hardware Hub** ownership; avoid vendor-locked proprietary SDKs where an open alternative exists.
