const DEFAULT_DEV_API = "http://127.0.0.1:8000";

/** Deployed Django API (used in production when env vars are not set). Override with `API_URL`. */
const DEFAULT_PRODUCTION_API = "https://hardware-hub-td6s.vercel.app";

/** Milliseconds — avoids hanging builds when the API host is unreachable. */
const FETCH_TIMEOUT_MS = 10_000;

/**
 * Backend base URL for server-side fetches.
 * - Uses `API_URL` or `NEXT_PUBLIC_API_URL` when set (recommended for other environments).
 * - In **development** (`next dev`), defaults to localhost so local Django works.
 * - In **production**, defaults to the deployed API above (never `127.0.0.1` in the cloud).
 */
export function getApiBase(): string {
  const explicit =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") {
    return DEFAULT_DEV_API.replace(/\/$/, "");
  }
  return DEFAULT_PRODUCTION_API.replace(/\/$/, "");
}

export type DeviceCatalog = {
  id: number;
  brand: string;
  model_name: string;
  sku: string;
};

export type RepairJobPublic = {
  job_reference: string;
  status: string;
  status_display: string;
  device: DeviceCatalog | null;
  updated_at: string;
};

async function getJson<T>(path: string): Promise<T | null> {
  const base = getApiBase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}${path}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDevices(): Promise<DeviceCatalog[]> {
  const data = await getJson<DeviceCatalog[]>("/api/devices/");
  return Array.isArray(data) ? data : [];
}

export async function fetchRepairJobs(): Promise<RepairJobPublic[]> {
  const data = await getJson<RepairJobPublic[]>("/api/repair-jobs/");
  return Array.isArray(data) ? data : [];
}

export function uniqueBrands(devices: DeviceCatalog[]): string[] {
  return [...new Set(devices.map((d) => d.brand))].sort((a, b) => a.localeCompare(b));
}
