# Using SQLite (`db.sqlite3`) with Hardware Hub

## Local development (this works today)

SQLite is the **default** when `DATABASE_URL` is **not** set and `USE_SQLITE` is true.

1. In `backend/.env` (copy from `.env.example`), **do not** set `DATABASE_URL`.
2. Keep `USE_SQLITE=true` (or omit it — it defaults to true).
3. Run:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser   # once
python manage.py runserver
```

Your database file is **`backend/db.sqlite3`**. Admin, API, and contact form all use this file **on your machine only**.

---

## Why SQLite on **Vercel** (Django) does not work

[Vercel](https://vercel.com) Python/serverless runs with a **read-only** (or non-persistent) filesystem. SQLite **must write** to a file for sessions, admin login, migrations, and your models. That produces:

`OperationalError: attempt to write a readonly database`

**This is a platform limitation, not a Django bug.** There is no settings tweak that makes a normal persistent `db.sqlite3` work on Vercel’s Django runtime.

---

## If you want to stay on SQLite (no PostgreSQL)

You have three practical options:

### 1. Only run the API on your PC (simplest)

- Deploy **only the Next.js frontend** to Vercel.
- Run **Django locally** with SQLite: `python manage.py runserver`.
- Point the frontend at your machine when testing, e.g. `API_URL=http://YOUR_LAN_IP:8000` (or tunnel with [ngrok](https://ngrok.com/) if needed).

### 2. Deploy Django somewhere with a **writable disk** (SQLite-friendly)

Step-by-step for **Railway / Render / VPS** is in **[HOSTING_DJANGO_BACKEND.md](HOSTING_DJANGO_BACKEND.md)**.

Use any host that gives you a **persistent filesystem** for a single process, for example:

- A small **VPS** (DigitalOcean, Hetzner, etc.) — put `db.sqlite3` next to the app.
- **[Railway](https://railway.app)** / **[Render](https://render.com)** with a **persistent volume** mounted where Django expects the DB (you must configure the path in `settings` if the volume is not the app folder).
- **PythonAnywhere**, **Fly.io** with a volume, etc.

Then set `API_URL` on Vercel to that server’s **HTTPS** URL. You still use **SQLite only** — no PostgreSQL.

### 3. Keep trying SQLite on Vercel (not recommended)

Putting SQLite under **`/tmp`** can be **writable** on some serverless setups, but the file is **wiped when the instance restarts**. You lose data; not suitable for real admin or contact submissions.

---

## Summary

| Environment              | SQLite (`db.sqlite3`)      |
|--------------------------|----------------------------|
| Your laptop (`runserver`)| Yes — use as now           |
| Vercel (Django)          | No — use Postgres **or** move Django to a host with disk |
| Vercel (Next.js only)    | N/A — frontend has no SQLite DB |

**Bottom line:** You can avoid PostgreSQL **by not running Django on Vercel** and using SQLite on **local** or on a **VM / PaaS with persistent storage**.
