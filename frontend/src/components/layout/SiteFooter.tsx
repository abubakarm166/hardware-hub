import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a1628] text-white">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-14 lg:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo-removebg-preview.png"
              alt="Hardware Hub"
              width={800}
              height={312}
              className="h-10 w-auto object-contain sm:h-12"
            />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Premium multi-brand service solutions for consumers and businesses.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Quick links
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/services" className="text-white/85 hover:text-white hover:underline">
                Services
              </Link>
            </li>
            <li>
              <Link href="/book-repair" className="text-white/85 hover:text-white hover:underline">
                Book a repair
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-white/85 hover:text-white hover:underline">
                Track a repair
              </Link>
            </li>
            <li>
              <Link href="/corporate" className="text-white/85 hover:text-white hover:underline">
                For Businesses
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Let&apos;s Connect
          </p>
          <p className="mt-4 text-sm text-white/70">
            Building 7, Burnside Office Park, Craighall, 2196, South Africa
            <br />
            <a href="mailto:info@hardware-hub.co.za" className="text-white hover:underline">
              info@hardware-hub.co.za
            </a>
          </p>
          <p className="mt-2 text-xs text-white/50">© {new Date().getFullYear()} Hardware Hub</p>
        </div>
      </div>
    </footer>
  );
}
