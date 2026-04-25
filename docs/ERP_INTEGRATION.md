# ERP integration (vendor-neutral)

Hardware Hub does **not** assume a specific ERP product. The booking flow talks to **your** systems through **HTTP** and **environment variables**, so you can swap providers without renaming the whole codebase.

## Warranty check (step 2)

1. When you have an HTTPS endpoint that can answer warranty for a device/IMEI, set one of:

   - **`ERP_WARRANTY_API_URL`** (preferred), or  
   - **`WARRANTY_PROVIDER_API_URL`**, or  
   - **`VISION_WARRANTY_API_URL`** (legacy; still supported)

2. Optional: **`ERP_WARRANTY_API_KEY`** (Bearer token), timeout, SSL verify, fallback behaviour — see `backend/.env.example`.

3. **Request:** JSON with `device_catalog_id`, `brand`, `model_name`, `sku`, `imei` (only fields that apply are sent).

4. **Response:** JSON with `in_warranty` (bool), optional `summary` / `message`, optional `next_action`. Aliases: `warranty_active`, `is_under_warranty`.

5. The API returns `source: "erp_live"` when the external call succeeds, or `source: "erp_stub"` when using the local placeholder.

## Quotes and jobs (later)

- **Quotes** today use **`RepairTariff`** in Django. When an ERP owns pricing, add a similar adapter (HTTP or sync job) without renaming user-facing routes.
- **Repair jobs / tracking** should follow the same pattern: one integration module per concern, env-based URLs, no hard-coded vendor names in UI copy.

## Frontend

- Labels say **“connected ERP”** / **live warranty check**, not a product name.
- If you need to support an old API that still returns `source: "vision_erp"`, the web app maps that to the same **live** state as `erp_live`.

---

*Keep this file updated when you add job sync or quote pull from the chosen ERP.*
