"use client";

import { useCallback, useRef, useState } from "react";
import type { BookingAttachmentKind } from "@/lib/booking";

const MAX_FILES = 8;
const MAX_MB = 5;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp,application/pdf";

type Props = {
  onBack: () => void;
  onNext: (files: File[], attachmentKind: BookingAttachmentKind) => void;
};

export function BookRepairStepDocuments({ onBack, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<BookingAttachmentKind>("proof_of_purchase");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = useCallback((next: File[]) => {
    setError(null);
    if (next.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files.`);
      return;
    }
    const maxBytes = MAX_MB * 1024 * 1024;
    for (const f of next) {
      if (f.size > maxBytes) {
        setError(`"${f.name}" is larger than ${MAX_MB} MB.`);
        return;
      }
    }
    setFiles(next);
  }, []);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (list.length === 0) return;
    validateAndSet([...files, ...list]);
    e.target.value = "";
  }

  function removeAt(i: number) {
    setFiles((prev) => prev.filter((_, j) => j !== i));
    setError(null);
  }

  function handleContinue() {
    setError(null);
    onNext(files, kind);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl font-medium text-slate-900 md:text-2xl">
        Step 5 — Documents (optional)
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Proof of purchase, photos of the damage, or other PDFs/images help us process your repair
        faster. You can skip this step — files are optional. Max {MAX_FILES} files, {MAX_MB} MB each
        (PDF, JPG, PNG, WEBP).
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          What are you uploading?
        </span>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as BookingAttachmentKind)}
          className="mt-1.5 w-full max-w-md rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
        >
          <option value="proof_of_purchase">Proof of purchase / invoice</option>
          <option value="damage_photo">Damage or condition photos</option>
          <option value="other">Other document</option>
        </select>
        <span className="mt-1 block text-xs text-slate-500">
          This label applies to all files in this batch.
        </span>
      </label>

      <div className="mt-6">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={onInputChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Add files
        </button>
      </div>

      {files.length > 0 ? (
        <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-[#f8fafc]">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}-${f.size}`}
              className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm"
            >
              <span className="min-w-0 truncate text-slate-800">{f.name}</span>
              <span className="shrink-0 tabular-nums text-xs text-slate-500">
                {(f.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 text-xs font-medium text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No files selected yet.</p>
      )}

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to quote
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          {files.length > 0 ? "Continue with documents" : "Skip and continue"}
        </button>
      </div>
    </div>
  );
}
