"use client";

import { useMemo, useState } from "react";
import type { DeviceCatalog } from "@/lib/api";
import {
  BOOKING_MAKE_OPTIONS,
  BOOKING_MAKE_OTHER,
  brandMatchesMake,
  type BookRepairStep1Payload,
} from "@/lib/bookRepairMakes";

export type { BookRepairStep1Payload };

type Props = {
  devices: DeviceCatalog[];
  catalogUnreachable?: boolean;
  onNext: (payload: BookRepairStep1Payload) => void;
};

function normalizeImeiDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

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
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [customModel, setCustomModel] = useState("");
  const [customImeiInput, setCustomImeiInput] = useState("");
  const [customImeiTouched, setCustomImeiTouched] = useState(false);
  const [imeiInput, setImeiInput] = useState("");
  const [imeiTouched, setImeiTouched] = useState(false);

  const isOtherMake = selectedMake === BOOKING_MAKE_OTHER;

  const modelsForMake = useMemo(() => {
    if (!selectedMake || isOtherMake) return [];
    return devices.filter((d) => brandMatchesMake(d.brand, selectedMake));
  }, [devices, selectedMake, isOtherMake]);

  const selectedDevice =
    selectedId != null ? devices.find((d) => d.id === selectedId) ?? null : null;

  const imeiDigits = normalizeImeiDigits(imeiInput);
  const imeiValid = isValidImei15(imeiDigits);
  const imeiShowError = imeiTouched && imeiDigits.length > 0 && !imeiValid;

  const customImeiDigits = normalizeImeiDigits(customImeiInput);
  const customImeiValid = isValidImei15(customImeiDigits);
  const customImeiShowError =
    customImeiTouched && customImeiDigits.length > 0 && !customImeiValid;

  function handleMakeChange(make: string) {
    setSelectedMake(make);
    setSelectedId(null);
    setCustomModel("");
    if (path === "catalog") {
      setCustomImeiInput("");
      setCustomImeiTouched(false);
    }
  }

  function handleNotListed() {
    handleMakeChange(BOOKING_MAKE_OTHER);
  }

  function handleContinue() {
    if (path === "catalog") {
      if (isOtherMake) {
        const model = customModel.trim();
        if (!model) return;
        setCustomImeiTouched(true);
        if (!customImeiValid) return;
        onNext({
          mode: "custom",
          brand: BOOKING_MAKE_OTHER,
          model_name: model,
          imei: customImeiDigits,
        });
        return;
      }
      if (!selectedDevice) return;
      onNext({ mode: "catalog", device: selectedDevice });
      return;
    }

    setImeiTouched(true);
    if (!imeiValid) return;

    if (isOtherMake) {
      const model = customModel.trim();
      if (!model) return;
      onNext({
        mode: "custom",
        brand: BOOKING_MAKE_OTHER,
        model_name: model,
        imei: imeiDigits,
      });
      return;
    }

    if (selectedDevice) {
      onNext({ mode: "catalog", device: selectedDevice, imei: imeiDigits });
      return;
    }

    const modelName = customModel.trim();
    onNext({
      mode: "imei",
      imei: imeiDigits,
      ...(selectedMake
        ? {
            brand: selectedMake,
            ...(modelName ? { model_name: modelName } : {}),
          }
        : {}),
    });
  }

  const canContinueCatalog =
    path === "catalog" &&
    (isOtherMake
      ? customModel.trim().length > 0 && customImeiValid
      : selectedDevice != null);

  const canContinueImei =
    path === "imei" &&
    imeiValid &&
    (!isOtherMake || customModel.trim().length > 0);

  const makeModelSection = (
    <div className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Search make
        </span>
        <select
          value={selectedMake}
          onChange={(e) => handleMakeChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none ring-brand/30 focus:border-brand focus:ring-2"
        >
          <option value="">Select a make…</option>
          {BOOKING_MAKE_OPTIONS.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </select>
      </label>

      {selectedMake && !isOtherMake ? (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Choose a model ({modelsForMake.length} shown)
            </p>
            <button
              type="button"
              onClick={handleNotListed}
              className="text-xs font-medium text-brand hover:underline"
            >
              My model isn&apos;t listed
            </button>
          </div>

          {devices.length === 0 ? (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {catalogUnreachable ? (
                <>
                  <strong className="font-semibold">Can&apos;t reach the API.</strong> Start Django
                  locally or set <code className="rounded bg-amber-100 px-1">API_URL</code> in{" "}
                  <code className="rounded bg-amber-100 px-1">frontend/.env.local</code>. You can
                  still use <strong>Other</strong> with your model name{path === "imei" ? "" : " and IMEI"}.
                </>
              ) : (
                <>
                  No models in the catalog yet. Choose <strong>Other</strong> and enter your model
                  manually{path === "imei" ? "" : ", or use Enter IMEI"}.
                </>
              )}
            </p>
          ) : modelsForMake.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No models loaded for {selectedMake} yet. Use{" "}
              <button
                type="button"
                onClick={handleNotListed}
                className="font-medium text-brand hover:underline"
              >
                My model isn&apos;t listed
              </button>{" "}
              to type your model{path === "catalog" ? ", or switch to Enter IMEI" : ""}.
            </p>
          ) : (
            <ul
              className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-[#f8fafc] p-2 md:max-h-80"
              role="listbox"
              aria-label="Device models"
            >
              {modelsForMake.map((d) => {
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
          )}
        </div>
      ) : null}

      {isOtherMake ? (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Enter your model
          </span>
          <input
            type="text"
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder="e.g. Galaxy S24 Ultra"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none ring-brand/30 placeholder:text-slate-400 focus:border-brand focus:ring-2"
            autoComplete="off"
          />
        </label>
      ) : null}

      {path === "catalog" && isOtherMake ? (
        <>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              IMEI (15 digits)
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={customImeiInput}
              onChange={(e) => setCustomImeiInput(e.target.value)}
              onBlur={() => setCustomImeiTouched(true)}
              placeholder="Required for warranty check"
              aria-invalid={customImeiShowError}
              className={`mt-1.5 w-full rounded-xl border bg-[#f8fafc] px-4 py-3 font-mono text-sm text-slate-900 outline-none ring-brand/30 placeholder:font-sans placeholder:text-slate-400 focus:ring-2 ${
                customImeiShowError
                  ? "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-brand"
              }`}
              autoComplete="off"
            />
          </label>
          {customImeiShowError ? (
            <p className="text-sm text-red-600" role="alert">
              {imeiValidationHint(customImeiDigits)}
            </p>
          ) : null}
        </>
      ) : null}

      {path === "imei" && selectedMake ? (
        <p className="text-xs leading-relaxed text-slate-500">
          Selecting your make and model helps us prepare the right parts while we verify your device
          via IMEI. Models are maintained in our catalog from the backend.
        </p>
      ) : null}

      {path === "catalog" && isOtherMake ? (
        <p className="text-xs leading-relaxed text-slate-500">
          When your make or model isn&apos;t in our list, we need your IMEI to run warranty checks
          and prepare your booking.
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        {path === "imei" ? "Step 1 — Enter your IMEI" : "Step 1 — Device Details"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {path === "imei" ? (
          <>
            Enter your 15-digit IMEI number below. This helps us check your device details in the OEM
            systems and prepare the right parts in advance while we wait for your device to arrive —
            so we can complete your repair faster and get you back online as quickly as possible.
          </>
        ) : (
          <>
            Enter your IMEI number or select your make and model from the list below. We&apos;ll use
            this info to verify your warranty and prepare an accurate quote so you can get back online
            as quickly as possible.
          </>
        )}
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
        <div className="mt-8" role="tabpanel">
          {makeModelSection}
        </div>
      ) : (
        <div className="mt-8 space-y-6" role="tabpanel">
          <div className="space-y-4">
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
                  imeiShowError
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200 focus:border-brand"
                }`}
                autoComplete="off"
              />
            </label>
            <p className="text-xs leading-relaxed text-slate-500">
              Find it on the device box, under Settings → About, or dial{" "}
              <span className="font-mono text-slate-700">*#06#</span> on many phones. Spaces are fine
              — we strip to digits.
            </p>
            {imeiShowError ? (
              <p className="text-sm text-red-600" role="alert">
                {imeiValidationHint(imeiDigits)}
              </p>
            ) : null}
          </div>

          {makeModelSection}
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
        {path === "imei" || (path === "catalog" && isOtherMake) ? (
          <span className="text-xs text-slate-500">
            {(path === "imei" ? imeiDigits : customImeiDigits).length}/15 digits
          </span>
        ) : null}
      </div>
    </div>
  );
}
