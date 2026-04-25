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
        description="Partner login, bulk RMA intake, and invoice lists are available as an MVP scaffold; deep ERP sync and SLA analytics follow when your system is chosen."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-8 md:p-10">
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Use{" "}
              <Link href="/partner/login" className="font-medium text-brand hover:underline">
                Partner login
              </Link>{" "}
              for B2B users created in Django admin. Bulk CSV is stored for now; ERP import and SLA
              dashboards expand in Phase 2.
            </p>
          </div>

          <section id="glossary" className="mt-14 scroll-mt-28">
            <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
              Glossary: bulk RMA, SLA, invoices
            </h2>
            <dl className="mt-6 space-y-6 text-sm leading-relaxed text-slate-600">
              <div>
                <dt className="font-semibold text-slate-900">Bulk RMA</dt>
                <dd className="mt-1">
                  <strong>RMA</strong> (return merchandise authorisation) is how a device is accepted
                  into repair under a partner reference. <strong>Bulk</strong> means uploading many
                  devices at once (usually CSV) instead of one-by-one consumer booking.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">SLA</dt>
                <dd className="mt-1">
                  <strong>Service level agreement</strong> — agreed turnaround and quality targets
                  (e.g. % of jobs within N days). The portal will surface SLA metrics when job data
                  flows from your ERP or from rules in this platform.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Invoices (B2B)</dt>
                <dd className="mt-1">
                  Billing documents for partners: repair charges, periods, and download links (PDF or
                  external billing). Finance teams use them for reconciliation.
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              Longer note for technical teams:{" "}
              <code className="rounded bg-slate-100 px-1">docs/CORPORATE_PORTAL.md</code>
            </p>
          </section>

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
