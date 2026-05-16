import type { DeviceCatalog } from "@/lib/api";

export type BookRepairStep1Payload =
  | { mode: "catalog"; device: DeviceCatalog; imei?: string }
  | { mode: "imei"; imei: string; brand?: string; model_name?: string }
  | { mode: "custom"; brand: string; model_name: string; imei: string };

export type Step1DeviceReviewDetails = {
  make: string | null;
  model: string | null;
  imei: string | null;
  sku: string | null;
};

export const BOOKING_MAKE_OPTIONS = [
  "Samsung",
  "Huawei",
  "Apple",
  "HONOR",
  "OPPO",
  "vivo",
  "Other",
] as const;

export type BookingMakeOption = (typeof BOOKING_MAKE_OPTIONS)[number];

export const BOOKING_MAKE_OTHER: BookingMakeOption = "Other";

export function brandMatchesMake(deviceBrand: string, make: string): boolean {
  return deviceBrand.trim().toLowerCase() === make.trim().toLowerCase();
}

export function formatStep1DeviceLabel(step1: BookRepairStep1Payload): string {
  if (step1.mode === "catalog") {
    const sku = step1.device.sku ? ` · SKU ${step1.device.sku}` : "";
    const model = `${step1.device.brand} · ${step1.device.model_name}${sku}`;
    return step1.imei ? `${model} · IMEI ${step1.imei}` : model;
  }
  if (step1.mode === "custom") {
    return `${step1.brand} · ${step1.model_name} · IMEI ${step1.imei}`;
  }
  return `IMEI ${step1.imei}`;
}

export function step1Brand(step1: BookRepairStep1Payload): string {
  if (step1.mode === "catalog") return step1.device.brand;
  if (step1.mode === "custom") return step1.brand;
  return (step1.brand ?? "").trim();
}

/** Make, model, and IMEI for review / risk checks — uses warranty device as fallback when available. */
export function step1DeviceReviewDetails(
  step1: BookRepairStep1Payload,
  fallbackDevice?: DeviceCatalog | null
): Step1DeviceReviewDetails {
  if (step1.mode === "catalog") {
    return {
      make: step1.device.brand,
      model: step1.device.model_name,
      imei: step1.imei?.trim() || null,
      sku: step1.device.sku?.trim() || null,
    };
  }
  if (step1.mode === "custom") {
    return {
      make: step1.brand,
      model: step1.model_name,
      imei: step1.imei,
      sku: null,
    };
  }

  const brand = (step1.brand ?? "").trim();
  const model = (step1.model_name ?? "").trim();
  if (brand || model) {
    return {
      make: brand || null,
      model: model || null,
      imei: step1.imei,
      sku: null,
    };
  }

  if (fallbackDevice) {
    return {
      make: fallbackDevice.brand,
      model: fallbackDevice.model_name,
      imei: step1.imei,
      sku: fallbackDevice.sku?.trim() || null,
    };
  }

  return { make: null, model: null, imei: step1.imei, sku: null };
}

export function step1WarrantyRequestBody(
  step1: BookRepairStep1Payload,
  purchaseDateIso?: string
): { device_catalog_id?: number; imei: string; brand?: string; purchase_date?: string } {
  const brand = step1Brand(step1);
  const base =
    step1.mode === "catalog"
      ? { device_catalog_id: step1.device.id, imei: step1.imei ?? "" }
      : { imei: step1.imei };
  return {
    ...base,
    ...(brand ? { brand } : {}),
    ...(purchaseDateIso ? { purchase_date: purchaseDateIso } : {}),
  };
}

export function step1SubmitDeviceFields(
  step1: BookRepairStep1Payload
): { device_catalog_id: number | null; imei: string } {
  if (step1.mode === "catalog") {
    return { device_catalog_id: step1.device.id, imei: step1.imei ?? "" };
  }
  return { device_catalog_id: null, imei: step1.imei };
}

export function step1DeviceNoteForIssue(step1: BookRepairStep1Payload): string {
  const details = step1DeviceReviewDetails(step1);
  if (step1.mode === "custom") {
    return `Device (not in catalog): ${step1.brand} · ${step1.model_name}`;
  }
  if (step1.mode === "imei" && (details.make || details.model)) {
    const parts = [details.make, details.model].filter(Boolean).join(" · ");
    return `Device: ${parts}`;
  }
  return "";
}
