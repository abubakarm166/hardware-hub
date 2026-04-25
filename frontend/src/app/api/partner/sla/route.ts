import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { detail: text.slice(0, 200) };
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  const base = getApiBase();
  const upstream = new URL(`${base}/api/partner/sla/`);
  const q = new URL(request.url).searchParams.get("organization_id");
  if (q) upstream.searchParams.set("organization_id", q);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Authorization: auth },
      signal: controller.signal,
    });
    const text = await res.text();
    return NextResponse.json(safeJson(text), { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Could not reach the API." }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
