import type { BookRepairStep1Payload } from "@/lib/bookRepairMakes";
import type {
  BookRepairContactPayload,
  BookRepairIssuePayload,
  QuoteResponse,
  WarrantyCheckResponse,
} from "@/lib/booking";

export type BookingWizardData = {
  step1: BookRepairStep1Payload | null;
  issue: BookRepairIssuePayload | null;
  contact: BookRepairContactPayload | null;
  warranty: WarrantyCheckResponse | null;
  quote: QuoteResponse | null;
  submitResult: unknown | null;
};

export const BOOKING_WIZARD_TOTAL_STEPS = 7;

/** First step the user still needs to complete (or review/submit). */
export function firstIncompleteBookingStep(data: BookingWizardData): number {
  if (!data.step1) return 1;
  if (!data.issue) return 2;
  if (!data.contact) return 3;
  if (!data.warranty) return 4;
  if (!data.quote) return 5;
  if (!data.submitResult) return 6;
  return BOOKING_WIZARD_TOTAL_STEPS;
}

/** Whether prerequisites exist to show this step's UI. */
export function canViewBookingStep(step: number, data: BookingWizardData): boolean {
  if (step < 1 || step > BOOKING_WIZARD_TOTAL_STEPS) return false;
  if (step === 1) return true;
  if (step === 2) return !!data.step1;
  if (step === 3) return !!data.step1 && !!data.issue;
  if (step === 4) return !!data.step1 && !!data.issue && !!data.contact;
  if (step === 5 || step === 6) {
    return !!data.step1 && !!data.issue && !!data.contact && !!data.warranty && !!data.quote;
  }
  if (step === 7) return !!data.submitResult && !!data.contact;
  return false;
}

/** Clamp URL / history step to a step we can actually render. */
export function resolveBookingWizardStep(
  requested: number,
  data: BookingWizardData
): number {
  const clamped = Math.min(
    BOOKING_WIZARD_TOTAL_STEPS,
    Math.max(1, Number.isFinite(requested) ? requested : 1)
  );
  if (canViewBookingStep(clamped, data)) return clamped;
  return firstIncompleteBookingStep(data);
}
