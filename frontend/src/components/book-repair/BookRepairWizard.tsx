"use client";

import { useCallback, useState } from "react";
import type { DeviceCatalog, IssueCategoryOption } from "@/lib/api";
import type {
  BookingAttachmentKind,
  BookRepairContactPayload,
  BookRepairIssuePayload,
  QuoteResponse,
  WarrantyCheckResponse,
} from "@/lib/booking";
import { BookRepairStep1, type BookRepairStep1Payload } from "./BookRepairStep1";
import { BookRepairStep2 } from "./BookRepairStep2";
import { BookRepairStep3 } from "./BookRepairStep3";
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

export function BookRepairWizard({
  devices,
  issueCategories,
  catalogUnreachable = false,
  issueOptionsUnreachable = false,
}: Props) {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState<BookRepairStep1Payload | null>(null);
  const [issue, setIssue] = useState<BookRepairIssuePayload | null>(null);
  const [warranty, setWarranty] = useState<WarrantyCheckResponse | null>(null);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [attachmentKind, setAttachmentKind] = useState<BookingAttachmentKind>("proof_of_purchase");
  const [contact, setContact] = useState<BookRepairContactPayload | null>(null);
  const [submitResult, setSubmitResult] = useState<BookingSubmitResult | null>(null);

  const totalSteps = 8;

  const resetAll = useCallback(() => {
    setStep(1);
    setStep1(null);
    setIssue(null);
    setWarranty(null);
    setQuote(null);
    setDocuments([]);
    setAttachmentKind("proof_of_purchase");
    setContact(null);
    setSubmitResult(null);
  }, []);

  const stepLabel =
    submitResult != null ? (
      <span className="text-emerald-700">Complete</span>
    ) : (
      <>
        Step <span className="font-semibold text-slate-900">{step}</span> of {totalSteps}
      </>
    );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Book a repair
        </p>
        <p className="text-sm text-slate-600">{stepLabel}</p>
      </div>

      {step === 1 ? (
        <BookRepairStep1
          devices={devices}
          catalogUnreachable={catalogUnreachable}
          onNext={(payload) => {
            setStep1(payload);
            setIssue(null);
            setWarranty(null);
            setQuote(null);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setContact(null);
            setSubmitResult(null);
            setStep(2);
          }}
        />
      ) : null}

      {step === 2 && step1 ? (
        <BookRepairStepIssue
          categories={issueCategories}
          optionsUnreachable={issueOptionsUnreachable}
          onBack={() => setStep(1)}
          onNext={(payload) => {
            setIssue(payload);
            setWarranty(null);
            setQuote(null);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setContact(null);
            setSubmitResult(null);
            setStep(3);
          }}
        />
      ) : null}

      {step === 3 && step1 && issue ? (
        <BookRepairStep2
          step1={step1}
          issue={issue}
          onBack={() => setStep(2)}
          onNext={(w) => {
            setWarranty(w);
            setQuote(null);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setContact(null);
            setSubmitResult(null);
            setStep(4);
          }}
        />
      ) : null}

      {step === 4 && step1 && issue && warranty ? (
        <BookRepairStep3
          step1={step1}
          issue={issue}
          warranty={warranty}
          onBack={() => setStep(3)}
          onNext={(q) => {
            setQuote(q);
            setDocuments([]);
            setAttachmentKind("proof_of_purchase");
            setContact(null);
            setSubmitResult(null);
            setStep(5);
          }}
        />
      ) : null}

      {step === 5 && step1 && issue && warranty && quote ? (
        <BookRepairStepDocuments
          onBack={() => setStep(4)}
          onNext={(files, kind) => {
            setDocuments(files);
            setAttachmentKind(kind);
            setContact(null);
            setSubmitResult(null);
            setStep(6);
          }}
        />
      ) : null}

      {step === 6 && step1 && issue && warranty && quote ? (
        <BookRepairStepContact
          onBack={() => setStep(5)}
          onNext={(c) => {
            setContact(c);
            setSubmitResult(null);
            setStep(7);
          }}
        />
      ) : null}

      {step === 7 && step1 && issue && warranty && quote && contact ? (
        <BookRepairStepReview
          step1={step1}
          issue={issue}
          warranty={warranty}
          quote={quote}
          contact={contact}
          documents={documents}
          attachmentKind={attachmentKind}
          onBack={() => setStep(6)}
          onSuccess={(result) => {
            setSubmitResult(result);
            setStep(8);
          }}
        />
      ) : null}

      {step === 8 && submitResult && contact ? (
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
