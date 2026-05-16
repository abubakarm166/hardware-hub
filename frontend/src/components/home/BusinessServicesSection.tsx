import Link from "next/link";
import { businessServiceSegments } from "@/lib/businessServiceSegments";

export function BusinessServicesSection() {
  return (
    <section className="scroll-mt-24">
      <div className="mx-auto max-w-content px-6 text-center lg:px-8">
        <p className="text-start text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Business Services
        </p>
        <h2 className="mt-3 text-start text-balance font-serif text-2xl font-medium tracking-tight text-foreground md:text-4xl">
          Tailored Solutions for Your Business Needs
        </h2>
        <p className="mt-4 max-w-3xl text-start text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
          A single platform connecting OEMs, mobile operators, MVNOs, insurers and distributors —
          delivering scalable repair, warranty, protection and logistics solutions across South Africa.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {businessServiceSegments.map(({ title, body, Icon }) => (
            <article
              key={title}
              className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-[#f1f5f9] px-6 py-8 text-center shadow-sm"
            >
              <Icon />
              <h3 className="mt-4 text-base font-semibold text-brand">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <Link
            href="/corporate"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a1628] px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95"
          >
            For Businesses
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
