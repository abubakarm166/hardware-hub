"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatZarFromCents } from "@/lib/booking";
import {
  fetchWithPartnerAuth,
  getPartnerAccessToken,
  setPartnerTokens,
} from "@/lib/partnerAuth";

type MeResponse = {
  user: { username: string; email: string };
  organizations: {
    id: number;
    name: string;
    slug: string;
    role: string;
    sla_target_days: number;
  }[];
  is_partner_admin: boolean;
};

type InvoiceRow = {
  id: number;
  invoice_reference: string;
  period_label: string;
  amount_cents: number;
  pdf_url: string;
  created_at: string;
};

type SlaBlock = {
  organization_id: number;
  name: string;
  sla_target_days: number;
  open_jobs: number;
  completed_last_30_days: number;
  sla_breaches_last_90_days: number;
};

type JobRow = {
  job_reference: string;
  status: string;
  status_display: string;
  partner_reference: string;
  customer_email: string;
  device: { brand: string; model_name: string } | null;
  organization_id: number | null;
  created_at: string;
  updated_at: string;
};

type BulkRow = {
  id: number;
  organization_id: number;
  row_count: number;
  valid_row_count: number;
  invalid_row_count: number;
  jobs_created_count: number;
  status: string;
  notes: string;
  created_at: string;
  processed_at: string | null;
};

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRow[] | null>(null);
  const [sla, setSla] = useState<SlaBlock | null>(null);
  const [jobs, setJobs] = useState<JobRow[] | null>(null);
  const [uploads, setUploads] = useState<BulkRow[] | null>(null);
  const [csv, setCsv] = useState(
    "imei,partner_reference,customer_email,notes\n350000000000000,LINE-001,customer@example.com,Screen fault\n",
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadCore = useCallback(async () => {
    setErr(null);
    if (!getPartnerAccessToken()) {
      router.replace("/partner/login");
      return;
    }
    try {
      const [rMe, rInv] = await Promise.all([
        fetchWithPartnerAuth("/api/partner/me"),
        fetchWithPartnerAuth("/api/partner/invoices"),
      ]);
      if (rMe.status === 401) {
        setPartnerTokens(null, null);
        router.replace("/partner/login");
        return;
      }
      const dMe = (await rMe.json()) as MeResponse & { detail?: string };
      if (!rMe.ok) {
        setErr(typeof dMe.detail === "string" ? dMe.detail : "Could not load profile.");
        return;
      }
      setMe(dMe);
      const firstOrg = dMe.organizations[0]?.id ?? null;
      setSelectedOrgId((prev) => (prev !== null ? prev : firstOrg));

      const dInv = (await rInv.json()) as InvoiceRow[] | { detail?: string };
      setInvoices(Array.isArray(dInv) ? dInv : []);
    } catch {
      setErr("Network error.");
    }
  }, [router]);

  const loadOrgData = useCallback(
    async (orgId: number) => {
      try {
        const orgQ = `?organization_id=${orgId}`;
        const [rSla, rJobs, rUp] = await Promise.all([
          fetchWithPartnerAuth(`/api/partner/sla${orgQ}`),
          fetchWithPartnerAuth(`/api/partner/jobs${orgQ}`),
          fetchWithPartnerAuth("/api/partner/rma/uploads"),
        ]);
        if (rSla.ok) {
          const d = (await rSla.json()) as { organizations?: SlaBlock[] };
          setSla(d.organizations?.[0] ?? null);
        } else setSla(null);

        if (rJobs.ok) {
          const j = (await rJobs.json()) as JobRow[];
          setJobs(Array.isArray(j) ? j : []);
        } else setJobs([]);

        if (rUp.ok) {
          const u = (await rUp.json()) as BulkRow[];
          setUploads(Array.isArray(u) ? u : []);
        } else setUploads([]);
      } catch {
        setErr("Network error.");
      }
    },
    [],
  );

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (selectedOrgId == null) {
      setSla(null);
      setJobs(null);
      return;
    }
    void loadOrgData(selectedOrgId);
  }, [selectedOrgId, loadOrgData]);

  async function submitBulk() {
    if (selectedOrgId == null) return;
    setMsg(null);
    setErr(null);
    try {
      const res = await fetchWithPartnerAuth("/api/partner/rma/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv, organization_id: selectedOrgId }),
      });
      const data = (await res.json()) as {
        detail?: string;
        valid_row_count?: number;
        invalid_row_count?: number;
        jobs_created_count?: number;
      };
      if (!res.ok) {
        setErr(typeof data.detail === "string" ? data.detail : "Upload failed.");
        return;
      }
      const v = data.valid_row_count ?? 0;
      const inv = data.invalid_row_count ?? 0;
      const jc = data.jobs_created_count ?? 0;
      setMsg(`Processed: ${v} valid rows, ${inv} invalid, ${jc} jobs created.`);
      await loadOrgData(selectedOrgId);
    } catch {
      setErr("Network error.");
    }
  }

  async function submitInvite() {
    if (selectedOrgId == null || !inviteEmail.trim()) return;
    setMsg(null);
    setErr(null);
    try {
      const res = await fetchWithPartnerAuth("/api/partner/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          organization_id: selectedOrgId,
          role: "member",
        }),
      });
      const data = (await res.json()) as { detail?: string; accept_path?: string };
      if (!res.ok) {
        setErr(typeof data.detail === "string" ? data.detail : "Invite failed.");
        return;
      }
      setInviteEmail("");
      const path = typeof data.accept_path === "string" ? data.accept_path : "";
      setMsg(
        path
          ? `Invite created. Send the teammate this link: ${path}`
          : "Invite created. Copy the link from the API response in dev tools, or check email workflows later.",
      );
    } catch {
      setErr("Network error.");
    }
  }

  function logout() {
    setPartnerTokens(null, null);
    router.replace("/partner/login");
  }

  if (!me) {
    return (
      <div className="px-6 py-16 text-center text-sm text-slate-600">{err ?? "Loading…"}</div>
    );
  }

  const org = me.organizations.find((o) => o.id === selectedOrgId) ?? me.organizations[0];
  const isAdminOnSelected =
    org && me.organizations.some((o) => o.id === org.id && o.role === "admin");

  return (
    <div className="mx-auto max-w-content px-6 py-12 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-medium text-slate-900">Partner dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            {me.user.username}
            {me.user.email ? ` · ${me.user.email}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Log out
        </button>
      </div>

      {me.organizations.length > 1 ? (
        <div className="mt-6">
          <label className="text-xs font-semibold uppercase text-slate-500">Organization</label>
          <select
            value={selectedOrgId ?? ""}
            onChange={(e) => setSelectedOrgId(Number(e.target.value))}
            className="mt-1 block w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
          >
            {me.organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.role})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {org ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Organization</h2>
          <p className="mt-2 text-lg font-medium text-slate-900">{org.name}</p>
          {sla ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">SLA target</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{sla.sla_target_days} days</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">Open jobs</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{sla.open_jobs}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">Completed (30d)</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{sla.completed_last_30_days}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">SLA breaches (90d)</p>
                <p className="mt-1 text-lg font-semibold text-amber-900">{sla.sla_breaches_last_90_days}</p>
                <p className="mt-0.5 text-xs text-slate-500">Heuristic: turnaround &gt; target days</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600">Loading SLA summary…</p>
          )}
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          No organization linked. Ask an admin to add you under <strong>Organization members</strong> in
          Django admin, or accept an invite from your admin.
        </p>
      )}

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Repair jobs</h2>
        <p className="mt-2 text-sm text-slate-600">
          Jobs linked to your organization (including lines created from bulk CSV).
        </p>
        {jobs && jobs.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No jobs yet for this organization.</p>
        ) : null}
        {jobs && jobs.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4 font-medium">Reference</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Partner ref</th>
                  <th className="py-2 pr-4 font-medium">Device</th>
                  <th className="py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.job_reference} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-mono text-xs">{j.job_reference}</td>
                    <td className="py-2 pr-4">{j.status_display}</td>
                    <td className="py-2 pr-4 text-slate-600">{j.partner_reference || "—"}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {j.device ? `${j.device.brand} ${j.device.model_name}` : "—"}
                    </td>
                    <td className="py-2 text-xs text-slate-500">
                      {new Date(j.updated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {isAdminOnSelected ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Bulk RMA (CSV)</h2>
          <p className="mt-2 text-sm text-slate-600">
            Requires an <strong>imei</strong> column (15 digits). Optional:{" "}
            <strong>partner_reference</strong>, <strong>customer_email</strong>, <strong>notes</strong>.
            Admins only.
          </p>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={6}
            className="mt-4 w-full rounded-xl border border-slate-200 bg-[#f8fafc] p-4 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => void submitBulk()}
            disabled={!org}
            className="mt-4 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Submit bulk upload
          </button>
        </div>
      ) : (
        <p className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Bulk RMA upload is limited to <strong>organization admins</strong>. Your role on this org is{" "}
          <strong>{org?.role ?? "—"}</strong>.
        </p>
      )}

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Bulk upload history</h2>
        {uploads && uploads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No uploads yet.</p>
        ) : null}
        {uploads && uploads.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {uploads.slice(0, 15).map((u) => (
              <li key={u.id} className="flex flex-wrap gap-2 py-3 text-sm">
                <span className="font-medium text-slate-900">#{u.id}</span>
                <span className="text-slate-600">{u.status}</span>
                <span className="text-slate-500">
                  rows {u.row_count} · ok {u.valid_row_count} · bad {u.invalid_row_count} · jobs{" "}
                  {u.jobs_created_count}
                </span>
                <span className="text-xs text-slate-400">
                  {u.processed_at
                    ? new Date(u.processed_at).toLocaleString()
                    : new Date(u.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {isAdminOnSelected ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Invite teammate</h2>
          <p className="mt-2 text-sm text-slate-600">
            Creates a one-time link to <code className="rounded bg-slate-100 px-1">/partner/accept</code>. Admins
            only.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="min-w-[240px] flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={() => void submitInvite()}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Create invite
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Invoices</h2>
        {invoices && invoices.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">
            No invoices yet. Admin can add <strong>Partner invoice records</strong> in Django.
          </p>
        ) : null}
        {invoices && invoices.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-medium text-slate-900">{inv.invoice_reference}</span>
                <span className="text-slate-600">{formatZarFromCents(inv.amount_cents)}</span>
                {inv.pdf_url ? (
                  <a
                    href={inv.pdf_url}
                    className="text-brand hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">No file URL</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {msg ? <p className="mt-6 text-sm text-emerald-800">{msg}</p> : null}
      {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}

      <p className="mt-10 text-sm text-slate-500">
        <Link href="/corporate#glossary" className="text-brand hover:underline">
          Corporate overview &amp; glossary
        </Link>{" "}
        (bulk RMA, SLA, invoices).
      </p>
    </div>
  );
}
