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
        description={
          <>
            <p>Sorry to hear your device is giving you trouble.</p>
            <p>
              Follow our simple, step-by-step booking process below and we&apos;ll have you back online in the
              fastest possible time — with Precision | Perfection | Premium service.
            </p>
            <p>
              The more information and detail you provide (IMEI, model, fault description and photos), the faster your
              repair moves. We use this upfront to ensure the correct parts are already waiting at our centre when your
              device arrives via courier. For out-of-warranty repairs we also give you a fast, transparent quote before
              any work begins.
            </p>
          </>
        }
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
