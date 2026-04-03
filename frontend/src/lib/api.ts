const DEFAULT_API = "http://127.0.0.1:8000";

export function getApiBase(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API
  ).replace(/\/$/, "");
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
  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
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
