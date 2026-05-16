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
    body: "Authorised repair partner delivering compliant in- and out-of-warranty services at scale. Real-time integration, L1–L3 certified technicians, fast TAT and OEM insurance sales.",
  },
  {
    id: "mobile-operators",
    title: "Mobile Network Operators",
    body: "Strategic repair and insurance partner for mobile network operators. High-volume authorised repairs, seamless insurance conversion and real-time visibility — reducing subscriber churn through exceptional service.",
  },
  {
    id: "mvno",
    title: "MVNO",
    body: "End-to-end device service infrastructure to launch and scale your MVNO. Authorised repairs, warranty & insurance programmes designed to reduce churn and deliver premium customer experiences.",
  },
  {
    id: "fintechs-financing",
    title: "Fintechs & Financing",
    body: "Device protection and repair solutions tailored for lending, insurance and BNPL products. Seamless claims processing and repair fulfilment that protect your portfolio and strengthen customer loyalty.",
  },
  {
    id: "businesses",
    title: "Businesses",
    body: "Minimise costly device downtime for your team and keep your business moving. Register as a partner and experience Precision | Perfection | Premium repairs, collection and nationwide delivery.",
  },
  {
    id: "insurance",
    title: "Insurance",
    body: "Efficient claims processing and repair fulfilment for device insurers. Streamlined workflows, audit-ready quality control, fast TAT and high customer satisfaction at scale.",
  },
  {
    id: "resellers",
    title: "Resellers",
    body: "Premium after-sales support that helps resellers differentiate and build customer loyalty. Authorised repairs, RMA visibility, SLA compliance and partner-grade service.",
  },
  {
    id: "authorized-repair-network",
    title: "Authorized Repair Network",
    body: "Watch this space as we gear up our Authorized Repair Network — quality standards, tooling, and partner growth programmes.",
  },
];

export default function CorporatePage() {
  return (
    <>
      <PageHero
        eyebrow="For Businesses"
        title="Business Solutions"
        description="Hardware Hub is your trusted partner for corporate device repair and fleet management. We treat every staff and customer device with the utmost care during what can be a difficult time — managing risk at every step and ensuring your devices are returned in like-new condition with Precision | Perfection | Premium service."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <section className="scroll-mt-28" aria-labelledby="segments-heading">
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
