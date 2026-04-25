"use client";

import { useState } from "react";
import type { BookRepairContactPayload } from "@/lib/booking";

type Props = {
  onBack: () => void;
  onNext: (payload: BookRepairContactPayload) => void;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookRepairStepContact({ onBack, onNext }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("ZA");
  const [touched, setTouched] = useState(false);

  const emailOk = emailRe.test(email.trim());
  const canSubmit =
    fullName.trim().length >= 2 &&
    emailOk &&
    line1.trim().length >= 3 &&
    city.trim().length >= 2 &&
    province.trim().length >= 2 &&
    postalCode.trim().length >= 2;

  function handleContinue() {
    setTouched(true);
    if (!canSubmit) return;
    onNext({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      province: province.trim(),
      postalCode: postalCode.trim(),
      country: country.trim().toUpperCase().slice(0, 2) || "ZA",
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 6 — Your details &amp; address
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        We&apos;ll use this for booking confirmation and courier / return logistics. POPIA: we only
        store what we need to fulfil the repair.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Full name
          </span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={touched && !emailOk}
            className={`mt-1.5 w-full rounded-xl border bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/25 ${
              touched && !emailOk ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-brand"
            }`}
          />
          {touched && !emailOk ? (
            <span className="mt-1 text-xs text-red-600">Enter a valid email (used for tracking).</span>
          ) : null}
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Phone (optional)
          </span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Street address line 1
          </span>
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            autoComplete="address-line1"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Line 2 (optional)
          </span>
          <input
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            autoComplete="address-line2"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            autoComplete="address-level2"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Province / region
          </span>
          <input
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            autoComplete="address-level1"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Postal code
          </span>
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            autoComplete="postal-code"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Country (ISO)
          </span>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            maxLength={2}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm font-mono outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
      </div>

      {touched && !canSubmit ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          Please complete the required fields (name, email, address, city, province, postal code).
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to documents
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Continue to review
        </button>
      </div>
    </div>
  );
}
