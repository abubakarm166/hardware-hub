import Image from "next/image";
import Link from "next/link";
import { BusinessMegaNav } from "@/components/layout/BusinessMegaNav";

const mainNav = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/book-repair", label: "Book repair" },
  { href: "/track", label: "Track repair" },
  { href: "/partner/login", label: "Partner" },
];

const mobileNav = [
  ...mainNav,
  { href: "/corporate", label: "For Businesses" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-[#f8fafc]">
      <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <Image
            src="/hardware-hub-logo.png"
            alt=""
            width={48}
            height={48}
            className="h-9 w-9 object-contain sm:h-10 sm:w-10"
            priority
          />
          <span className="font-sans text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Hardware Hub
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
          <BusinessMegaNav />
        </nav>
        <Link
          href="/contact"
          className="whitespace-nowrap rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95"
        >
          Let&apos;s Connect
        </Link>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-slate-200/80 px-6 py-3 md:hidden">
        {mobileNav.map((item) => (
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
