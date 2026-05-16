import { ContactForm } from "@/components/contact/ContactForm";
import { BusinessServicesSection } from "@/components/home/BusinessServicesSection";
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
    copy: "Expert warranty servicing that meets every OEM specification, complete with detailed reporting and documentation you can trust.",
    Icon: IconShield,
  },
  {
    title: "Out-of-warranty",
    copy: "Request your repair online, see the exact cost upfront, and get your device restored to original condition with expert service you can trust.",
    Icon: IconWrench,
  },
  {
    title: "For Businesses",
    copy: "Scalable B2B programs designed around your needs with custom SLAs, real-time visibility, consolidated reporting, and dedicated support ",
    Icon: IconBriefcase,
  },
  {
    title: "Value Added Services",
    copy: "Protect your devices with trusted extended warranties, get fast and secure collection & delivery anywhere in South Africa, and let us safeguard every phone in your family.",
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

        <BusinessServicesSection />

        <Section
          id="contact"
          eyebrow="Connect"
          eyebrowRule
          title="Let’s talk about your aftersales service needs"
          description="Feel free to connect with us regarding questions or specific solution needs."
        >
          <div className="rounded-2xl border border-slate-200 bg-[#eef6f8] p-8 shadow-sm md:p-10">
            <ContactForm submitLabel="Submit" />
          </div>
        </Section>
      </div>
    </>
  );
}
