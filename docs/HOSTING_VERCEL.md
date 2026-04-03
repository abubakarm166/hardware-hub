# Host the Hardware Hub frontend on Vercel (free) — step by step

This guide deploys the **Next.js app** in `frontend/` to [Vercel](https://vercel.com) on the **free Hobby** plan.  

**Important:** Vercel is built for Node/Next.js. The **Django API** (`backend/`) does **not** run on Vercel in a normal setup. You host the API somewhere else (see [After Vercel: your API](#after-vercel-your-api)) and point environment variables to that URL.

---

## Before you start

1. A **GitHub** (GitLab or Bitbucket also work) account and this project **pushed to a repository**.
2. A **Vercel** account — sign up at [vercel.com](https://vercel.com) (you can use **Sign up with GitHub**; it’s free).

---

## Step 1 — Put the code on GitHub

If it’s not already there:

1. Create a new repository on GitHub (e.g. `hardware-hub`).
2. In your project folder, add the remote and push:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hardware-hub.git
git push -u origin main
```

(Use your real repo URL.)

---

## Step 2 — Import the project in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and sign in.
2. Click **Add New…** → **Project**.
3. Under **Import Git Repository**, pick **GitHub** and **Install** / **Configure** access if asked.
4. Select your **hardware-hub** repository and click **Import**.

---

## Step 3 — Configure the project (monorepo)

Because the Next app lives in a subfolder, set:

| Setting | Value |
|--------|--------|
| **Framework Preset** | Next.js (usually auto-detected) |
| **Root Directory** | `frontend` — click **Edit** next to Root Directory, choose `frontend`, or type `frontend` |

Leave **Build Command** and **Output Directory** empty unless Vercel fills them; defaults (`next build` and Next output) are correct.

**Critical:** After the project is created, open **Settings → General** and confirm **Root Directory** is exactly **`frontend`** (not empty, not `./`). If it points at the repo root, Vercel will not run your Next.js app correctly and you can get a **live deployment that shows `404 NOT_FOUND`**.

Click **Deploy** (you can add env vars in the next step or before first deploy).

---

## Step 4 — Environment variables (production)

### Next.js project (this repo’s `frontend/` on Vercel)

After the first deploy (or on **Settings → Environment Variables**):

| Name | Example value | Purpose |
|------|----------------|--------|
| `API_URL` | `https://YOUR-DJANGO-HOST.vercel.app` | Server-side: `/api/contact` proxy and SSR fetches — **must match your Django deployment URL**, **no trailing slash**. Example pair: frontend `https://hardware-hub-d14w.vercel.app` → API `https://hardware-hub-td6s.vercel.app` → set `API_URL=https://hardware-hub-td6s.vercel.app`. |
| `NEXT_PUBLIC_API_URL` | Same as `API_URL` | Optional — only if the browser calls the API directly. |

### Django project (separate host — Railway, Render, Vercel Python, etc.)

Set these on **that** service so the API accepts your Vercel frontend:

| Name | Example value | Purpose |
|------|----------------|--------|
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,hardware-hub-td6s.vercel.app` | Fixes **`DisallowedHost`** — must include the **hostname** of the Django site (no `https://`). |
| `CORS_ALLOWED_ORIGINS` | `https://hardware-hub-d14w.vercel.app,http://localhost:3000` | Allows the **Next.js** origin to call the API (comma-separated, **https**, no trailing slash). |
| `CSRF_TRUSTED_ORIGINS` | `https://hardware-hub-td6s.vercel.app` | Optional — if you use Django **admin** over HTTPS on the API host. |

Redeploy Django after changing env vars.

**Rules:**

- No trailing slash on the URL.
- **You can deploy without `API_URL`:** the site builds successfully; pages that read the API show empty/fallback content until you set `API_URL` to a live Django URL. (Older setups defaulted to `localhost` during build and caused timeouts — that is fixed in code.)
- Deploy the **Django backend** when you’re ready and set `API_URL` to its public `https` URL. Until then, catalog/track data and the contact form proxy stay empty or return a configuration message.

Click **Save**, then **Redeploy** (Deployments → … → Redeploy) so new variables apply.

---

## Step 5 — Custom domain (optional)

1. In the project: **Settings → Domains**.
2. Add `hardware-hub.co.za` (or your subdomain) and follow Vercel’s DNS instructions (usually **A** / **CNAME** at your registrar).
3. Wait for DNS to propagate (often minutes, sometimes up to 48 hours).

SSL certificates are handled by Vercel automatically on the free plan.

---

## After Vercel: your API

The **Django** app should run on a platform meant for long-running Python web apps, for example:

- [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io), or a small VPS.

Point `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` at:

- Your Vercel site origin, e.g. `https://your-project.vercel.app` or `https://hardware-hub.co.za`

Then set `API_URL` on Vercel to that API’s base URL.

---

## Quick checklist

- [ ] Repo on GitHub (or GitLab / Bitbucket).
- [ ] Vercel project with **Root Directory** = `frontend`.
- [ ] `API_URL` set when Django is live and HTTPS.
- [ ] Django `CORS_ALLOWED_ORIGINS` includes your Vercel URL.
- [ ] Redeploy after changing env vars.

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| **`404 NOT_FOUND`** (Vercel error page, code `NOT_FOUND`, deployment “Ready”) | Almost always **wrong Root Directory**. Open **Project → Settings → General → Root Directory** → **Edit** → select the **`frontend`** folder (or type `frontend`) → **Save**. Redeploy (**Deployments** → … → **Redeploy**). Also set **Framework Preset** to **Next.js** if it’s “Other” or “Services”. |
| **`/book-repair` build timeout (~60s) / “Failed to build … after 3 attempts”** | Your Vercel build is using an **old Git commit** that still called `localhost` for the API. **Push the latest `main`** from this repo (includes `frontend/src/lib/api.ts` — no API URL in production = no hang). In Vercel logs, check the **commit hash** matches GitHub’s latest. |
| Build fails (other) | In Vercel build logs, confirm Root Directory is `frontend` and Node version is 18+ (Vercel default is fine). |
| Site loads but no catalog / contact errors | `API_URL` wrong or API down; check Django URL and CORS. |
| 404 on old deployment | Trigger a fresh deploy from the latest `main` branch. |

---

## Free tier notes (Vercel Hobby)

- Generous bandwidth and build minutes for small sites; limits exist — see [Vercel Pricing](https://vercel.com/pricing).
- Commercial use is allowed on Hobby within their terms; upgrade if you need team features or higher limits.

---

*Last updated for the Hardware Hub Phase 1 layout (`frontend/` subfolder).*
