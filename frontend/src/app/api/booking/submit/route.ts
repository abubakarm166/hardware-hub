import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeJson(text: string): Record<string, unknown> {
  const t = text.trim();
  if (t.startsWith("<!DOCTYPE") || t.startsWith("<html")) {
    return {
      detail: "The API returned HTML instead of JSON. Check that Django is running.",
    };
  }
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { detail: String(parsed) };
  } catch {
    return { detail: text.slice(0, 300) || "Non-JSON response from API" };
  }
}

export async function POST(request: Request) {
  const base = getApiBase();
  const url = `${base}/api/booking/submit/`;

  const contentType = request.headers.get("content-type") || "";
  const isMultipart = contentType.toLowerCase().includes("multipart/form-data");

  const controller = new AbortController();
  const timeoutMs = isMultipart ? 120_000 : 30_000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res: Response;
    if (isMultipart) {
      const formData = await request.formData();
      res = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } else {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
      }
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    }
    const text = await res.text();
    const data = safeJson(text);
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError") {
      return NextResponse.json({ detail: "The API did not respond in time." }, { status: 504 });
    }
    return NextResponse.json(
      {
        detail:
          "Could not reach the Django API. Start the backend or set API_URL / NEXT_PUBLIC_API_URL.",
      },
      { status: 503 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
