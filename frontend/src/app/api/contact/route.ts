import { getApiBase } from "@/lib/api";
import { NextResponse } from "next/server";

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON." }, { status: 400 });
  }

  const base = getApiBase();
  try {
    const res = await fetch(`${base}/api/contact/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name?.trim(),
        email: body.email?.trim(),
        phone: body.phone?.trim() ?? "",
        message: body.message?.trim(),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { detail: "Could not reach the server. Is the API running?" },
      { status: 503 }
    );
  }
}
