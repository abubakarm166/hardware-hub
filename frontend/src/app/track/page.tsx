import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
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
    <>
      <PageHero
        eyebrow="Tracking"
        title="Track a repair"
        description="Full lookup by job number or IMEI will connect to Vision ERP in a future release. Below is sample data from the database so you can see how statuses will appear."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          {jobs.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-5 py-4">Job reference</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="hidden px-5 py-4 md:table-cell">Device</th>
                    <th className="hidden px-5 py-4 lg:table-cell">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr
                      key={j.job_reference}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-slate-900 md:text-sm">
                        {j.job_reference}
                      </td>
                      <td className="px-5 py-3.5 text-slate-800">{j.status_display}</td>
                      <td className="hidden px-5 py-3.5 text-slate-600 md:table-cell">
                        {j.device ? `${j.device.brand} ${j.device.model_name}` : "—"}
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs text-slate-500 lg:table-cell">
                        {formatDate(j.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-[#f8fafc] px-6 py-12 text-center text-sm text-slate-600">
              No demo jobs found. Run{" "}
              <code className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-xs">
                python manage.py seed_dummy_data
              </code>{" "}
              and ensure the API is reachable from Next.js (
              <code className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-xs">
                API_URL
              </code>
              ).
            </p>
          )}

          <Link
            href="/"
            className="mt-12 inline-flex text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
