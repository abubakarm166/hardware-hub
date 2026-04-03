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

Click **Deploy** (you can add env vars in the next step or before first deploy).

---

## Step 4 — Environment variables (production)

After the first deploy (or on **Settings → Environment Variables**):

Add these for the **Production** environment (and **Preview** if you want previews to hit a staging API):

| Name | Example value | Purpose |
|------|----------------|--------|
| `API_URL` | `https://api.your-domain.com` | Server-side: Next.js route `/api/contact` and SSR fetches to your Django API (**must be `https`** in production). |
| `NEXT_PUBLIC_API_URL` | Same as `API_URL` | Only if you later add **browser** calls to the API; optional for current Phase 1 server-side fetch. |

**Rules:**

- No trailing slash on the URL.
- Deploy the **Django backend first** and use its real public URL here. Until the API exists, catalog/track/contact from the server may fail or show empty states — that’s expected.

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
| Build fails | In Vercel build logs, confirm Root Directory is `frontend` and Node version is 18+ (Vercel default is fine). |
| Site loads but no catalog / contact errors | `API_URL` wrong or API down; check Django URL and CORS. |
| 404 on old deployment | Trigger a fresh deploy from the latest `main` branch. |

---

## Free tier notes (Vercel Hobby)

- Generous bandwidth and build minutes for small sites; limits exist — see [Vercel Pricing](https://vercel.com/pricing).
- Commercial use is allowed on Hobby within their terms; upgrade if you need team features or higher limits.

---

*Last updated for the Hardware Hub Phase 1 layout (`frontend/` subfolder).*
