"use client";

import { useMemo, useState } from "react";
import type { DeviceCatalog } from "@/lib/api";

export type BookRepairStep1Payload =
  | { mode: "catalog"; device: DeviceCatalog }
  | { mode: "imei"; imei: string };

type Props = {
  devices: DeviceCatalog[];
  /** True when the server could not reach the Django API (e.g. nothing on port 8000). */
  catalogUnreachable?: boolean;
  onNext: (payload: BookRepairStep1Payload) => void;
};

function normalizeImeiDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** IMEI (GSM) is 15 digits. Accepts pasted text with spaces or labels. */
export function isValidImei15(digits: string): boolean {
  return /^\d{15}$/.test(digits);
}

function imeiValidationHint(digits: string): string {
  const n = digits.length;
  if (n === 0) return "";
  if (n < 15) {
    return `IMEI must be exactly 15 digits (you have ${n} so far).`;
  }
  if (n === 16) {
    return "You entered 16 digits — a standard IMEI is only 15. If *#06#* shows two numbers, enter one line only. If you pasted a long string, drop one digit and match the number on your box.";
  }
  return `You entered ${n} digits; IMEI must be exactly 15. Use a single 15-digit IMEI from *#06#* or the device label.`;
}

export function BookRepairStep1({ devices, catalogUnreachable = false, onNext }: Props) {
  const [path, setPath] = useState<"catalog" | "imei">("catalog");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [imeiInput, setImeiInput] = useState("");
  const [imeiTouched, setImeiTouched] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter((d) => {
      const hay = `${d.brand} ${d.model_name} ${d.sku}`.toLowerCase();
      return hay.includes(q);
    });
  }, [devices, search]);

  const selectedDevice =
    selectedId != null ? devices.find((d) => d.id === selectedId) ?? null : null;

  const imeiDigits = normalizeImeiDigits(imeiInput);
  const imeiValid = isValidImei15(imeiDigits);
  const imeiShowError = imeiTouched && imeiDigits.length > 0 && !imeiValid;

  function handleContinue() {
    if (path === "catalog") {
      if (!selectedDevice) return;
      onNext({ mode: "catalog", device: selectedDevice });
      return;
    }
    setImeiTouched(true);
    if (!imeiValid) return;
    onNext({ mode: "imei", imei: imeiDigits });
  }

  const canContinueCatalog = path === "catalog" && selectedDevice != null;
  const canContinueImei = path === "imei" && imeiValid;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 1 — Your device
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Enter your IMEI or choose your model from our catalog. We&apos;ll use this for warranty
        checks and quoting in the next steps.
      </p>

      <div
        className="mt-6 flex flex-wrap gap-2"
        role="tablist"
        aria-label="How would you like to identify your device?"
      >
        <button
          type="button"
          role="tab"
          aria-selected={path === "catalog"}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            path === "catalog"
              ? "bg-brand text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          onClick={() => setPath("catalog")}
        >
          Select model
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={path === "imei"}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            path === "imei"
              ? "bg-brand text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          onClick={() => setPath("imei")}
        >
          Enter IMEI
        </button>
      </div>

      {path === "catalog" ? (
        <div className="mt-8 space-y-4" role="tabpanel">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Search catalog
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Brand or model (e.g. Samsung Galaxy)"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none ring-brand/30 placeholder:text-slate-400 focus:border-brand focus:ring-2"
              autoComplete="off"
            />
          </label>

          {devices.length === 0 ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {catalogUnreachable ? (
                <>
                  <strong className="font-semibold">Can&apos;t reach the API.</strong> Start Django
                  locally: <code className="rounded bg-amber-100 px-1">python manage.py runserver</code>{" "}
                  (port 8000), or set <code className="rounded bg-amber-100 px-1">API_URL</code> /{" "}
                  <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_API_URL</code> in{" "}
                  <code className="rounded bg-amber-100 px-1">frontend/.env.local</code> to a running
                  backend. IMEI entry still works without the catalog.
                </>
              ) : (
                <>
                  No devices in the catalog yet. Run{" "}
                  <code className="rounded bg-amber-100 px-1">seed_dummy_data</code> or add devices in
                  Django admin.
                </>
              )}
            </p>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Choose a device ({filtered.length} shown)
              </p>
              <ul
                className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-[#f8fafc] p-2 md:max-h-80"
                role="listbox"
                aria-label="Device catalog"
              >
                {filtered.map((d) => {
                  const active = selectedId === d.id;
                  return (
                    <li key={d.id} className="p-0.5">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => setSelectedId(d.id)}
                        className={`flex w-full flex-col rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "bg-brand/15 ring-2 ring-brand"
                            : "hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <span className="font-medium text-slate-900">
                          {d.brand} · {d.model_name}
                        </span>
                        {d.sku ? (
                          <span className="mt-0.5 text-xs text-slate-500">SKU {d.sku}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {filtered.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">No matches — try another search.</p>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-4" role="tabpanel">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              IMEI (15 digits)
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              onBlur={() => setImeiTouched(true)}
              placeholder="e.g. 35 123402 123456 7"
              aria-invalid={imeiShowError}
              className={`mt-1.5 w-full rounded-xl border bg-[#f8fafc] px-4 py-3 font-mono text-sm text-slate-900 outline-none ring-brand/30 placeholder:font-sans placeholder:text-slate-400 focus:ring-2 ${
                imeiShowError ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-brand"
              }`}
              autoComplete="off"
            />
          </label>
          <p className="text-xs leading-relaxed text-slate-500">
            Find it on the device box, under Settings → About, or dial{" "}
            <span className="font-mono text-slate-700">*#06#</span> on many phones. Spaces are
            fine — we strip to digits.
          </p>
          {imeiShowError ? (
            <p className="text-sm text-red-600" role="alert">
              {imeiValidationHint(imeiDigits)}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleContinue}
          disabled={path === "catalog" ? !canContinueCatalog : !canContinueImei}
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue
        </button>
        {path === "imei" ? (
          <span className="text-xs text-slate-500">
            {imeiDigits.length}/15 digits
          </span>
        ) : null}
      </div>
    </div>
  );
}
