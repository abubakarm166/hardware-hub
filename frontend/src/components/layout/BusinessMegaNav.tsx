"use client";

import Link from "next/link";
import { useRef, useState } from "react";

const SEGMENTS: { href: string; title: string; description: string }[] = [
  {
    href: "/corporate#oem",
    title: "OEM",
    description:
      "Authorised repair programmes, parts discipline, and brand-aligned reporting for device makers.",
  },
  {
    href: "/corporate#mobile-operators",
    title: "Mobile Operators",
    description:
      "High-volume intake, SLA visibility, and logistics built for national subscriber bases.",
  },
  {
    href: "/corporate#mvno",
    title: "MVNO",
    description:
      "Reduce churn with dependable repair paths and transparent status for your customers.",
  },
  {
    href: "/corporate#fintechs-financing",
    title: "Fintechs & Financing",
    description:
      "Align device protection and lifecycle events with lending, insurance, and BNPL products.",
  },
  {
    href: "/corporate#businesses",
    title: "Businesses",
    description:
      "Fleet repairs, consolidated billing, and portals that keep teams productive across sites.",
  },
  {
    href: "/corporate#insurance",
    title: "Insurance",
    description:
      "Claims-ready workflows, documentation, and workshop integration for carriers and UMAs.",
  },
  {
    href: "/corporate#resellers",
    title: "Resellers",
    description:
      "Differentiate with aftersales bundles, RMA visibility, and partner-grade SLAs.",
  },
  {
    href: "/corporate#authorized-repair-network",
    title: "Authorized Repair Network",
    description:
      "Accredited locations, quality standards, and tools to grow footfall and loyalty.",
  },
];

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BusinessMegaNav() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function handleEnter() {
    clearClose();
    setOpen(true);
  }

  function handleLeave() {
    clearClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href="/corporate"
        className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors hover:text-slate-900 ${
          open ? "text-slate-900" : "text-slate-600"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        For Businesses
        <ChevronDown className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </Link>

      {open ? (
        <div
          className="absolute left-1/2 top-full z-50 mt-2 w-[min(56rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          role="region"
          aria-label="For Businesses"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SEGMENTS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group block rounded-xl p-3 transition-colors hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900 group-hover:text-brand">
                  {item.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 text-center">
            <Link
              href="/corporate"
              className="text-sm font-medium text-brand hover:underline"
            >
              View all business services →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
