import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  /** When true, draws a horizontal rule after the eyebrow (e.g. home Services band). */
  eyebrowRule?: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function Section({
  id,
  eyebrow,
  eyebrowRule = false,
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className="mx-auto max-w-content px-6 lg:px-8">
        {eyebrow ? (
          eyebrowRule ? (
            <div className="flex items-center gap-4">
              <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                {eyebrow}
              </p>
              <div className="h-px min-w-[3rem] flex-1 max-w-[12rem] bg-brand" aria-hidden />
            </div>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
          )
        ) : null}
        <h2 className="mt-3 text-balance font-serif text-2xl font-medium tracking-tight text-foreground md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
