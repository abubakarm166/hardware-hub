import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

/** Ensure Node runtime (reliable fetch to external Django). */
export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function safeJson(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { detail: String(parsed) };
  } catch {
    return {
      detail: text.slice(0, 500) || "Non-JSON response from API",
    };
  }
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
  }

  const base = getApiBase();
  const url = `${base}/api/contact/`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name?.trim(),
        email: body.email?.trim(),
        phone: body.phone?.trim() ?? "",
        message: body.message?.trim(),
      }),
      signal: controller.signal,
    });

    const text = await res.text();
    const data = safeJson(text);

    if (!res.ok) {
      // Surface Django/DRF errors; avoid opaque 500 for the browser if possible
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError") {
      return NextResponse.json(
        { detail: "The API did not respond in time. Try again later." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        detail:
          "Could not reach the Django API. Confirm it is online, ALLOWED_HOSTS/CORS are set, and the database has migrations applied (ContactMessage table).",
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
