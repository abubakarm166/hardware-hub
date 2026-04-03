import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Hardware Hub for repairs and partnerships.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-content px-6 py-16 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Contact</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Get in touch</h1>
      <p className="mt-4 max-w-xl text-muted">
        Send us a message for service enquiries, partnerships, or enterprise programmes. You can
        also reach us directly by email.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Email</p>
            <a
              href="mailto:info@hardware-hub.co.za"
              className="mt-2 inline-block text-lg font-medium text-foreground underline-offset-4 hover:underline"
            >
              info@hardware-hub.co.za
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Address</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Placeholder address
              <br />
              South Africa
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Hours</p>
            <p className="mt-2 text-sm text-muted">Business hours · SAST</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-lg font-semibold text-foreground">Send a message</h2>
          <p className="mt-1 text-sm text-muted">
            Submissions are stored securely for follow-up (POPIA-aligned handling in production).
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </div>

      <Link href="/" className="mt-14 inline-block text-sm font-medium text-foreground underline">
        ← Back to home
      </Link>
    </div>
  );
}
