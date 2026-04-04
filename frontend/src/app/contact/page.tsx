import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Hardware Hub for repairs and partnerships.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Send us a message for service enquiries, partnerships, or enterprise programmes. You can also reach us directly by email."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Email</p>
                <a
                  href="mailto:info@hardware-hub.co.za"
                  className="mt-2 inline-block font-serif text-xl font-medium text-slate-900 underline-offset-4 hover:underline"
                >
                  info@hardware-hub.co.za
                </a>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  Address
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Placeholder address
                  <br />
                  South Africa
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  Hours
                </p>
                <p className="mt-2 text-sm text-slate-600">Business hours · SAST</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-sm md:p-8">
              <h2 className="font-serif text-xl font-medium text-slate-900">Send a message</h2>
              <p className="mt-1 text-sm text-slate-600">
                Submissions are stored securely for follow-up (POPIA-aligned handling in production).
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="mt-14 inline-flex text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
