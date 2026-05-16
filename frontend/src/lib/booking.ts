import type { DeviceCatalog } from "@/lib/api";

/** Issue selection after step 2 — includes stable `code` values for ERP / Vision payloads. */
export type BookRepairIssuePayload = {
  categoryId: number;
  categoryCode: string;
  categoryLabel: string;
  faultCodeId: number;
  faultCode: string;
  faultLabel: string;
  description: string;
};

/** Document type for all files in one booking upload batch (matches API). */
export type BookingAttachmentKind = "proof_of_purchase" | "damage_photo" | "other";

export type BookRepairContactPayload = {
  fullName: string;
  email: string;
  phone: string;
  alternativePhone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

/** `erp_live` = external warranty API succeeded; `erp_stub` = placeholder / offline. */
export type WarrantyCheckSource = "erp_live" | "erp_stub";

/** Normalizes API source; legacy `vision_erp` / `vision_stub` still accepted from older backends. */
export function normalizeWarrantySource(raw: string | undefined): WarrantyCheckSource {
  if (raw === "erp_live" || raw === "vision_erp") return "erp_live";
  return "erp_stub";
}

export type WarrantyCheckResponse = {
  source: WarrantyCheckSource;
  checked_at: string;
  device: DeviceCatalog | null;
  imei: string | null;
  in_warranty: boolean;
  summary: string;
  next_action: "warranty_intake" | "out_of_warranty_quote";
  /** Empty when live ERP returned the result; otherwise explains placeholder or degraded mode. */
  disclaimer: string;
  purchase_date?: string | null;
  warranty_months?: number | null;
  brand?: string | null;
};

export type QuoteLine = {
  code: string;
  label: string;
  parts_cents: number;
  labour_cents: number;
  subtotal_cents: number;
};

export type QuoteResponse = {
  quote_mode: "warranty_channel" | "out_of_warranty";
  currency: string;
  vat_rate: number;
  lines: QuoteLine[];
  subtotal_cents: number;
  vat_cents: number;
  total_cents: number;
  summary: string;
  disclaimer: string;
  source: string;
  device: DeviceCatalog | null;
  imei: string | null;
};

/** Placeholder quote when the pricing step is deferred until after intake. */
export function deferredQuotePlaceholder(warranty: WarrantyCheckResponse): QuoteResponse {
  return {
    quote_mode: warranty.in_warranty ? "warranty_channel" : "out_of_warranty",
    currency: "ZAR",
    vat_rate: 0.15,
    lines: [],
    subtotal_cents: 0,
    vat_cents: 0,
    total_cents: 0,
    summary: warranty.in_warranty
      ? "Warranty repairs are priced after inspection."
      : "Out-of-warranty pricing will be provided later in the process.",
    disclaimer: "Quote step skipped during online booking.",
    source: "deferred",
    device: warranty.device,
    imei: warranty.imei,
  };
}

export function formatZarFromCents(cents: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
