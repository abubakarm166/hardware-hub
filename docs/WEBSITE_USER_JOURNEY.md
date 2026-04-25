# How this website works — a visitor’s story

This document walks through the Hardware Hub site the way a real person would experience it: from the first visit to booking a repair, tracking it, and touching the other main areas. It is meant for stakeholders, new team members, or anyone who wants the “whole picture” without reading code.

---

## The first visit

Someone lands on the **home page**. They see who Hardware Hub is: a service platform for device repairs, aimed at both everyday customers and larger partners. The page explains the main ideas—warranty work, out-of-warranty repairs, corporate programmes, and logistics—and offers two obvious actions: **Book a repair** and **Track a repair**.

They might scroll to learn more about services in broad strokes, or jump straight to booking if their phone is already broken.

---

## Exploring before committing

If they are not ready to book, they might open **Services** (`/services`). There they get a fuller picture of what the company offers and see the **device catalog** (the models the platform knows about for quotes and booking). This helps set expectations: which brands and models are in scope for the self-serve flow.

**Corporate** (`/corporate`) speaks to businesses and partners: bulk RMA, SLAs, invoicing, and how the B2B side fits next to the consumer journey.

**Contact** (`/contact`) is for general questions—no repair booking required—using a simple enquiry form.

---

## The main story: booking a repair

Imagine **Alex**. Alex cracked a phone screen and clicks **Book a repair** (`/book-repair`). The site guides Alex through a **step-by-step wizard** so nothing important is forgotten.

### Step 1 — The device

Alex either **picks a model from the catalog** (search by brand or name) or **enters a 15-digit IMEI** if they are not sure of the exact listing. This choice drives warranty checks and pricing in the next steps.

### Step 2 — What’s wrong

Alex chooses a **category** (for example display, power, audio) and then a **fault code** that best matches the problem. The lists come from the backend so they stay consistent for reporting and for future integrations.

Alex can also **type a free-text description**—when it broke, what it looks like, anything the dropdowns do not capture. That text travels with the booking so the workshop sees both the structured code and the human detail.

### Step 3 — Warranty check

The site runs a **warranty check** using the device and/or IMEI. If a live warranty system is connected in the environment, the result can come from there; otherwise a clear **in-app result** still lets the flow continue so Alex is never stuck.

### Step 4 — Quote

Based on warranty outcome, Alex sees either **warranty-channel messaging** (pricing finalised after inspection) or an **indicative out-of-warranty quote** built from catalog tariffs—or a generic band if only an IMEI was given without a catalog device.

### Step 5 — Documents (optional)

Alex can attach **PDFs or images**—for example proof of purchase, photos of the damage, or other supporting documents. They choose what type of upload it is (invoice, damage photo, or other), add up to eight files (within size limits), or **skip** this step entirely.

### Step 6 — Details and address

Alex enters **name, email, phone (optional), and a full shipping/return address**. This is the information used for confirmation, tracking, and logistics downstream.

### Step 7 — Review and confirm

Alex sees a **summary** of device, issue, warranty, pricing context, **documents** (if any), and contact details. They tick a box to **confirm** the information and agree to proceed, then **submit**. Files are sent securely with the booking and stored against the repair job for staff (e.g. in Django admin).

### The moment it becomes “real”

On submit, the backend **creates a repair job**: a **job reference** is issued, the intake is stored (including a structured **booking payload** for future systems such as Vision or ERP), and Alex’s **email** is tied to the job for privacy-safe tracking.

The job’s first status is **not** “we have your phone in the building.” It is **booking confirmed — awaiting your device**: the online form is complete, but the workshop has not necessarily checked the device in yet.

### Step 8 — Done

Alex sees a **confirmation screen** with the **job reference**, a note if **documents were uploaded**, and a prompt to use **Track a repair** with that reference and the same email.

---

## After booking: tracking

Later, Alex opens **Track a repair** (`/track`). The site asks for the **job reference** and **email**—they must match what was stored at booking. If they match, Alex sees **status** and a **timeline** of stages.

**Important distinction**

- **Booking confirmed — awaiting your device** means the **intake is saved** (Alex finished the website flow). It does **not** mean the courier or Alex has already handed the device to the workshop.
- **Received** on the timeline is the next stage: staff (or a future logistics integration) moves the job forward when the **physical device** is checked in at the workshop.

So Alex should not worry if tracking still says “awaiting your device” right after booking—that is expected until the unit arrives. If they do not match reference + email, the site responds generically so strangers cannot probe for other people’s jobs.

---

## A different kind of visitor: partners

**Sam** works for a corporate partner. Sam does not use the public booking wizard for hundreds of devices. Instead Sam goes to **Partner login** (`/partner/login`), signs in, and lands on the **partner dashboard**.

There Sam can see **organisation** context, **SLA-style summaries**, **repair jobs** linked to that organisation, **bulk RMA uploads** (if Sam is an admin), **invite teammates**, and **invoices** when they exist. A separate flow lets new users **accept an invitation** (`/partner/accept`) with a one-time link.

This path runs **parallel** to Alex’s consumer story: same platform, different role and permissions.

---

## How the pieces fit together

| Area            | Who it is for        | What it does |
|-----------------|----------------------|--------------|
| Home, Services  | Everyone             | Discovery, catalog visibility, trust. |
| Book a repair   | Consumers            | Full intake: device, issue codes + text, warranty, quote, **optional file uploads**, contact, review; job + attachments in admin. |
| Track           | Consumers            | Status lookup with reference + email. |
| Contact         | Everyone             | General enquiries. |
| Corporate       | B2B prospects        | Explains programmes and glossary. |
| Partner portal  | Authenticated orgs   | Jobs, bulk RMA, invites, invoices, SLA stubs. |

---

## Closing the loop

From the site’s point of view, a **happy path** looks like this:

1. Visitor arrives and understands the offer.  
2. They **book** with clear steps and structured data plus their own words.  
3. They receive a **reference** and know their **email** is the other half of the key.  
4. They **track** progress until the device is ready.  
5. Partners, in parallel, manage **volume and contracts** through the portal.

That is the story of how this website works for the people who use it.
