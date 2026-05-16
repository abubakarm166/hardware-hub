import { businessServiceSegments } from "@/lib/businessServiceSegments";

export function BusinessServicesPageSection() {
  return (
    <section className="scroll-mt-24 border-t border-slate-200">
      <div className=" bg-white  md:py-10">
        <div className="mx-auto max-w-content px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-dark md:text-4xl">
            Business Services
          </h2>
          <p className="mt-3 max-w-3xl text-lg font-medium text-dark/95 md:text-xl">
            Tailored Aftersales Solutions for the Mobile Ecosystem
          </p>
          <div className="mt-8 max-w-3xl space-y-5 text-base leading-relaxed text-dark/75 md:text-lg">
            <p>
              We partner with OEMs, mobile operators, MVNOs, insurers and distributors to deliver simple,
              efficient workflows that manage your entire after-sales service — from Out-of-Box Failures
              (OBF) and warranty claims through to repairs and replacements.
            </p>
            <p>
              As an accredited authorised repair partner for all major brands, we take the hassle out of
              the hassle. We handle end-user queries, reduce your operational costs, protect your margins,
              and elevate brand perception through Precision | Perfection | Premium service delivery in a
              fully controlled, audit-ready environment with strict data security protocols.
            </p>
            <p>
              Every solution is purpose-built for your specific market while remaining highly adaptable to
              your exact requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-content px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {businessServiceSegments.map(({ title, body, Icon }) => (
              <article
                key={title}
                className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm"
              >
                <Icon />
                <h3 className="mt-4 text-base font-semibold text-brand">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
