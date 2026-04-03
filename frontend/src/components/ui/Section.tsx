import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      <div className="mx-auto max-w-content px-6 lg:px-8">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted md:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
