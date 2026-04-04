# Host the Django API on another server (not Vercel)

This guide helps you run **`backend/`** (Django + DRF) on a normal app host — **Railway**, **Render**, a **VPS**, etc. — while keeping the **Next.js** site on Vercel (or anywhere else).

**Why not Vercel for Django + SQLite?** See **[SQLITE_DEPLOYMENT.md](SQLITE_DEPLOYMENT.md)**. On hosts below you get a **writable disk** or **managed Postgres**, so admin and the contact API work.

---

## 1. What you need before deploying

| Item | Notes |
|------|--------|
| **Repo** | Code pushed to GitHub (or GitLab / Bitbucket). |
| **Start command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` (see `backend/Procfile`). |
| **Root directory** | Many platforms let you set the app folder to **`backend`** (monorepo). |
| **Python** | 3.11+ (3.12 is fine). `requirements.txt` includes `gunicorn`. |

---

## 2. Environment variables (production)

Set these on the **backend** service (not on the Next.js project). Copy names from **`backend/.env.example`**.

| Variable | Required | Example / notes |
|----------|----------|------------------|
| `DJANGO_SECRET_KEY` | Yes | Long random string; **never** commit it. |
| `DJANGO_DEBUG` | Yes | `false` in production. |
| `DJANGO_ALLOWED_HOSTS` | Yes | Your API hostname only, comma-separated, **no** `https://`. Example: `api.yourdomain.com` or `your-app.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | Yes | Your **frontend** URL(s), `https://...`, **no** trailing slash. Example: `https://hardware-hub-d14w.vercel.app` |
| `DATABASE_URL` | Recommended | PostgreSQL URL from the host’s DB plugin (Neon, Railway Postgres, Render Postgres). **Easiest for production.** |
| `USE_SQLITE` | If no Postgres | `true` only if the platform gives a **persistent disk** and your SQLite path is writable (some PaaS need a volume). |

**After deploy:** run migrations once (see §6).

---

## 3. Option A — Railway ([railway.app](https://railway.app))

Railway fits this repo well: **GitHub deploy**, **managed Postgres**, and a **`backend/`** subfolder.

### 3.1 Create the project from GitHub

1. Log in at [railway.app](https://railway.app).
2. **New Project** → in the “What would you like to create?” menu choose **GitHub Repository** (not “Empty Project”).
3. Authorize Railway to read your GitHub account if asked.
4. Select your repo (e.g. **`abubakarm166/hardware-hub`**) and branch **`main`**.

Railway will create a **service** from that repo.

### 3.1a “Build failed” right after connecting GitHub (very common)

If the **hardware-hub** card shows **Build failed** as soon as you land on the project:

1. Railway is building from the **repository root**. This repo’s **`requirements.txt`** and **`Dockerfile`** live under **`backend/`**, not at the top level — so the build has nothing to install until you fix the root.
2. Open the **hardware-hub** service → **Settings**.
3. Set **Root Directory** to exactly: **`backend`**
4. Click **Redeploy** (or push a new commit).

After that, Railway should detect **`backend/Dockerfile`** or Nixpacks + **`requirements.txt`** inside `backend/` and build successfully.

If it still fails, open the **Deployments** tab → latest deploy → **View logs** and read the error (missing module, wrong Python, etc.).

### 3.2 Point Railway at the `backend` folder (important)

Your Django app lives in **`backend/`**, not the repo root.

1. Open the **web service** Railway created → **Settings**.
2. Find **Root Directory** (or **Watch paths** / service root, depending on UI version).
3. Set it to **`backend`** and save.
4. **Start command** (Settings → Deploy → Custom start command, if needed):  
   `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`  
   Railway also reads **`backend/Procfile`** if the service root is `backend`.

Redeploy after changing the root directory.

### 3.3 Add PostgreSQL (recommended)

SQLite is awkward on most PaaS; **Postgres** on Railway is the smoothest path.

1. In the same **project** (not necessarily inside the web service), click **New** → **Database** → **PostgreSQL** (or **Add PostgreSQL** from the canvas).
2. Wait until the database is provisioned.
3. **Connect the DB to Django:** open your **web service** → **Variables** → **Add variable** → **Reference** (or “Connect to Postgres”) and expose **`DATABASE_URL`** from the Postgres service into the web service.  
   - If the UI offers it: choose the Postgres plugin and variable **`DATABASE_URL`**.  
   - Otherwise: copy **`DATABASE_URL`** from the Postgres service’s variables tab and paste it into the web service’s variables (same name: **`DATABASE_URL`**).

Our **`config/settings.py`** already uses **`DATABASE_URL`** when set.

### 3.4 Set Django environment variables (web service)

In the **web service** → **Variables**, add (example values — use your real URLs):

| Name | Value |
|------|--------|
| `DJANGO_SECRET_KEY` | Long random string (generate one; do not reuse dev default). |
| `DJANGO_DEBUG` | `false` |
| `DJANGO_ALLOWED_HOSTS` | Your API hostname **only**, comma-separated, **no** `https://`. After deploy, open **Settings → Networking / Domains** on the web service and note the hostname (e.g. `something.up.railway.app`). Put that here, e.g. `myapi.up.railway.app`. |
| `CORS_ALLOWED_ORIGINS` | Your **frontend** origin, e.g. `https://hardware-hub-d14w.vercel.app` (no trailing slash). Add `http://localhost:3000` if you test locally against prod API. |

Save; Railway will redeploy.

### 3.5 Public URL and HTTPS

1. On the web service → **Settings** → **Networking** (or **Generate domain**), enable a **public URL** / custom domain so the API is reachable over **HTTPS**.
2. Copy the base URL (e.g. `https://myapi.up.railway.app`).  
3. If you change the hostname, **update `DJANGO_ALLOWED_HOSTS`** to match.

**Health check path:** If **Deploy → Health check path** is `/healthcheck`, leave it — this repo exposes **`GET /healthcheck/`** (same response as **`/api/health/`**). You can also set it to **`/api/health/`** if you prefer.

**Start / build commands:** If you use **`backend/Dockerfile`**, **Start command** can stay empty (Docker **`CMD`** runs Gunicorn). If the dashboard shows empty start and the app won’t boot, set **Start command** to:  
`gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`

### 3.5a Where to find the Railway **hostname** (for `DJANGO_ALLOWED_HOSTS`)

You need the **host part only** of your API — **no** `https://`, no `/` path.

1. Open your **hardware-hub** web service on the Railway project canvas.
2. Go to **Settings** → **Networking** (or **Public Networking**).
3. Click **Generate domain** if Railway hasn’t given you a URL yet.
4. You’ll see a URL like **`https://hardware-hub-production-xxxx.up.railway.app`**.  
   The **hostname** is everything after `https://` and before the next `/` — e.g. **`hardware-hub-production-xxxx.up.railway.app`**. Put **that** in **`DJANGO_ALLOWED_HOSTS`**.

You can also copy it from the **Deployments** tab (open the active deployment) or from the **globe / open** link on the service card.

---

### 3.5b After deploy succeeds — checklist

1. **Variables** — add `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, `DJANGO_ALLOWED_HOSTS` (hostname from §3.5a), `CORS_ALLOWED_ORIGINS` (your Vercel frontend URL). Add **`DATABASE_URL`** from a **PostgreSQL** service (recommended).
2. **Postgres** — **+ New** → **Database** → **PostgreSQL**, then link **`DATABASE_URL`** into the web service.
3. **Migrations** — run `python manage.py migrate` against that DB (local shell with `DATABASE_URL` or Railway shell).
4. **Frontend** — set Vercel **`API_URL`** to your Railway HTTPS base URL and redeploy.
5. Test **`/api/health/`** and **`/healthcheck/`** in the browser.

### 3.6 Run migrations (once)

Use the **same** `DATABASE_URL` as production:

```bash
cd backend
# Windows PowerShell — paste DATABASE_URL from Railway Postgres:
# $env:DATABASE_URL = "postgres://..."
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_dummy_data   # optional
```

Or use **Railway → web service → Shell** (if available) and run the same commands in `/app` with env already injected.

### 3.7 Point Vercel (Next.js) at Railway

1. Vercel → **frontend** project → **Environment Variables**.
2. Set **`API_URL`** = `https://your-railway-host.up.railway.app` (no trailing slash).  
   Set **`NEXT_PUBLIC_API_URL`** the same if you use public client-side API calls.
3. Redeploy the frontend.

### 3.8 Smoke test

- Open `https://your-railway-host/api/health/` — expect JSON `status: ok`.
- Open `https://your-railway-host/admin/` — log in with the superuser you created.
- Submit the **Contact** form on the live site — should return success if **`CORS_ALLOWED_ORIGINS`** includes your Vercel URL.

---

## 4. Option B — Render ([render.com](https://render.com))

1. **New** → **Web Service** → connect the repo.
2. **Root Directory:** `backend`  
   **Build Command:** `pip install -r requirements.txt`  
   **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
3. **Instance type:** Free tier is OK for testing.
4. Add **PostgreSQL** from the dashboard (or use **Render Postgres**) and set **`DATABASE_URL`** in the web service env (Render often provides the connection string).
5. Set **`DJANGO_ALLOWED_HOSTS`** to your Render hostname, e.g. `your-api.onrender.com`.
6. Set **`CORS_ALLOWED_ORIGINS`** to your frontend `https://....vercel.app`.
7. Deploy → run migrations (§6) → point **Vercel** `API_URL` at the Render URL.

---

## 5. Option C — VPS (Ubuntu + Nginx + Gunicorn)

1. Install Python 3.12+, nginx, git.
2. Clone repo, `cd backend`, `python -m venv venv`, `source venv/bin/activate`, `pip install -r requirements.txt`.
3. Create **`/etc/systemd/system/hardware-hub-api.service`** running:

   ```ini
   [Service]
   WorkingDirectory=/path/to/hardware-hub/backend
   Environment="DJANGO_SECRET_KEY=..."
   EnvironmentFile=/path/to/backend.env
   ExecStart=/path/to/hardware-hub/backend/venv/bin/gunicorn config.wsgi:application --bind unix:/run/hardware-hub.sock
   ```

   (Or bind `0.0.0.0:8000` behind Nginx `proxy_pass`.)

4. Nginx: `server_name api.yourdomain.com;` → `proxy_pass http://127.0.0.1:8000;` — use HTTPS (Let’s Encrypt).
5. **`DJANGO_ALLOWED_HOSTS`** = `api.yourdomain.com`. **`CORS_ALLOWED_ORIGINS`** = frontend origin.
6. SQLite: keep **`db.sqlite3`** under `backend/` with correct permissions, **or** use **`DATABASE_URL`** to Postgres.

---

## 6. Run migrations (required once per database)

From your **laptop**, with **`DATABASE_URL`** pointing at the **same** DB the server uses:

```bash
cd backend
# Windows PowerShell:
# $env:DATABASE_URL = "postgres://..."
python manage.py migrate
python manage.py createsuperuser   # optional, for admin
python manage.py seed_dummy_data   # optional demo data
```

Many hosts also offer a **one-off shell** or **SSH** where you can run `python manage.py migrate`.

---

## 7. Point the frontend (Vercel) at the new API

1. Vercel → **frontend** project → **Settings → Environment Variables**.
2. Set **`API_URL`** = `https://your-api-host.example.com` (same as **`NEXT_PUBLIC_API_URL`** if you use client-side calls).
3. Update **`frontend/src/lib/api.ts`** default production URL if you still hardcode a fallback — or rely on env only.
4. **Redeploy** the frontend.

Test: open `https://your-api-host/api/health/` in a browser — you should see JSON `{"status":"ok",...}`.

---

## 8. Checklist

- [ ] `DJANGO_DEBUG=false`, strong `DJANGO_SECRET_KEY`
- [ ] `DJANGO_ALLOWED_HOSTS` = API host only
- [ ] `CORS_ALLOWED_ORIGINS` = frontend `https://...` (no slash at end)
- [ ] Database: **`DATABASE_URL`** (Postgres) or writable SQLite path
- [ ] `python manage.py migrate` completed
- [ ] Frontend `API_URL` updated and redeployed

---

## 9. Files in this repo that help

| File | Purpose |
|------|--------|
| `backend/Procfile` | `web:` process for Railway / Heroku-style hosts |
| `backend/Dockerfile` | Optional Docker build when Root Directory is **`backend`** (helps Railway find Python + deps) |
| `backend/requirements.txt` | Includes **gunicorn** |
| `backend/config/settings.py` | `DATABASE_URL`, `CORS`, `ALLOWED_HOSTS` |
| `backend/.env.example` | Variable names and hints |

---

*For SQLite vs Postgres on these hosts, see **[SQLITE_DEPLOYMENT.md](SQLITE_DEPLOYMENT.md)**.*
