import type { Metadata } from "next";
import Link from "next/link";
import { TrackRepairLookup } from "@/components/track/TrackRepairLookup";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Track a repair",
  description: "Track your device repair status with Hardware Hub.",
};

export default function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Tracking"
        title="Track a repair"
        description="Enter your job reference and the email on file. Status comes from our system today and can sync from your operations ERP later."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <TrackRepairLookup />
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
