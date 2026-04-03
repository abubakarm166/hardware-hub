import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corporate solutions",
  description: "Enterprise and B2B repair programmes with Hardware Hub.",
};

export default function CorporatePage() {
  return (
    <div className="mx-auto max-w-content px-6 py-20 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Corporate solutions</h1>
      <p className="mt-4 max-w-xl text-muted">
        The B2B portal—bulk RMA uploads, SLA dashboards, and invoice downloads—is planned after the
        public MVP. Architecture and routes are prepared for that rollout.
      </p>
      <Link href="/" className="mt-8 inline-block text-sm font-medium text-foreground underline">
        ← Back to home
      </Link>
    </div>
  );
}
