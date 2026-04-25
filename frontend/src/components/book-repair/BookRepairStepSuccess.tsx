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
      <h2 className="mt-2 font-serif text-xl font-medium text-slate-900 md:text-2xl">
        You&apos;re on the list
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        We&apos;ve opened a repair intake. Save your reference — you&apos;ll need it with your email
        to track progress.
      </p>

      <div className="mt-6 rounded-xl border border-emerald-200 bg-white px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Job reference
        </p>
        <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-slate-900">
          {jobReference}
        </p>
        <p className="mt-3 text-xs text-slate-500">Confirmation sent contextually to</p>
        <p className="font-medium text-slate-800">{email}</p>
        {attachmentsUploaded > 0 ? (
          <p className="mt-3 text-sm text-slate-700">
            <strong className="font-semibold">{attachmentsUploaded}</strong> document
            {attachmentsUploaded === 1 ? "" : "s"} uploaded with this booking. Staff can download them
            from the job in admin.
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/track"
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Track your repair
        </Link>
        <button
          type="button"
          onClick={onBookAnother}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Book another device
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline sm:px-2"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
