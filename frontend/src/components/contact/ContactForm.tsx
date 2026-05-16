"use client";

import { useState } from "react";
import { LEAD_TYPE_OPTIONS, ZA_REGIONS } from "@/lib/leadFormOptions";

type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "company_name"
  | "region"
  | "lead_type"
  | "phone"
  | "message"
  | "_general";

type FieldErrors = Partial<Record<FieldKey, string>>;

type ContactFormProps = {
  /** Shown on the primary button (e.g. home mockup uses “Submit”). */
  submitLabel?: string;
};

export function ContactForm({ submitLabel = "Submit" }: ContactFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [leadType, setLeadType] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  /** Honeypot — leave empty; bots often fill hidden fields. */
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = "Please enter your first name.";
    if (!lastName.trim()) next.lastName = "Please enter your last name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!region.trim()) next.region = "Please select your province.";
    if (!leadType.trim()) next.lead_type = "Please tell us which option best describes you.";
    if (!message.trim()) next.message = "Please enter a message.";
    else if (message.trim().length < 10) next.message = "Please enter at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const backendFieldKeys = new Set([
    "name",
    "email",
    "phone",
    "company_name",
    "region",
    "lead_type",
    "message",
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email.trim(),
          phone: phone.trim(),
          company_name: companyName.trim(),
          region: region.trim(),
          lead_type: leadType.trim(),
          message: message.trim(),
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const flat: FieldErrors = {};
        let general = "Something went wrong. Please try again.";
        if (typeof data.detail === "string") {
          general = data.detail;
          if (general.trimStart().startsWith("<!DOCTYPE") || general.includes("<html")) {
            general =
              "Could not save your message (server/database error). If the site admin is fixing the API, try again later.";
          }
        }
        for (const [key, val] of Object.entries(data)) {
          if (key === "detail") continue;
          const msg = Array.isArray(val) ? val[0] : val;
          if (typeof msg !== "string") continue;
          if (key === "name") {
            flat.firstName = msg;
            flat.lastName = msg;
          } else if (backendFieldKeys.has(key)) {
            flat[key as keyof FieldErrors] = msg;
          }
        }
        if (Object.keys(flat).length === 0) flat._general = general;
        setErrors(flat);
        return;
      }
      setSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setCompanyName("");
      setRegion("");
      setLeadType("");
      setPhone("");
      setMessage("");
      setHoneypot("");
    } catch {
      setErrors({ _general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-foreground">Message sent</p>
        <p className="mt-2 text-sm text-muted">
          Thank you — we’ll get back to you as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-medium text-foreground underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  const labelClass = "block text-sm font-medium text-foreground";
  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-brand/20 transition-shadow placeholder:text-slate-400 focus:border-slate-300 focus:ring-2";
  const selectClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-brand/20 focus:border-slate-300 focus:ring-2";

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />
      {errors._general ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors._general}
        </p>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-first" className={labelClass}>
            First name <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-first"
            name="firstName"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            placeholder="First name"
          />
          {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName}</p> : null}
        </div>
        <div>
          <label htmlFor="contact-last" className={labelClass}>
            Last name <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-last"
            name="lastName"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            placeholder="Last name"
          />
          {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className={labelClass}>
          Email <span className="text-red-600">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-company" className={labelClass}>
          Company name <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="contact-company"
          name="company_name"
          type="text"
          autoComplete="organization"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
          placeholder="Company or organisation"
        />
        {errors.company_name ? (
          <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-region" className={labelClass}>
          Province <span className="text-red-600">*</span>
        </label>
        <select
          id="contact-region"
          name="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className={selectClass}
          autoComplete="address-level1"
        >
          {ZA_REGIONS.map((o) => (
            <option key={o.value || "empty"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.region ? <p className="mt-1 text-xs text-red-600">{errors.region}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          Phone <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="+27 …"
        />
        {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-lead-type" className={labelClass}>
          Which best describes you? <span className="text-red-600">*</span>
        </label>
        <select
          id="contact-lead-type"
          name="lead_type"
          value={leadType}
          onChange={(e) => setLeadType(e.target.value)}
          className={selectClass}
        >
          {LEAD_TYPE_OPTIONS.map((o) => (
            <option key={o.value || "empty"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.lead_type ? <p className="mt-1 text-xs text-red-600">{errors.lead_type}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Message <span className="text-red-600">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass + " resize-y"}
          placeholder="How can we help?"
        />
        {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">Protected against spam; please submit only once.</p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
