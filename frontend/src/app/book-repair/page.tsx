import type { Metadata } from "next";
import Link from "next/link";
import { BookRepairWizard } from "@/components/book-repair/BookRepairWizard";
import { PageHero } from "@/components/ui/PageHero";
import { fetchDevicesDetailed, fetchIssueOptionsDetailed } from "@/lib/api";

export const metadata: Metadata = {
  title: "Book a repair",
  description: "Book a device repair with Hardware Hub.",
};

export default async function BookRepairPage() {
  const [{ devices, catalogUnreachable }, { categories, issueOptionsUnreachable }] =
    await Promise.all([fetchDevicesDetailed(), fetchIssueOptionsDetailed()]);

  return (
    <>
      <PageHero
        eyebrow="Booking"
        title="Book a repair"
        description="End-to-end intake: device, issue codes, warranty check, quote, optional documents (PDF/photos), your details, then confirm — we create a repair job, store uploads for staff, and keep a structured payload for external systems."
      />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-content px-6 pb-20 pt-12 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <BookRepairWizard
              devices={devices}
              issueCategories={categories}
              catalogUnreachable={catalogUnreachable}
              issueOptionsUnreachable={issueOptionsUnreachable}
            />
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
