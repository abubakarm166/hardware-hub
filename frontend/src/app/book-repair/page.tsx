import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { fetchDevices } from "@/lib/api";

export const metadata: Metadata = {
  title: "Book a repair",
  description: "Book a device repair with Hardware Hub.",
};

export default async function BookRepairPage() {
  const devices = await fetchDevices();
  const samples = devices.slice(0, 6);

  return (
    <>
      <PageHero
        eyebrow="Booking"
        title="Book a repair"
        description="Online booking with IMEI or model lookup, warranty checks, quotes, uploads, and courier scheduling will ship in a later phase. Example models below come from the seeded catalog when the API is available."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          {samples.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Example models (catalog)
              </p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {samples.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-slate-200 bg-[#f8fafc] px-5 py-4 text-sm shadow-sm"
                  >
                    <span className="font-medium text-slate-900">{d.brand}</span>
                    <span className="text-slate-600"> · {d.model_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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
