import Link from "next/link";
import { IconBriefcase, IconShield, IconTruck, IconWrench } from "@/components/icons/ServiceLineIcons";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";

const services: {
  title: string;
  copy: string;
  Icon: typeof IconShield;
}[] = [
  {
    title: "Warranty repairs",
    copy: "Authorised workflows aligned with manufacturer standards and documentation.",
    Icon: IconShield,
  },
  {
    title: "Out-of-warranty",
    copy: "Transparent assessments and quotes before work begins on your device.",
    Icon: IconWrench,
  },
  {
    title: "Corporate programmes",
    copy: "Fleet-scale repair, SLA visibility, and consolidated reporting for partners.",
    Icon: IconBriefcase,
  },
  {
    title: "Logistics",
    copy: "Collection and return options designed for reliability across South Africa.",
    Icon: IconTruck,
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[#0a1628]" aria-hidden />
        <div
          className="absolute inset-0 bg-cover bg-[center_top] bg-no-repeat opacity-50"
          style={{ backgroundImage: "url('/hero-pattern.jpg')" }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/95 via-[#0a1628]/88 to-[#0a162870]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-content px-6 pb-24 pt-12 md:pb-32 md:pt-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
              Authorized service &amp; insurance platform
            </p>
            <h1 className="mt-6 text-balance font-serif text-4xl font-medium tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Service excellence that guarantees it&apos;s fixed properly so{" "}
              <span className="text-brand">you</span> get connected faster.
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-white/75 md:text-xl">
              We combine accredited expertise with a seamless digital experience — putting you in full
              control from booking to return.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/book-repair" variant="brand">
                Book a repair
              </ButtonLink>
              <ButtonLink href="/track" variant="onDark">
                Track a repair
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-24 py-20 md:space-y-28 md:py-28">
        <Section
          eyebrow="Services"
          eyebrowRule
          title="Everything in one place"
          description="A single platform for consumers and enterprise partners—built to scale with your repair volumes."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {services.map(({ title, copy, Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                  <Icon />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/services" variant="secondary">
              View all services
            </ButtonLink>
          </div>
        </Section>

        <Section
          eyebrow="Business Services"
          title="Service Solutions for insurers, operators, OEM&apos;s and distributors"
          description="Dedicated portals, bulk intake, SLA dashboards, and invoicing - built for businesses of every size"
        >
          <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-[#f8fafc] p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <p className="max-w-xl text-sm leading-relaxed text-slate-700 md:text-base">
              Phase 1 focuses on the public experience. Corporate tooling and integrations arrive in
              later releases—architecture is ready for ERP, payments, and courier workflows.
            </p>
            <Link
              href="/corporate"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0a1628] px-6 py-3 text-center text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95"
            >
              Corporate overview
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Section>

        <Section
          id="contact"
          eyebrow="Connect"
          eyebrowRule
          title="Let’s talk about your aftersales service needs"
          description="Reach out for service enquiries, partnerships, or enterprise programmes."
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-block h-2 w-2 rounded-full bg-brand" aria-hidden />
              Email{" "}
              <a
                href="mailto:info@hardware-hub.co.za"
                className="font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                info@hardware-hub.co.za
              </a>
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-block h-2 w-2 rounded-full bg-brand/70" aria-hidden />
              Phone placeholder · Business hours SAST
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}
