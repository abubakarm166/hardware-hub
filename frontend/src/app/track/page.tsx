import type { Metadata } from "next";
import Link from "next/link";
import { fetchRepairJobs } from "@/lib/api";

export const metadata: Metadata = {
  title: "Track a repair",
  description: "Track your device repair status with Hardware Hub.",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default async function TrackPage() {
  const jobs = await fetchRepairJobs();

  return (
    <div className="mx-auto max-w-content px-6 py-16 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Track a repair</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Full lookup by job number or IMEI will connect to Vision ERP in a future release. Below is
        sample data from the database so you can see how statuses will appear.
      </p>

      {jobs.length > 0 ? (
        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent-soft/80 text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Job reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 md:table-cell">Device</th>
                <th className="hidden px-4 py-3 lg:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {jobs.map((j) => (
                <tr key={j.job_reference} className="text-foreground">
                  <td className="px-4 py-3 font-mono text-xs font-medium md:text-sm">
                    {j.job_reference}
                  </td>
                  <td className="px-4 py-3">{j.status_display}</td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {j.device ? `${j.device.brand} ${j.device.model_name}` : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted lg:table-cell">
                    {formatDate(j.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-border bg-accent-soft/40 px-6 py-10 text-center text-sm text-muted">
          No demo jobs found. Run{" "}
          <code className="rounded bg-border/80 px-1.5 py-0.5 font-mono text-xs">
            python manage.py seed_dummy_data
          </code>{" "}
          and ensure the API is reachable from Next.js (
          <code className="rounded bg-border/80 px-1.5 py-0.5 font-mono text-xs">
            API_URL
          </code>
          ).
        </p>
      )}

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-foreground underline">
        ← Back to home
      </Link>
    </div>
  );
}
