"use client";

import Link from "next/link";

type Props = {
  jobReference: string;
  email: string;
  attachmentsUploaded?: number;
  onBookAnother: () => void;
};

export function BookRepairStepSuccess({
  jobReference,
  email,
  attachmentsUploaded = 0,
  onBookAnother,
}: Props) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
        Booking complete
      </p>
      <h2 className="mt-3 font-serif text-xl font-medium leading-snug text-slate-900 md:text-2xl">
        Thank you! Your repair is confirmed
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        Thanks for choosing Hardware Hub — we really appreciate your business! Your repair job has
        been successfully created; below is your job reference number. Save this job reference to
        track your repair progress every step of the way. A confirmation has been sent to your email
        address below.
      </p>

      <div className="mt-6 rounded-xl border border-emerald-200 bg-white px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Job reference
        </p>
        <p className="mt-1 break-all font-mono text-lg font-semibold tracking-tight text-slate-900">
          {jobReference}
        </p>
        <p className="mt-3 text-sm text-slate-700">
          A confirmation has been sent to{" "}
          <span className="font-medium text-slate-900">{email}</span>
        </p>
        {attachmentsUploaded > 0 ? (
          <p className="mt-3 text-sm text-slate-700">
            <strong className="font-semibold">{attachmentsUploaded}</strong> document
            {attachmentsUploaded === 1 ? "" : "s"} uploaded with this booking.
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/track"
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Track your repair
        </Link>
        <button
          type="button"
          onClick={onBookAnother}
          className="inline-flex items-center justify-center rounded-full border-2 border-brand bg-white px-6 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5"
        >
          Book another device
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center text-sm font-medium text-brand underline-offset-4 hover:underline sm:px-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
