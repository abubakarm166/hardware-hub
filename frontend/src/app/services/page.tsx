import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { IconBriefcase, IconShield, IconTruck, IconWrench } from "@/components/icons/ServiceLineIcons";
import { fetchDevices } from "@/lib/api";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Warranty and out-of-warranty repairs, corporate repair management, and logistics for South Africa.",
};

const pillars: {
  title: string;
  body: string;
  Icon: typeof IconShield;
  popular?: boolean;
}[] = [
  {
    title: "Warranty repairs",
    body: "Manufacturer-aligned diagnostics, parts discipline, and documentation suitable for warranty claims. Ideal when your device is still covered and you need a trusted service path.",
    Icon: IconShield,
    popular: true,
  },
  {
    title: "Out-of-warranty repairs",
    body: "Structured assessments with clear scope and pricing before work proceeds. Designed to reduce surprises and keep you informed at every step.",
    Icon: IconWrench,
  },
  {
    title: "Corporate repair management",
    body: "Volume intake, job visibility, and reporting for insurers, mobile operators, and fleet managers. SLAs and invoicing will connect to your workflows in upcoming phases.",
    Icon: IconBriefcase,
  },
  {
    title: "Logistics services",
    body: "Walk-in or courier-based options to suit how your organisation moves devices. Courier integrations will be wired in when the platform connects to partner APIs.",
    Icon: IconTruck,
  },
];

const roadmapItems = [
  "ERP integration for warranty checks and job creation",
  "PayFast (or equivalent) for secure card and Instant EFT",
  "Courier collection booking and waybill tracking",
];

export default async function ServicesPage() {
  const devices = await fetchDevices();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Next-generation repair and logistics built for clarity."
        description="Hardware Hub is a next-generation mobile device repair and aftersales services company, purpose-built for scale, compliance, and trust. We operate a best-in-class, ISO-aligned high-volume workshop that redefines service excellence through precision, transparency, and customer-centric delivery."
      />

      <div className="border-b border-slate-200 bg-white">
        <div className="space-y-24 pb-24 pt-16 md:space-y-28 md:pb-32 md:pt-20">
          <Section
            eyebrow="What we do"
            title="Core service lines"
            description="Each line is designed to stand alone or combine as your needs grow."
          >
            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              {pillars.map((p) => (
                <article
                  key={p.title}
                  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                    <p.Icon />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{p.title}</h2>
                    {p.popular ? (
                      <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">{p.body}</p>
                </article>
              ))}
            </div>
          </Section>

          <section className="scroll-mt-24 border-t border-slate-200 bg-[#f8fafc] py-16 md:py-24">
            <div className="mx-auto max-w-content px-6 lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Catalog</p>
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-slate-900 md:text-4xl">
                Sample device catalog
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
                {devices.length > 0
                  ? "Live rows from the database (dummy seed data). This list will power model lookup and quotes in later phases."
                  : "Start the Django API and run `python manage.py seed_dummy_data` to populate example devices."}
              </p>

              <div className="mt-10">
                {devices.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                        <tr>
                          <th className="px-5 py-4">Brand</th>
                          <th className="px-5 py-4">Model</th>
                          <th className="hidden px-5 py-4 sm:table-cell">SKU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devices.map((d, i) => (
                          <tr
                            key={d.id}
                            className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                          >
                            <td className="px-5 py-3.5 font-medium text-slate-900">{d.brand}</td>
                            <td className="px-5 py-3.5 text-slate-600">{d.model_name}</td>
                            <td className="hidden px-5 py-3.5 font-mono text-xs text-slate-500 sm:table-cell">
                              {d.sku || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">
                    No catalog data returned. Ensure the backend is running and seed data has been
                    loaded.
                  </p>
                )}
              </div>
            </div>
          </section>

          <Section
            eyebrow="Roadmap"
            title="What’s next on the roadmap"
            description="Phase 1 delivers the marketing site and technical foundation. Upcoming releases add ERP-connected booking, payments, courier APIs, and corporate portals."
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
              <ul className="space-y-4 text-sm text-slate-800 md:text-base">
                {roadmapItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <ButtonLink href="/book-repair" variant="brand" className="gap-2">
                  Book a repair
                  <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink href="/" variant="secondary">
                  Back to home
                </ButtonLink>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
