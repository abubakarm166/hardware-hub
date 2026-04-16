import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "For Businesses",
  description: "Enterprise and B2B repair programmes with Hardware Hub.",
};

const segments: { id: string; title: string; body: string }[] = [
  {
    id: "oem",
    title: "OEM",
    body: "Authorised repair programmes, parts discipline, and brand-aligned reporting for device makers. Architecture is ready for ERP and warranty system integration.",
  },
  {
    id: "mobile-operators",
    title: "Mobile Operators",
    body: "High-volume intake, SLA visibility, and logistics built for national subscriber bases and retail footprints.",
  },
  {
    id: "mvno",
    title: "MVNO",
    body: "Reduce churn with dependable repair paths, transparent job status, and customer-first communications.",
  },
  {
    id: "fintechs-financing",
    title: "Fintechs & Financing",
    body: "Align device protection and lifecycle events with lending, insurance, and BNPL products.",
  },
  {
    id: "businesses",
    title: "Businesses",
    body: "Fleet repairs, consolidated billing, and portals that keep teams productive across sites.",
  },
  {
    id: "insurance",
    title: "Insurance",
    body: "Claims-ready workflows, documentation, and workshop integration for carriers and UMAs.",
  },
  {
    id: "resellers",
    title: "Resellers",
    body: "Differentiate with aftersales bundles, RMA visibility, and partner-grade SLAs.",
  },
  {
    id: "authorized-repair-network",
    title: "Authorized Repair Network",
    body: "Accredited locations, quality standards, and tooling to grow footfall and customer loyalty.",
  },
];

export default function CorporatePage() {
  return (
    <>
      <PageHero
        eyebrow="For Businesses"
        title="Corporate solutions"
        description="The B2B portal—bulk RMA uploads, SLA dashboards, and invoice downloads—is planned after the public MVP. Architecture and routes are prepared for that rollout."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-8 md:p-10">
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Phase 1 focuses on the public experience. When corporate tooling is ready, partners will
              get dedicated portals, bulk intake, SLA visibility, and consolidated reporting—aligned
              with your existing procurement and finance workflows.
            </p>
          </div>

          <section className="mt-16 scroll-mt-28" aria-labelledby="segments-heading">
            <h2 id="segments-heading" className="font-serif text-2xl font-medium text-slate-900 md:text-3xl">
              Who we serve
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
              Explore how Hardware Hub can support your segment. Detailed programmes and pricing will
              be available as partnerships go live.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {segments.map((s) => (
                <div
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
                </div>
              ))}
            </div>
          </section>

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
