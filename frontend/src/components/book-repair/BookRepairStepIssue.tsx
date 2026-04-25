"use client";

import { useEffect, useMemo, useState } from "react";
import type { IssueCategoryOption } from "@/lib/api";
import type { BookRepairIssuePayload } from "@/lib/booking";

type Props = {
  categories: IssueCategoryOption[];
  optionsUnreachable?: boolean;
  onBack: () => void;
  onNext: (payload: BookRepairIssuePayload) => void;
};

export function BookRepairStepIssue({
  categories,
  optionsUnreachable = false,
  onBack,
  onNext,
}: Props) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [faultCodeId, setFaultCodeId] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  const selectedCat = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const faults = selectedCat?.fault_codes ?? [];

  useEffect(() => {
    if (categories.length === 0 || categoryId !== null) return;
    const first = categories[0];
    setCategoryId(first.id);
    const fc = first.fault_codes[0];
    setFaultCodeId(fc?.id ?? null);
  }, [categories, categoryId]);

  useEffect(() => {
    if (!selectedCat || faults.length === 0) return;
    if (faultCodeId != null && faults.some((f) => f.id === faultCodeId)) return;
    setFaultCodeId(faults[0].id);
  }, [selectedCat, faults, faultCodeId]);

  function handleCategoryChange(id: number) {
    setCategoryId(id);
    const cat = categories.find((c) => c.id === id);
    const fc = cat?.fault_codes[0];
    setFaultCodeId(fc?.id ?? null);
  }

  function handleContinue() {
    if (!selectedCat || faultCodeId == null) return;
    const fault = faults.find((f) => f.id === faultCodeId);
    if (!fault) return;
    onNext({
      categoryId: selectedCat.id,
      categoryCode: selectedCat.code,
      categoryLabel: selectedCat.label,
      faultCodeId: fault.id,
      faultCode: fault.code,
      faultLabel: fault.label,
      description: description.trim(),
    });
  }

  const canContinue = selectedCat != null && faultCodeId != null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 2 — What&apos;s wrong?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Choose the category and fault that best match the problem. Add your own words below — that
        helps our technicians prepare.
      </p>

      {optionsUnreachable || categories.length === 0 ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {optionsUnreachable ? (
            <>
              <strong>Can&apos;t load fault options.</strong> Start Django and run{" "}
              <code className="rounded bg-amber-100 px-1">python manage.py seed_dummy_data</code>{" "}
              (or add categories in admin), then refresh.
            </>
          ) : (
            <>
              No categories configured yet. Seed the database or add{" "}
              <strong>Repair issue categories</strong> in Django admin.
            </>
          )}
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category
            </span>
            <select
              value={categoryId ?? ""}
              onChange={(e) => handleCategoryChange(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fault code
            </span>
            <select
              value={faultCodeId ?? ""}
              onChange={(e) => setFaultCodeId(Number(e.target.value))}
              disabled={faults.length === 0}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:opacity-50"
            >
              {faults.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} ({f.code})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Describe the issue (optional but recommended)
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="e.g. Dropped yesterday; green line across the screen; only happens after the phone gets warm…"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
            <span className="mt-1 block text-xs text-slate-500">{description.length}/4000</span>
          </label>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to step 1
        </button>
        {categories.length > 0 ? (
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to warranty check
          </button>
        ) : null}
      </div>
    </div>
  );
}
