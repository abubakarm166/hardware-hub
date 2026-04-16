type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-white/10 bg-[#0a1628]">
      <div className="mx-auto max-w-content px-6 pb-16 pt-14 md:pb-20 md:pt-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl font-medium tracking-tight text-white md:text-5xl md:leading-[1.15]">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-white/80 md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
