import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Corporate solutions",
  description: "Enterprise and B2B repair programmes with Hardware Hub.",
};

export default function CorporatePage() {
  return (
    <>
      <PageHero
        eyebrow="Corporate"
        title="Corporate solutions"
        description="The B2B portal—bulk RMA uploads, SLA dashboards, and invoice downloads—is planned after the public MVP. Architecture and routes are prepared for that rollout."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-8 md:p-10">
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Phase 1 focuses on the public experience. When corporate tooling is ready, partners will
              get dedicated portals, bulk intake, SLA visibility, and consolidated reporting—aligned
              with your existing procurement and finance workflows.
            </p>
          </div>
          <Link
            href="/"
            className="mt-12 inline-flex text-sm font-medium text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
