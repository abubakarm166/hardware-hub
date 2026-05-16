import { IconLock, IconShield, IconTruck, IconWrench } from "@/components/icons/ServiceLineIcons";

const consumerServices: {
  title: string;
  body: string;
  Icon: typeof IconShield;
}[] = [
  {
    title: "Warranty repairs",
    body: "Manufacturer-approved repairs executed with precision and full OEM compliance. Genuine parts, detailed documentation and expert service you can trust.",
    Icon: IconShield,
  },
  {
    title: "Out-of-warranty repairs",
    body: "Transparent diagnostics and upfront pricing so you stay in full control. Fast, expert repairs that restore your device to original condition with perfection.",
    Icon: IconWrench,
  },
  {
    title: "Value Added Solution",
    body: "Protect your devices with trusted extended warranties and fast, secure nationwide collection & delivery. Safeguard every phone in your family with Precision | Perfection | Premium service.",
    Icon: IconLock,
  },
  {
    title: "Entrepreneurs",
    body: "When your device goes down, your business stops — fast, expert repairs keep revenue flowing. Grow with Hardware Hub as your partner for device services; nationwide collection and delivery.",
    Icon: IconTruck,
  },
];

export function ConsumerServicesSection() {
  return (
    <div className="space-y-16 md:space-y-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">What we do</p>
        <h2 className="mt-3 max-w-3xl text-balance font-serif text-2xl font-medium tracking-tight text-slate-900 md:text-4xl">
          Precision | Perfection | Premium
          <br />
          Device Repair &amp; Protection Services
        </h2>
        <p className="mt-4 max-w-3xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
          A single trusted platform for consumers, entrepreneurs and businesses across South Africa.
          Authorised warranty and out-of-warranty repairs, nationwide logistics and value-added
          protection — all delivered with the precision and care your devices deserve.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">Consumer Services</h3>
        <p className="mt-2 text-base font-medium text-slate-800">
          For Individuals, Entrepreneurs &amp; Families.
        </p>
        <p className="mt-3 max-w-3xl text-pretty text-base leading-relaxed text-slate-600">
          Whether your device is still under warranty or needs expert care, Hardware Hub puts you in
          full control with transparent, premium service from start to finish.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 md:gap-8">
          {consumerServices.map(({ title, body, Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="flex items-center gap-3">
                <Icon />
                <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
              </div>
              {/* <div
                className="mt-4 aspect-[4/3] w-full max-w-[140px] rounded-lg border border-slate-200 bg-slate-50"
                aria-hidden
              /> */}
              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
