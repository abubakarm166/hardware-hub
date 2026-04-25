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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const base = getApiBase();
  const url = `${base}/api/partner/rma/uploads/${encodeURIComponent(id)}/`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch(url, {
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
