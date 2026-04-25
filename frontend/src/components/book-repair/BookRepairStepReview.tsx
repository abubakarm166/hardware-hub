"use client";

import { useState } from "react";
import {
  formatZarFromCents,
  type BookingAttachmentKind,
  type BookRepairContactPayload,
  type BookRepairIssuePayload,
  type QuoteResponse,
  type WarrantyCheckResponse,
} from "@/lib/booking";
import type { BookRepairStep1Payload } from "./BookRepairStep1";

export type BookingSubmitResult = {
  job_reference: string;
  public_id: string;
  attachments_uploaded?: number;
};

function attachmentKindLabel(k: BookingAttachmentKind): string {
  if (k === "proof_of_purchase") return "Proof of purchase / invoice";
  if (k === "damage_photo") return "Damage / condition photos";
  return "Other document";
}

type Props = {
  step1: BookRepairStep1Payload;
  issue: BookRepairIssuePayload;
  warranty: WarrantyCheckResponse;
  quote: QuoteResponse;
  contact: BookRepairContactPayload;
  documents: File[];
  attachmentKind: BookingAttachmentKind;
  onBack: () => void;
  onSuccess: (result: BookingSubmitResult) => void;
};

export function BookRepairStepReview({
  step1,
  issue,
  warranty,
  quote,
  contact,
  documents,
  attachmentKind,
  onBack,
  onSuccess,
}: Props) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!agreed) return;
    setLoading(true);
    setError(null);
    try {
      const body = {
        device_catalog_id: step1.mode === "catalog" ? step1.device.id : null,
        imei: step1.mode === "imei" ? step1.imei : "",
        issue_category_id: issue.categoryId,
        issue_fault_code_id: issue.faultCodeId,
        issue_description: issue.description,
        warranty,
        quote,
        customer_name: contact.fullName,
        customer_email: contact.email,
        customer_phone: contact.phone,
        shipping_line1: contact.line1,
        shipping_line2: contact.line2,
        shipping_city: contact.city,
        shipping_province: contact.province,
        shipping_postal_code: contact.postalCode,
        shipping_country: contact.country,
        attachment_kind: attachmentKind,
      };

      let res: Response;
      if (documents.length > 0) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(body));
        documents.forEach((f) => fd.append("documents", f));
        res = await fetch("/api/booking/submit", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/booking/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const data = (await res.json()) as {
        job_reference?: string;
        public_id?: string;
        attachments_uploaded?: number;
        detail?: unknown;
      };
      if (!res.ok) {
        const d = data.detail;
        setError(
          typeof d === "string"
            ? d
            : d && typeof d === "object"
              ? JSON.stringify(d).slice(0, 200)
              : "Could not complete booking.",
        );
        return;
      }
      if (!data.job_reference || !data.public_id) {
        setError("Unexpected response from server.");
        return;
      }
      onSuccess({
        job_reference: data.job_reference,
        public_id: data.public_id,
        attachments_uploaded:
          typeof data.attachments_uploaded === "number" ? data.attachments_uploaded : 0,
      });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 7 — Review &amp; confirm
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Check everything below. Submitting creates your repair intake and stores a structured record
        for our workshop and future system integration.
      </p>

      <div className="mt-8 space-y-6 text-sm">
        <section className="rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Device</h3>
          {step1.mode === "catalog" ? (
            <p className="mt-1 text-slate-800">
              {step1.device.brand} · {step1.device.model_name}
              {step1.device.sku ? ` · SKU ${step1.device.sku}` : ""}
            </p>
          ) : (
            <p className="mt-1 font-mono text-slate-800">IMEI {step1.imei}</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issue</h3>
          <p className="mt-1 text-slate-800">
            <span className="font-medium">{issue.categoryLabel}</span>
            <span className="text-slate-500"> ({issue.categoryCode})</span>
          </p>
          <p className="mt-1 text-slate-800">
            <span className="font-medium">{issue.faultLabel}</span>
            <span className="text-slate-500"> ({issue.faultCode})</span>
          </p>
          {issue.description ? (
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{issue.description}</p>
          ) : (
            <p className="mt-2 text-xs italic text-slate-500">No extra description provided.</p>
          )}
        </section>

        <section className="rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Warranty &amp; pricing
          </h3>
          <p className="mt-1 text-slate-800">
            Warranty: {warranty.in_warranty ? "In warranty" : "Out of warranty"}
            {warranty.source === "erp_live" ? " (connected system)" : ""}
          </p>
          {quote.quote_mode === "warranty_channel" ? (
            <p className="mt-2 text-slate-700">{quote.summary}</p>
          ) : (
            <p className="mt-2 font-medium text-slate-900">
              Indicative total {formatZarFromCents(quote.total_cents)} incl. VAT
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents</h3>
          {documents.length === 0 ? (
            <p className="mt-1 text-slate-600">None attached (you can still submit).</p>
          ) : (
            <>
              <p className="mt-1 text-slate-800">
                {documents.length} file{documents.length === 1 ? "" : "s"} ·{" "}
                {attachmentKindLabel(attachmentKind)}
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-slate-600">
                {documents.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="truncate">
                    {f.name}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</h3>
          <p className="mt-1 text-slate-800">{contact.fullName}</p>
          <p className="text-slate-700">{contact.email}</p>
          {contact.phone ? <p className="text-slate-700">{contact.phone}</p> : null}
          <p className="mt-2 text-slate-700">
            {contact.line1}
            {contact.line2 ? `, ${contact.line2}` : ""}
            <br />
            {contact.city}, {contact.province} {contact.postalCode}
            <br />
            {contact.country}
          </p>
        </section>
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 rounded border-slate-300 text-brand focus:ring-brand"
        />
        <span>
          I confirm the details are correct and agree to the{" "}
          <a href="/services" className="font-medium text-brand underline-offset-2 hover:underline">
            service terms
          </a>{" "}
          and processing of my data for this repair booking.
        </span>
      </label>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50"
        >
          ← Back to details
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!agreed || loading}
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Submitting…" : "Submit booking"}
        </button>
      </div>
    </div>
  );
}
