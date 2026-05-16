"use client";

import { useCallback, useState } from "react";
import {
  normalizeWarrantySource,
  type BookRepairIssuePayload,
  type WarrantyCheckResponse,
} from "@/lib/booking";
import {
  formatStep1DeviceLabel,
  step1Brand,
  step1WarrantyRequestBody,
  type BookRepairStep1Payload,
} from "@/lib/bookRepairMakes";

type Props = {
  step1: BookRepairStep1Payload;
  issue: BookRepairIssuePayload;
  initialWarranty?: WarrantyCheckResponse | null;
  onBack: () => void;
  onNext: (warranty: WarrantyCheckResponse) => void;
};

function formatPurchaseDateForInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  return `${match[1]}/${match[2]}/${match[3]}`;
}

const OEM_WARRANTY_MONTHS: { brand: string; months: number }[] = [
  { brand: "Apple", months: 12 },
  { brand: "Huawei", months: 24 },
  { brand: "Samsung", months: 24 },
  { brand: "OPPO", months: 24 },
  { brand: "HONOR", months: 24 },
];

function parsePurchaseDateInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\//g, "-");
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(normalized);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const parsed = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getFullYear() !== y || parsed.getMonth() + 1 !== m || parsed.getDate() !== d) return null;
  return iso;
}

export function BookRepairStep2({
  step1,
  issue,
  initialWarranty = null,
  onBack,
  onNext,
}: Props) {
  const [purchaseDateInput, setPurchaseDateInput] = useState(() =>
    formatPurchaseDateForInput(initialWarranty?.purchase_date)
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(() =>
    initialWarranty ? "ready" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<WarrantyCheckResponse | null>(initialWarranty);
  const [dateTouched, setDateTouched] = useState(false);

  const purchaseIso = parsePurchaseDateInput(purchaseDateInput);
  const deviceBrand = step1Brand(step1);

  const runCheck = useCallback(async () => {
    setDateTouched(true);
    if (!purchaseIso) {
      setErrorMessage("Enter a valid date of purchase (YYYY/MM/DD).");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    const body = step1WarrantyRequestBody(step1, purchaseIso);

    try {
      const res = await fetch("/api/booking/warranty-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as WarrantyCheckResponse & { detail?: unknown };

      if (!res.ok) {
        const detail = data.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : detail && typeof detail === "object" && !Array.isArray(detail)
              ? Object.entries(detail as Record<string, unknown>)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
                  .join(" ")
              : "Warranty check failed.";
        setErrorMessage(msg);
        setStatus("error");
        return;
      }

      if (typeof data.in_warranty !== "boolean" || typeof data.summary !== "string") {
        setErrorMessage("Unexpected response from server.");
        setStatus("error");
        return;
      }

      const normalized: WarrantyCheckResponse = {
        ...(data as WarrantyCheckResponse),
        disclaimer: typeof data.disclaimer === "string" ? data.disclaimer : "",
        source: normalizeWarrantySource(typeof data.source === "string" ? data.source : undefined),
        purchase_date: purchaseIso,
        brand: typeof data.brand === "string" ? data.brand : deviceBrand || null,
        warranty_months:
          typeof data.warranty_months === "number" ? data.warranty_months : null,
      };
      setResult(normalized);
      setStatus("ready");
    } catch {
      setErrorMessage("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }, [step1, purchaseIso, deviceBrand]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 4 — Manufacturer warranty check
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Enter your date of purchase and we&apos;ll check standard manufacturer warranty coverage using
        OEM periods. Warranty repairs remain subject to physical inspection and policy rules.
      </p>

      <div className="mt-6 space-y-3 rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3 text-sm text-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Device</p>
          <p className="mt-1">
            <span className="font-medium text-slate-900">Device:</span>{" "}
            {step1.mode === "imei" || step1.mode === "custom" ? (
              <span className={step1.mode === "imei" ? "font-mono text-sm" : ""}>
                {formatStep1DeviceLabel(step1)}
              </span>
            ) : (
              formatStep1DeviceLabel(step1)
            )}
          </p>
        </div>
        <div className="border-t border-slate-200/80 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Fault description
          </p>
          <p className="mt-1 text-slate-800">
            {issue.categoryLabel} · {issue.faultLabel}
          </p>
          {issue.description ? (
            <p className="mt-1 text-xs text-slate-600 line-clamp-3">{issue.description}</p>
          ) : null}
        </div>
      </div>

      <label className="mt-6 block max-w-xs">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Date of purchase
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={purchaseDateInput}
          onChange={(e) => {
            setPurchaseDateInput(e.target.value);
            if (status === "ready") {
              setStatus("idle");
              setResult(null);
            }
          }}
          onBlur={() => setDateTouched(true)}
          placeholder="YYYY/MM/DD"
          autoComplete="off"
          className={`mt-1.5 w-full rounded-xl border bg-[#f8fafc] px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-brand/25 ${
            dateTouched && !purchaseIso && purchaseDateInput.trim()
              ? "border-red-300 focus:border-red-400"
              : "border-slate-200 focus:border-brand"
          }`}
        />
        {dateTouched && purchaseDateInput.trim() && !purchaseIso ? (
          <span className="mt-1 block text-xs text-red-600">Use format YYYY/MM/DD (e.g. 2024/06/15).</span>
        ) : (
          <span className="mt-1 block text-xs text-slate-500">
            {deviceBrand
              ? `Standard ${deviceBrand} warranty periods apply from this date.`
              : "Standard OEM warranty periods apply from this date."}
          </span>
        )}
      </label>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[280px] text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Manufacturer</th>
              <th className="px-3 py-2">Warranty period</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {OEM_WARRANTY_MONTHS.map((row) => (
              <tr key={row.brand}>
                <td className="px-3 py-2 font-medium text-slate-800">{row.brand}</td>
                <td className="px-3 py-2">{row.months} months</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status === "idle" ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => void runCheck()}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Check warranty
          </button>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-600">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"
            aria-hidden
          />
          Checking warranty…
        </div>
      ) : null}

      {status === "error" && errorMessage ? (
        <div className="mt-8 space-y-4">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => void runCheck()}
            className="text-sm font-medium text-brand hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === "ready" && result ? (
        <div className="mt-8 space-y-4">
          <div
            className={`rounded-xl border px-4 py-4 ${
              result.in_warranty
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {result.in_warranty ? "In warranty" : "Out of warranty"}
              {result.source === "erp_live" ? (
                <span className="ml-2 font-normal normal-case text-emerald-700">
                  · Live (connected system)
                </span>
              ) : null}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">{result.summary}</p>
          </div>
          {result.disclaimer ? (
            <p className="text-xs leading-relaxed text-slate-500">{result.disclaimer}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to step 3
        </button>
        {status === "ready" && result ? (
          <button
            type="button"
            onClick={() => onNext(result)}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Continue to documents
          </button>
        ) : null}
      </div>
    </div>
  );
}
