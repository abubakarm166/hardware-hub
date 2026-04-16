import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a1628] text-white">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-14 lg:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2.5">
            <Image
              src="/hardware-hub-logo.png"
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 object-contain opacity-95 brightness-0 invert"
            />
            <span className="font-serif text-lg font-semibold tracking-tight text-white">
              Hardware Hub
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Premium multi-brands service solutions for consumers and businesses.
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
            Connect
          </p>
          <p className="mt-4 text-sm text-white/70">
            Placeholder address, South Africa
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
