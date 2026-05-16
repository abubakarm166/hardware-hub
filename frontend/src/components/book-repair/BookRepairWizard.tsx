"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DeviceCatalog, IssueCategoryOption } from "@/lib/api";
import type { BookRepairStep1Payload } from "@/lib/bookRepairMakes";
import {
  BOOKING_WIZARD_TOTAL_STEPS,
  canViewBookingStep,
  resolveBookingWizardStep,
  type BookingWizardData,
} from "@/lib/bookRepairWizardSteps";
import {
  deferredQuotePlaceholder,
  type BookingAttachmentKind,
  type BookRepairContactPayload,
  type BookRepairIssuePayload,
  type QuoteResponse,
  type WarrantyCheckResponse,
} from "@/lib/booking";
import { BookRepairStep1 } from "./BookRepairStep1";
import { BookRepairStep2 } from "./BookRepairStep2";
import { BookRepairStepContact } from "./BookRepairStepContact";
import { BookRepairStepDocuments } from "./BookRepairStepDocuments";
import { BookRepairStepIssue } from "./BookRepairStepIssue";
import type { BookingSubmitResult } from "./BookRepairStepReview";
import { BookRepairStepReview } from "./BookRepairStepReview";
import { BookRepairStepSuccess } from "./BookRepairStepSuccess";

type Props = {
  devices: DeviceCatalog[];
  issueCategories: IssueCategoryOption[];
  catalogUnreachable?: boolean;
  issueOptionsUnreachable?: boolean;
};

type HistoryState = { bookingStep: number };

const EMPTY_WIZARD: BookingWizardData = {
  step1: null,
  issue: null,
  contact: null,
  warranty: null,
  quote: null,
  submitResult: null,
};

function syncStepInUrl(step: number, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(step));
  const state: HistoryState = { bookingStep: step };
  if (replace) {
    window.history.replaceState(state, "", url);
  } else {
    window.history.pushState(state, "", url);
  }
}

export function BookRepairWizard({
  devices,
  issueCategories,
  catalogUnreachable = false,
  issueOptionsUnreachable = false,
}: Props) {
  const [step, setStep] = useState(1);
  const stepRef = useRef(step);
  stepRef.current = step;

  const [step1, setStep1] = useState<BookRepairStep1Payload | null>(null);
  const [issue, setIssue] = useState<BookRepairIssuePayload | null>(null);
  const [contact, setContact] = useState<BookRepairContactPayload | null>(null);
  const [warranty, setWarranty] = useState<WarrantyCheckResponse | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [attachmentKind, setAttachmentKind] = useState<BookingAttachmentKind>("proof_of_purchase");
  const [submitResult, setSubmitResult] = useState<BookingSubmitResult | null>(null);

  const wizardData = useMemo<BookingWizardData>(
    () => ({ step1, issue, contact, warranty, quote, submitResult }),
    [step1, issue, contact, warranty, quote, submitResult]
  );

  const wizardDataRef = useRef(wizardData);
  wizardDataRef.current = wizardData;

  const goToStep = useCallback(
    (next: number, options?: { replace?: boolean; data?: BookingWizardData }) => {
      const data = options?.data ?? wizardDataRef.current;
      const resolved =
        options?.data && canViewBookingStep(next, data)
          ? next
          : resolveBookingWizardStep(next, data);
      setStep(resolved);
      syncStepInUrl(resolved, options?.replace);
    },
    []
  );

  const goBack = useCallback(() => {
    if (stepRef.current > 1) {
      window.history.back();
    }
  }, []);

  // Initial URL + browser back/forward
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = Number(url.searchParams.get("step"));
    const requested =
      Number.isFinite(fromUrl) && fromUrl >= 1 && fromUrl <= BOOKING_WIZARD_TOTAL_STEPS
        ? fromUrl
        : 1;
    const resolved = resolveBookingWizardStep(requested, EMPTY_WIZARD);
    setStep(resolved);
    syncStepInUrl(resolved, true);

    const onPopState = (event: PopStateEvent) => {
      const s = (event.state as HistoryState | null)?.bookingStep;
      const requestedStep =
        typeof s === "number" && s >= 1 && s <= BOOKING_WIZARD_TOTAL_STEPS
          ? s
          : Math.max(1, stepRef.current - 1);
      const resolvedStep = resolveBookingWizardStep(requestedStep, wizardDataRef.current);
      setStep(resolvedStep);
      if (typeof s !== "number" || s !== resolvedStep) {
        syncStepInUrl(resolvedStep, true);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recover when URL step is ahead of saved answers (blank screen).
  useEffect(() => {
    if (canViewBookingStep(step, wizardData)) return;
    const resolved = resolveBookingWizardStep(step, wizardData);
    if (resolved !== step) {
      setStep(resolved);
      syncStepInUrl(resolved, true);
    }
  }, [step, wizardData]);

  const resetAll = useCallback(() => {
    setStep1(null);
    setIssue(null);
    setContact(null);
    setWarranty(null);
    setQuote(null);
    setDocuments([]);
    setAttachmentKind("proof_of_purchase");
    setSubmitResult(null);
    setStep(1);
    syncStepInUrl(1, true);
  }, []);

  const stepLabel =
    submitResult != null ? (
      <span className="text-emerald-700">Complete</span>
    ) : (
      <>
        Step <span className="font-semibold text-slate-900">{step}</span> of{" "}
        {BOOKING_WIZARD_TOTAL_STEPS}
      </>
    );

  const showStep1 = step === 1;
  const showIssue = step === 2 && !!step1;
  const showContact = step === 3 && !!step1 && !!issue;
  const showWarranty = step === 4 && canViewBookingStep(4, wizardData);
  const showDocuments = step === 5 && canViewBookingStep(5, wizardData);
  const showReview = step === 6 && canViewBookingStep(6, wizardData);
  const showSuccess = step === 7 && canViewBookingStep(7, wizardData);

  const recoveryStep = resolveBookingWizardStep(step, wizardData);
  const stuckWithoutPanel =
    !showStep1 &&
    !showIssue &&
    !showContact &&
    !showWarranty &&
    !showDocuments &&
    !showReview &&
    !showSuccess;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Book a repair
        </p>
        <p className="text-sm text-slate-600">{stepLabel}</p>
      </div>

      {stuckWithoutPanel ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p className="font-medium">This step isn&apos;t available yet.</p>
          <p className="mt-1 text-amber-800">
            Some required information from an earlier step is missing — often because the page was
            refreshed or the link had an advanced step number. Continue from where you left off.
          </p>
          <button
            type="button"
            onClick={() => goToStep(recoveryStep, { replace: true })}
            className="mt-3 text-sm font-semibold text-brand hover:underline"
          >
            Go to step {recoveryStep}
          </button>
        </div>
      ) : null}

      {showStep1 ? (
        <BookRepairStep1
          devices={devices}
          catalogUnreachable={catalogUnreachable}
          onNext={(payload) => {
            setStep1(payload);
            setIssue(null);
            setContact(null);
            setWarranty(null);
            setQuote(null);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setSubmitResult(null);
            goToStep(2, {
              data: { ...EMPTY_WIZARD, step1: payload },
            });
          }}
        />
      ) : null}

      {showIssue ? (
        <BookRepairStepIssue
          categories={issueCategories}
          optionsUnreachable={issueOptionsUnreachable}
          initial={issue}
          onBack={goBack}
          onNext={(payload) => {
            setIssue(payload);
            setContact(null);
            setWarranty(null);
            setQuote(null);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setSubmitResult(null);
            goToStep(3, {
              data: { ...wizardDataRef.current, step1, issue: payload, contact: null, warranty: null, quote: null },
            });
          }}
        />
      ) : null}

      {showContact ? (
        <BookRepairStepContact
          key={contact ? `contact-${contact.email}` : "contact-new"}
          initial={contact}
          onBack={goBack}
          onNext={(c) => {
            setContact(c);
            setWarranty(null);
            setQuote(null);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setSubmitResult(null);
            goToStep(4, {
              data: {
                ...wizardDataRef.current,
                step1,
                issue,
                contact: c,
                warranty: null,
                quote: null,
              },
            });
          }}
        />
      ) : null}

      {showWarranty && step1 && issue ? (
        <BookRepairStep2
          step1={step1}
          issue={issue}
          initialWarranty={warranty}
          onBack={goBack}
          onNext={(w) => {
            const q = deferredQuotePlaceholder(w);
            setWarranty(w);
            setQuote(q);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setSubmitResult(null);
            goToStep(5, {
              data: {
                ...wizardDataRef.current,
                step1,
                issue,
                contact,
                warranty: w,
                quote: q,
              },
            });
          }}
        />
      ) : null}

      {showDocuments ? (
        <BookRepairStepDocuments
          onBack={goBack}
          onNext={(files, kind) => {
            setDocuments(files);
            setAttachmentKind(kind);
            setSubmitResult(null);
            goToStep(6);
          }}
        />
      ) : null}

      {showReview && step1 && issue && contact && warranty && quote ? (
        <BookRepairStepReview
          step1={step1}
          issue={issue}
          warranty={warranty}
          quote={quote}
          contact={contact}
          documents={documents}
          attachmentKind={attachmentKind}
          onBack={goBack}
          onSuccess={(result) => {
            setSubmitResult(result);
            goToStep(7, {
              data: { ...wizardDataRef.current, submitResult: result },
            });
          }}
        />
      ) : null}

      {showSuccess && submitResult && contact ? (
        <BookRepairStepSuccess
          jobReference={submitResult.job_reference}
          email={contact.email}
          attachmentsUploaded={submitResult.attachments_uploaded}
          onBookAnother={resetAll}
        />
      ) : null}
    </div>
  );
}
