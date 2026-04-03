import type { Metadata } from "next";
import Link from "next/link";
import { fetchDevices } from "@/lib/api";

export const metadata: Metadata = {
  title: "Book a repair",
  description: "Book a device repair with Hardware Hub.",
};

export default async function BookRepairPage() {
  const devices = await fetchDevices();
  const samples = devices.slice(0, 6);

  return (
    <div className="mx-auto max-w-content px-6 py-16 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Book a repair</h1>
      <p className="mt-4 max-w-xl text-muted">
        Online booking with IMEI or model lookup, warranty checks, quotes, uploads, and courier
        scheduling will ship in a later phase. Example models below come from the seeded catalog when
        the API is available.
      </p>

      {samples.length > 0 ? (
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Example models (catalog)
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {samples.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm"
              >
                <span className="font-medium text-foreground">{d.brand}</span>
                <span className="text-muted"> · {d.model_name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-foreground underline">
        ← Back to home
      </Link>
    </div>
  );
}
