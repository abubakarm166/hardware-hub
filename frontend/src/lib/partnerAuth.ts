const ACCESS = "hh_partner_access";
const REFRESH = "hh_partner_refresh";

export function getPartnerAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS);
}

export function getPartnerRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH);
}

export function setPartnerTokens(access: string | null, refresh: string | null): void {
  if (typeof window === "undefined") return;
  if (access) window.localStorage.setItem(ACCESS, access);
  else window.localStorage.removeItem(ACCESS);
  if (refresh) window.localStorage.setItem(REFRESH, refresh);
  else window.localStorage.removeItem(REFRESH);
}

/** @deprecated Prefer setPartnerTokens so refresh can be stored. */
export function setPartnerAccessToken(token: string | null): void {
  setPartnerTokens(token, getPartnerRefreshToken());
}

async function refreshPartnerAccessToken(): Promise<boolean> {
  const refresh = getPartnerRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch("/api/auth/token/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const data = (await res.json()) as { access?: string };
    if (!res.ok || !data.access) {
      setPartnerTokens(null, null);
      return false;
    }
    setPartnerTokens(data.access, refresh);
    return true;
  } catch {
    setPartnerTokens(null, null);
    return false;
  }
}

/**
 * Browser-only: attaches Bearer access token and retries once after JWT refresh on 401.
 */
export async function fetchWithPartnerAuth(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getPartnerAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(input, { ...init, headers });
  if (res.status === 401 && typeof window !== "undefined") {
    const refreshed = await refreshPartnerAccessToken();
    if (refreshed) {
      const h2 = new Headers(init.headers);
      const t2 = getPartnerAccessToken();
      if (t2) h2.set("Authorization", `Bearer ${t2}`);
      res = await fetch(input, { ...init, headers: h2 });
    }
  }
  return res;
}
