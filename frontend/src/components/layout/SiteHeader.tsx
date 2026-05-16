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
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo-removebg-preview.png"
            alt="Hardware Hub"
            width={800}
            height={312}
            className="h-10 w-auto object-contain sm:h-12"
            priority
          />
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
