"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setPartnerTokens } from "@/lib/partnerAuth";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = (await res.json()) as { access?: string; refresh?: string; detail?: string };
      if (!res.ok || !data.access) {
        setError(typeof data.detail === "string" ? data.detail : "Login failed.");
        return;
      }
      setPartnerTokens(data.access, typeof data.refresh === "string" ? data.refresh : null);
      router.push("/partner/dashboard");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-serif text-2xl font-medium text-slate-900">Partner login</h1>
      <p className="mt-2 text-sm text-slate-600">
        B2B portal (bulk RMA, invoices). Your admin creates users and links them to an organization in
        Django admin.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        ) : null}
        <div>
          <label htmlFor="u" className="text-xs font-semibold uppercase text-slate-500">
            Username
          </label>
          <input
            id="u"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="p" className="text-xs font-semibold uppercase text-slate-500">
            Password
          </label>
          <input
            id="p"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link href="/corporate" className="mt-8 inline-block text-sm text-brand hover:underline">
        ← Corporate overview
      </Link>
    </div>
  );
}
