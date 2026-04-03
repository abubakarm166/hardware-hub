import Link from "next/link";

const nav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/book-repair", label: "Book repair" },
  { href: "/track", label: "Track repair" },
  { href: "/corporate", label: "Corporate" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          Hardware Hub
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Contact
        </Link>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-border/60 px-6 py-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-sm font-medium text-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
