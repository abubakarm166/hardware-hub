import Image from "next/image";
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
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-[#f8fafc]">
      <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/hardware-hub-logo.png"
            alt="Hardware Hub"
            width={220}
            height={56}
            className="h-9 w-auto sm:h-10"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95"
        >
          Contact
        </Link>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-slate-200/80 px-6 py-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-sm font-medium text-slate-600"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
