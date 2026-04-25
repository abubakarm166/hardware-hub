"use client";

import { useState } from "react";
import type { DeviceCatalog } from "@/lib/api";

export type TrackTimelineStep = {
  status: string;
  label: string;
  complete: boolean;
};

export type TrackLookupSuccess = {
  job_reference: string;
  status: string;
  status_display: string;
  device: DeviceCatalog | null;
  updated_at: string;
  timeline: TrackTimelineStep[];
};

export function TrackRepairLookup() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackLookupSuccess | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tracking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_reference: reference.trim(),
          email: email.trim(),
        }),
      });
      const data = (await res.json()) as TrackLookupSuccess & { detail?: string };
      if (!res.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Lookup failed.");
        return;
      }
      if (!data.job_reference || !Array.isArray(data.timeline)) {
        setError("Unexpected response.");
        return;
      }
      setResult(data as TrackLookupSuccess);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="font-serif text-lg font-medium text-slate-900">Look up your repair</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the <strong>job reference</strong> we gave you and the <strong>email</strong> on the
          job (same as used when booking).
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="track-ref" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Job reference
            </label>
            <input
              id="track-ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 font-mono text-sm"
              placeholder="e.g. HH-DEMO-240001"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="track-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Email on file
            </label>
            <input
              id="track-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Demo after seed: reference <code className="rounded bg-slate-100 px-1">HH-DEMO-240001</code> and email{" "}
          <code className="rounded bg-slate-100 px-1">demo-track@hardwarehub.test</code>
        </p>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Searching…" : "Track repair"}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>
      ) : null}

      {result ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-mono text-lg font-semibold text-slate-900">{result.job_reference}</h3>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              {result.status_display}
            </span>
          </div>
          {result.device ? (
            <p className="mt-2 text-sm text-slate-600">
              {result.device.brand} · {result.device.model_name}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            Updated {new Date(result.updated_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })}
          </p>

          {result.status === "intake_submitted" ? (
            <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-sky-950">
              <strong className="font-semibold">This does not mean we have your device yet.</strong> It means your
              online booking is on file. The next step on the timeline is <strong className="font-semibold">Received</strong>{" "}
              — we move you there when the physical device is checked in at the workshop. Follow the instructions you
              were given to send or drop off the device.
            </p>
          ) : null}

          <ol className="mt-8 space-y-0 border-l-2 border-slate-200 pl-6">
            {result.timeline.map((step) => (
              <li key={step.status} className="relative pb-8 last:pb-0">
                <span
                  className={`absolute -left-[1.55rem] top-1.5 h-3 w-3 rounded-full border-2 ${
                    step.complete ? "border-brand bg-brand" : "border-slate-300 bg-white"
                  }`}
                />
                <p className={`text-sm font-medium ${step.complete ? "text-slate-900" : "text-slate-400"}`}>
                  {step.label}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
