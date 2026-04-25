import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeJson(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text.trim()) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { detail: String(parsed) };
  } catch {
    return { detail: text.slice(0, 300) || "Non-JSON response" };
  }
}

export async function POST(request: Request) {
  let body: { job_reference?: string; email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}/api/tracking/lookup/`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_reference: body.job_reference?.trim(),
        email: body.email?.trim(),
      }),
      signal: controller.signal,
    });
    const text = await res.text();
    const data = safeJson(text);
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the API. Is Django running?" },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
