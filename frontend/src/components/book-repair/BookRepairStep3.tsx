"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type BookRepairIssuePayload,
  type QuoteResponse,
  formatZarFromCents,
  type WarrantyCheckResponse,
} from "@/lib/booking";
import type { BookRepairStep1Payload } from "./BookRepairStep1";

type Props = {
  step1: BookRepairStep1Payload;
  issue: BookRepairIssuePayload;
  warranty: WarrantyCheckResponse;
  onBack: () => void;
  onNext: (quote: QuoteResponse) => void;
};

export function BookRepairStep3({ step1, issue, warranty, onBack, onNext }: Props) {
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const runQuote = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setQuote(null);

    const body = {
      device_catalog_id: step1.mode === "catalog" ? step1.device.id : null,
      imei: step1.mode === "imei" ? step1.imei : "",
      in_warranty: warranty.in_warranty,
      next_action: warranty.next_action,
    };

    try {
      const res = await fetch("/api/booking/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as QuoteResponse & { detail?: unknown };

      if (!res.ok) {
        const detail = data.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : detail && typeof detail === "object" && !Array.isArray(detail)
              ? Object.entries(detail as Record<string, unknown>)
                  .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
                  .join(" ")
              : "Could not load quote.";
        setErrorMessage(msg);
        setStatus("error");
        return;
      }

      if (typeof data.quote_mode !== "string" || !Array.isArray(data.lines)) {
        setErrorMessage("Unexpected response from server.");
        setStatus("error");
        return;
      }

      setQuote(data as QuoteResponse);
      setStatus("ready");
    } catch {
      setErrorMessage("Network error. Try again.");
      setStatus("error");
    }
  }, [step1, warranty.in_warranty, warranty.next_action]);

  useEffect(() => {
    void runQuote();
  }, [runQuote]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 4 — Quote
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {warranty.in_warranty
          ? "Warranty channel — pricing after inspection."
          : "Indicative out-of-warranty pricing from the catalog (or a generic band if you used IMEI only)."}
      </p>

      <div className="mt-6 space-y-2 rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3 text-sm text-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Context</p>
        {step1.mode === "catalog" ? (
          <p className="mt-1">
            <span className="font-medium text-slate-900">Model:</span> {step1.device.brand} ·{" "}
            {step1.device.model_name}
          </p>
        ) : (
          <p className="mt-1 font-mono text-xs">
            <span className="font-sans font-medium text-slate-900">IMEI:</span> {step1.imei}
          </p>
        )}
        <p className="text-xs text-slate-600">
          Issue: {issue.categoryLabel} · {issue.faultLabel}
        </p>
        <p className="text-xs text-slate-600">
          Warranty: {warranty.in_warranty ? "In warranty" : "Out of warranty"}
          {warranty.source === "erp_live" ? " (live ERP)" : ""}
        </p>
      </div>

      {status === "loading" ? (
        <div className="mt-8 flex items-center gap-3 text-sm text-slate-600">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent"
            aria-hidden
          />
          Building quote…
        </div>
      ) : null}

      {status === "error" && errorMessage ? (
        <div className="mt-8 space-y-4">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={() => void runQuote()}
            className="text-sm font-medium text-brand hover:underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {status === "ready" && quote ? (
        <div className="mt-8 space-y-6">
          {quote.quote_mode === "warranty_channel" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-950">
              <p className="font-medium text-emerald-900">Warranty intake</p>
              <p className="mt-2 leading-relaxed">{quote.summary}</p>
            </div>
          ) : (
            <>
              {quote.source === "generic" ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  You booked with <strong>IMEI only</strong>, so we&apos;re showing a{" "}
                  <strong>generic price band</strong>. Choose your model in step 1 for model-specific
                  lines — or continue and our team will confirm after intake.
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-slate-700">{quote.summary}</p>
              {quote.lines.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[28rem] text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Repair type</th>
                        <th className="px-4 py-3 text-right">Parts</th>
                        <th className="px-4 py-3 text-right">Labour</th>
                        <th className="px-4 py-3 text-right">Line total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quote.lines.map((line) => (
                        <tr key={line.code} className="bg-white">
                          <td className="px-4 py-3 text-slate-900">{line.label}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                            {formatZarFromCents(line.parts_cents)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                            {formatZarFromCents(line.labour_cents)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                            {formatZarFromCents(line.subtotal_cents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <div className="space-y-1 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm">
                <div className="flex justify-between tabular-nums text-slate-700">
                  <span>Subtotal (excl. VAT)</span>
                  <span>{formatZarFromCents(quote.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between tabular-nums text-slate-700">
                  <span>VAT ({Math.round(quote.vat_rate * 100)}%)</span>
                  <span>{formatZarFromCents(quote.vat_cents)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                  <span>Total (incl. VAT)</span>
                  <span>{formatZarFromCents(quote.total_cents)}</span>
                </div>
              </div>
              {quote.disclaimer ? (
                <p className="text-xs leading-relaxed text-slate-500">{quote.disclaimer}</p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to warranty
        </button>
        {status === "ready" && quote ? (
          <button
            type="button"
            onClick={() => onNext(quote)}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Continue to documents
          </button>
        ) : null}
      </div>
    </div>
  );
}
