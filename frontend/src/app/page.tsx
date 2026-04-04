import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { fetchDevices, uniqueBrands } from "@/lib/api";

const services = [
  {
    title: "Warranty repairs",
    copy: "Authorised workflows aligned with manufacturer standards and documentation.",
  },
  {
    title: "Out-of-warranty",
    copy: "Transparent assessments and quotes before work begins on your device.",
  },
  {
    title: "Corporate programmes",
    copy: "Fleet-scale repair, SLA visibility, and consolidated reporting for partners.",
  },
  {
    title: "Logistics",
    copy: "Collection and return options designed for reliability across South Africa.",
  },
];

const FALLBACK_BRANDS = [
  "Samsung",
  "Apple",
  "Huawei",
  "OPPO",
  "Motorola",
  "Google",
  "Xiaomi",
];

export default async function HomePage() {
  const devices = await fetchDevices();
  const brands = uniqueBrands(devices);
  const accreditationNames = brands.length > 0 ? brands : FALLBACK_BRANDS;

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
              Premium multi-brand service
            </p>
            <h1 className="mt-6 text-balance font-serif text-4xl font-medium tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Repair excellence for devices that keep{" "}
              <span className="text-brand">South Africa</span> connected.
            </h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-white/75 md:text-xl">
              Hardware Hub combines accredited technical capability with a streamlined digital
              experience—from booking to return.
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
          title="Everything in one place"
          description="A single platform for consumers and enterprise partners—built to scale with your repair volumes."
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
            {services.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 h-1 w-10 rounded-full bg-brand" aria-hidden />
                <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.copy}</p>
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
          eyebrow="Corporate"
          title="Solutions for insurers, operators, and fleets"
          description="Dedicated portals, bulk intake, SLA dashboards, and invoicing—structured for high-volume partners."
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
          eyebrow="Accreditations"
          title="OEM-aligned service excellence"
          description={
            devices.length > 0
              ? "Brands represented in our live device catalog (seed data). Replace or extend via the admin API when partner logos are ready."
              : "Showing placeholder brands until the API is reachable—run the backend and `seed_dummy_data` to load catalog data."
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {accreditationNames.map((name) => (
              <div
                key={name}
                className="flex h-24 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-sm font-medium text-slate-800 shadow-sm"
              >
                {name}
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="contact"
          eyebrow="Contact"
          title="Let’s talk about your repair needs"
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
