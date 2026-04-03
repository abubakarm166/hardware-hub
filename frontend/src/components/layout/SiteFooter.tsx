import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto grid max-w-content gap-10 px-6 py-14 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold tracking-tight">Hardware Hub</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Premium multi-brand repair services for consumers and enterprise across South
            Africa.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Quick links
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/services" className="text-foreground hover:underline">
                Services
              </Link>
            </li>
            <li>
              <Link href="/book-repair" className="text-foreground hover:underline">
                Book a repair
              </Link>
            </li>
            <li>
              <Link href="/track" className="text-foreground hover:underline">
                Track a repair
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Contact
          </p>
          <p className="mt-4 text-sm text-muted">
            Placeholder address, South Africa
            <br />
            <a href="mailto:info@hardware-hub.co.za" className="text-foreground hover:underline">
              info@hardware-hub.co.za
            </a>
          </p>
          <p className="mt-2 text-xs text-muted">© {new Date().getFullYear()} Hardware Hub</p>
        </div>
      </div>
    </footer>
  );
}
