"use client";

import { useCallback, useEffect, useState } from "react";
import {
  normalizeWarrantySource,
  type BookRepairIssuePayload,
  type WarrantyCheckResponse,
} from "@/lib/booking";
import type { BookRepairStep1Payload } from "./BookRepairStep1";

type Props = {
  step1: BookRepairStep1Payload;
  issue: BookRepairIssuePayload;
  onBack: () => void;
  onNext: (warranty: WarrantyCheckResponse) => void;
};

export function BookRepairStep2({ step1, issue, onBack, onNext }: Props) {
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<WarrantyCheckResponse | null>(null);

  const runCheck = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setResult(null);

    const body =
      step1.mode === "catalog"
        ? { device_catalog_id: step1.device.id, imei: "" }
        : { imei: step1.imei };

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
        source: normalizeWarrantySource(
          typeof data.source === "string" ? data.source : undefined
        ),
      };
      setResult(normalized);
      setStatus("ready");
    } catch {
      setErrorMessage("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }, [step1]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 3 — Warranty check
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        We check warranty against our configured rules and integrations. Until your external
        warranty API is connected, you still get a clear in-app result so the journey completes.
      </p>

      <div className="mt-6 space-y-3 rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3 text-sm text-slate-700">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Device</p>
          {step1.mode === "catalog" ? (
            <p className="mt-1">
              <span className="font-medium text-slate-900">Model:</span> {step1.device.brand} ·{" "}
              {step1.device.model_name}
            </p>
          ) : (
            <p className="mt-1 font-mono text-sm">
              <span className="font-sans font-medium text-slate-900">IMEI:</span> {step1.imei}
            </p>
          )}
        </div>
        <div className="border-t border-slate-200/80 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issue</p>
          <p className="mt-1 text-slate-800">
            {issue.categoryLabel} · {issue.faultLabel}
          </p>
          {issue.description ? (
            <p className="mt-1 text-xs text-slate-600 line-clamp-3">{issue.description}</p>
          ) : null}
        </div>
      </div>

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
            <p className="mt-3 text-xs text-slate-600">
              Next:{" "}
              <span className="font-medium text-slate-800">
                {result.next_action === "warranty_intake"
                  ? "Warranty intake channel"
                  : "Automated out-of-warranty quote"}
              </span>
            </p>
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
          ← Back to issue details
        </button>
        {status === "ready" && result ? (
          <button
            type="button"
            onClick={() => onNext(result)}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Continue to quote
          </button>
        ) : null}
      </div>
    </div>
  );
}
