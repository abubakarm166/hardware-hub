"use client";

import { useState } from "react";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "message" | "_general", string>>;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!email.trim()) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!message.trim()) next.message = "Please enter a message.";
    else if (message.trim().length < 10) next.message = "Please enter at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        const flat: FieldErrors = {};
        let general = "Something went wrong. Please try again.";
        if (typeof data.detail === "string") {
          general = data.detail;
          if (general.trimStart().startsWith("<!DOCTYPE") || general.includes("<html")) {
            general =
              "Could not save your message (server/database error). If the site admin is fixing the API, try again later.";
          }
        }
        for (const [key, val] of Object.entries(data)) {
          if (key === "detail") continue;
          const msg = Array.isArray(val) ? val[0] : val;
          if (typeof msg === "string" && (key === "name" || key === "email" || key === "message" || key === "phone")) {
            flat[key] = msg;
          }
        }
        if (Object.keys(flat).length === 0) flat._general = general;
        setErrors(flat);
        return;
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setErrors({ _general: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-accent-soft/60 px-6 py-10 text-center">
        <p className="text-lg font-semibold text-foreground">Message sent</p>
        <p className="mt-2 text-sm text-muted">
          Thank you — we’ll get back to you as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-medium text-foreground underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {errors._general ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors._general}
        </p>
      ) : null}

      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-foreground">
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-accent/20 transition-shadow placeholder:text-muted focus:border-foreground/20 focus:ring-2"
          placeholder="Your name"
        />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-accent/20 transition-shadow placeholder:text-muted focus:border-foreground/20 focus:ring-2"
          placeholder="you@example.com"
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-sm font-medium text-foreground">
          Phone <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-accent/20 transition-shadow placeholder:text-muted focus:border-foreground/20 focus:ring-2"
          placeholder="+27 …"
        />
        {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-accent/20 transition-shadow placeholder:text-muted focus:border-foreground/20 focus:ring-2"
          placeholder="How can we help?"
        />
        {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
