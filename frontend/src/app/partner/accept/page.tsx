"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type Lookup = {
  valid?: boolean;
  organization_name?: string;
  email_masked?: string;
  expires_at?: string;
  detail?: string;
};

function PartnerAcceptInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setLookup({ valid: false, detail: "Missing token in URL." });
      return;
    }
    void (async () => {
      try {
        const res = await fetch(`/api/partner/invites/lookup?token=${encodeURIComponent(token)}`);
        const data = (await res.json()) as Lookup;
        setLookup(data);
      } catch {
        setLookup({ valid: false, detail: "Network error." });
      }
    })();
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/partner/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          username: username.trim(),
          password,
          password_confirm: password2,
        }),
      });
      const data = (await res.json()) as { detail?: string };
      if (!res.ok) {
        setError(typeof data.detail === "string" ? data.detail : "Could not create account.");
        return;
      }
      setDone(true);
      router.prefetch("/partner/login");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <p className="text-sm text-red-700">Invalid invite link (no token).</p>
        <Link href="/partner/login" className="mt-6 inline-block text-sm text-brand hover:underline">
          Partner login
        </Link>
      </div>
    );
  }

  if (!lookup) {
    return <div className="px-6 py-16 text-center text-sm text-slate-600">Checking invite…</div>;
  }

  if (lookup.detail && !lookup.organization_name) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <p className="text-sm text-red-700">{lookup.detail}</p>
        <Link href="/partner/login" className="mt-6 inline-block text-sm text-brand hover:underline">
          Partner login
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-serif text-2xl font-medium text-slate-900">Welcome</h1>
        <p className="mt-2 text-sm text-slate-600">Your account is ready.</p>
        <Link
          href="/partner/login"
          className="mt-8 inline-flex rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-serif text-2xl font-medium text-slate-900">Accept invitation</h1>
      <p className="mt-2 text-sm text-slate-600">
        Join <strong>{lookup.organization_name}</strong>
        {lookup.email_masked ? (
          <>
            {" "}
            as <strong>{lookup.email_masked}</strong>
          </>
        ) : null}
        .
      </p>
      {!lookup.valid ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          This invite is no longer valid (expired or already used).
        </p>
      ) : null}

      {lookup.valid ? (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
          ) : null}
          <div>
            <label htmlFor="user" className="text-xs font-semibold uppercase text-slate-500">
              Username
            </label>
            <input
              id="user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="pw" className="text-xs font-semibold uppercase text-slate-500">
              Password
            </label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="pw2" className="text-xs font-semibold uppercase text-slate-500">
              Confirm password
            </label>
            <input
              id="pw2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      ) : null}

      <Link href="/partner/login" className="mt-8 inline-block text-sm text-brand hover:underline">
        ← Partner login
      </Link>
    </div>
  );
}

export default function PartnerAcceptInvitePage() {
  return (
    <Suspense
      fallback={<div className="px-6 py-16 text-center text-sm text-slate-600">Loading…</div>}
    >
      <PartnerAcceptInner />
    </Suspense>
  );
}
