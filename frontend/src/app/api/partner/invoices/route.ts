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
  const url = `${base}/api/partner/invoices/`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: auth },
      next: { revalidate: 0 },
    });
    const text = await res.text();
    const data = safeJson(text);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Could not reach the API." }, { status: 503 });
  }
}
