import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeJson(text: string): Record<string, unknown> {
  const t = text.trim();
  if (t.startsWith("<!DOCTYPE") || t.startsWith("<html")) {
    return { detail: "The API returned HTML instead of JSON." };
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

type Body = {
  device_catalog_id?: number | null;
  imei?: string;
  in_warranty?: boolean;
  next_action?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
  }

  if (typeof body.in_warranty !== "boolean") {
    return NextResponse.json({ detail: "in_warranty must be a boolean." }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}/api/booking/quote/`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_catalog_id: body.device_catalog_id ?? null,
        imei: typeof body.imei === "string" ? body.imei.trim() : "",
        in_warranty: body.in_warranty,
        next_action: typeof body.next_action === "string" ? body.next_action : "",
      }),
      signal: controller.signal,
    });

    const text = await res.text();
    const data = safeJson(text);

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError") {
      return NextResponse.json({ detail: "The API did not respond in time." }, { status: 504 });
    }
    return NextResponse.json(
      {
        detail:
          "Could not reach the Django API. Start the backend or set API_URL in the Next.js env.",
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
