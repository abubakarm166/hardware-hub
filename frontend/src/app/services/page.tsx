import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { fetchDevices } from "@/lib/api";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Warranty and out-of-warranty repairs, corporate repair management, and logistics for South Africa.",
};

const pillars = [
  {
    title: "Warranty repairs",
    body: "Manufacturer-aligned diagnostics, parts discipline, and documentation suitable for warranty claims. Ideal when your device is still covered and you need a trusted service path.",
  },
  {
    title: "Out-of-warranty repairs",
    body: "Structured assessments with clear scope and pricing before work proceeds. Designed to reduce surprises and keep you informed at every step.",
  },
  {
    title: "Corporate repair management",
    body: "Volume intake, job visibility, and reporting for insurers, mobile operators, and fleet managers. SLAs and invoicing will connect to your workflows in upcoming phases.",
  },
  {
    title: "Logistics services",
    body: "Walk-in or courier-based options to suit how your organisation moves devices. Courier integrations will be wired in when the platform connects to partner APIs.",
  },
];

export default async function ServicesPage() {
  const devices = await fetchDevices();

  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto max-w-content px-6 pb-16 pt-14 md:pb-20 md:pt-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Services</p>
        <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Repair and logistics built for clarity.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
          Hardware Hub brings accredited multi-brand service under one roof. Below is an overview of
          what we offer; detailed booking and tracking flows will expand as the platform rolls out.
        </p>
      </div>

      <div className="space-y-24 pb-24 pt-4 md:space-y-28 md:pb-32">
        <Section
          title="Core service lines"
          description="Each line is designed to stand alone or combine as your needs grow."
        >
          <div className="grid gap-8 md:grid-cols-2">
            {pillars.map((p) => (
              <article
                key={p.title}
                className="rounded-2xl border border-border bg-background p-8 md:p-10"
              >
                <h2 className="text-xl font-semibold text-foreground">{p.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">{p.body}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section
          title="Sample device catalog"
          description={
            devices.length > 0
              ? "Live rows from the database (dummy seed data). This list will power model lookup and quotes in later phases."
              : "Start the Django API and run `python manage.py seed_dummy_data` to populate example devices."
          }
        >
          {devices.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent-soft/80 text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Model</th>
                    <th className="hidden px-4 py-3 sm:table-cell">SKU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white">
                  {devices.map((d) => (
                    <tr key={d.id} className="text-foreground">
                      <td className="px-4 py-3 font-medium">{d.brand}</td>
                      <td className="px-4 py-3 text-muted">{d.model_name}</td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">
                        {d.sku || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-accent-soft/40 px-6 py-10 text-center text-sm text-muted">
              No catalog data returned. Ensure the backend is running and seed data has been loaded.
            </p>
          )}
        </Section>

        <Section
          title="What’s next on the roadmap"
          description="Phase 1 delivers the marketing site and technical foundation. Upcoming releases add ERP-connected booking, payments, courier APIs, and corporate portals."
        >
          <div className="rounded-2xl border border-border bg-accent-soft/60 p-8 md:p-10">
            <ul className="space-y-3 text-sm text-foreground md:text-base">
              <li className="flex gap-3">
                <span className="text-muted">—</span>
                Vision ERP integration for warranty checks and job creation
              </li>
              <li className="flex gap-3">
                <span className="text-muted">—</span>
                PayFast (or equivalent) for secure card and Instant EFT
              </li>
              <li className="flex gap-3">
                <span className="text-muted">—</span>
                Courier collection booking and waybill tracking
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/book-repair">Book a repair</ButtonLink>
              <ButtonLink href="/" variant="secondary">
                Back to home
              </ButtonLink>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
