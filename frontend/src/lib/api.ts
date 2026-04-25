const DEFAULT_DEV_API = "http://127.0.0.1:8000";

/** Deployed Django API (used in production when env vars are not set). Override with `API_URL`. */
const DEFAULT_PRODUCTION_API =
  "https://hardware-hub-production-0445.up.railway.app";

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

/** Booking intake — matches `GET /api/booking/issue-options/`. */
export type FaultCodeOption = {
  id: number;
  code: string;
  label: string;
};

export type IssueCategoryOption = {
  id: number;
  code: string;
  label: string;
  fault_codes: FaultCodeOption[];
};

export type IssueOptionsFetchResult = {
  categories: IssueCategoryOption[];
  issueOptionsUnreachable: boolean;
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

export type DeviceCatalogFetchResult = {
  devices: DeviceCatalog[];
  /** Connection refused, timeout, or other network failure (empty list may also mean no data). */
  catalogUnreachable: boolean;
};

/**
 * Same as `/api/devices/` but reports whether the failure was likely a dead API host (for UX hints).
 */
export async function fetchIssueOptionsDetailed(): Promise<IssueOptionsFetchResult> {
  const base = getApiBase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/booking/issue-options/`, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    if (!res.ok) {
      return { categories: [], issueOptionsUnreachable: false };
    }
    const data = (await res.json()) as { categories?: IssueCategoryOption[] };
    const categories = Array.isArray(data.categories) ? data.categories : [];
    return { categories, issueOptionsUnreachable: false };
  } catch {
    return { categories: [], issueOptionsUnreachable: true };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDevicesDetailed(): Promise<DeviceCatalogFetchResult> {
  const base = getApiBase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/devices/`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) {
      return { devices: [], catalogUnreachable: false };
    }
    const data = (await res.json()) as unknown;
    const devices = Array.isArray(data) ? (data as DeviceCatalog[]) : [];
    return { devices, catalogUnreachable: false };
  } catch {
    return { devices: [], catalogUnreachable: true };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDevices(): Promise<DeviceCatalog[]> {
  const { devices } = await fetchDevicesDetailed();
  return devices;
}

export async function fetchRepairJobs(): Promise<RepairJobPublic[]> {
  const data = await getJson<RepairJobPublic[]>("/api/repair-jobs/");
  return Array.isArray(data) ? data : [];
}

export function uniqueBrands(devices: DeviceCatalog[]): string[] {
  return [...new Set(devices.map((d) => d.brand))].sort((a, b) => a.localeCompare(b));
}
