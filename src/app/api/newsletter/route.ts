/**
 * POST /api/newsletter
 * --------------------
 * Newsletter subscription.
 *
 * Accepts { email, preferences: string[], consent: boolean }.
 *  - email must be a valid email address.
 *  - consent must be true (GDPR-style opt-in).
 *  - Honeypot `company_website` — silently succeed without storing.
 *  - Stored in an in-memory Map keyed by lowercased email.
 *
 * Returns: { ok: true }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  captureAttribution,
  getClientIP,
  isHoneypotTriggered,
  parseJsonBody,
} from "@/lib/api-utils";
import { newsletterStore, type NewsletterRecord } from "@/lib/api-store";

export const dynamic = "force-dynamic";

const NewsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(200),
  preferences: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  consent: z.literal(true, {
    message: "Consent is required to subscribe.",
  }),
  // Honeypot.
  company_website: z.string().max(2000).optional(),
  // Attribution (optional, client-captured).
  campaign: z.string().trim().max(200).optional(),
  firstReferrer: z.string().trim().max(2000).optional(),
  lastReferrer: z.string().trim().max(2000).optional(),
});

interface NewsletterResponse {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<NewsletterResponse>> {
  const parsed = await parseJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  // Honeypot — silently succeed.
  if (isHoneypotTriggered(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  const result = NewsletterSchema.safeParse(parsed.data);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString() ?? "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "validation_failed", fields },
      { status: 400 }
    );
  }

  const { email, preferences, campaign, firstReferrer, lastReferrer } =
    result.data;
  const key = email.toLowerCase();

  const attribution = captureAttribution(req, {
    firstReferrer,
    lastReferrer,
    campaign,
  });

  const record: NewsletterRecord = {
    email: key,
    preferences,
    consent: true,
    createdAt: new Date().toISOString(),
    ip: getClientIP(req),
    attribution: {
      firstReferrer: attribution.firstReferrer,
      lastReferrer: attribution.lastReferrer,
      campaign: attribution.campaign,
    },
  };

  newsletterStore.set(key, record);

  return NextResponse.json({ ok: true });
}
