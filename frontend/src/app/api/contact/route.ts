import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

/** Ensure Node runtime (reliable fetch to external Django). */
export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  /** Honeypot — must be empty (bots often fill this). */
  website?: string;
};

const DB_ERROR_HINT =
  "The API could not use its database. On Vercel, SQLite does not work — add a PostgreSQL DATABASE_URL (e.g. Neon or Supabase), set it on the Django project, run migrations, then redeploy.";

function safeJson(text: string): Record<string, unknown> {
  const t = text.trim();
  if (t.startsWith("<!DOCTYPE") || t.startsWith("<html")) {
    const isDb =
      /OperationalError|ProgrammingError|could not connect|database is locked/i.test(t);
    return {
      detail: isDb ? DB_ERROR_HINT : "The API returned an error page instead of JSON. Set DJANGO_DEBUG=false in production and check API logs.",
    };
  }
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return { detail: String(parsed) };
  } catch {
    return {
      detail: text.slice(0, 300) || "Non-JSON response from API",
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
        website: typeof body.website === "string" ? body.website : "",
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
