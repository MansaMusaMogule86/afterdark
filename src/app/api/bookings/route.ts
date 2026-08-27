/**
 * POST /api/bookings
 * ------------------
 * VIP booking lead submission.
 *
 * Behaviour:
 *  - Honeypot: if `company_website` is present/non-empty, silently return
 *    success but do NOT store the lead (spam trap).
 *  - Server-side validation with zod. Validation errors → 400 with field map.
 *  - Rate limit: max 10 submissions / minute per IP (in-memory).
 *  - Dedup: identical (name+whatsapp+venue+date) within 60s collapses to the
 *    previously-issued reference (no duplicate stored).
 *  - Reference format: WW-YYMMDD-XXXX.
 *  - Attribution: first/last referrer captured from body + headers; promoter,
 *    concierge, campaign captured from body.
 *  - Stored in an in-memory Map keyed by reference.
 *  - Does NOT promise a response time. Does NOT process payments.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { VipBookingLead } from "@/lib/types";
import { getServiceDate } from "@/lib/tonight";
import {
  bookingDedupHash,
  captureAttribution,
  checkRateLimit,
  generateBookingReference,
  getClientIP,
  isHoneypotTriggered,
  parseJsonBody,
} from "@/lib/api-utils";
import { bookingStore, bookingDedupStore } from "@/lib/api-store";

export const dynamic = "force-dynamic";

const DEDUP_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

const VenueEnum = z.enum(["avenue", "ora", "blacktape", "any"]);
const TableTypeEnum = z.enum([
  "guest_list",
  "standard_table",
  "premium_table",
  "stage_dj_table",
  "private_corporate",
]);

const BookingInputSchema = z.object({
  venue: VenueEnum,
  eventOrDate: z.string().trim().min(1, "Required").max(200),
  partySize: z.number().int().min(1).max(80),
  arrivalTime: z.string().trim().min(1, "Required").max(50),
  tablePreference: TableTypeEnum,
  budgetRange: z.string().trim().min(1, "Required").max(100),
  occasion: z.string().trim().min(1, "Required").max(100),
  specialRequirements: z.string().trim().max(2000).optional(),
  hotelGuest: z.boolean(),
  transportRequest: z.string().trim().max(500).optional(),
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  whatsappNumber: z
    .string()
    .trim()
    .min(5, "Please enter a valid WhatsApp number")
    .max(30),
  email: z.string().trim().email("Please enter a valid email").max(200),
  promoterCode: z.string().trim().max(50).optional(),
  conciergeCode: z.string().trim().max(50).optional(),
  marketingConsent: z.boolean(),
  // Honeypot (server ignores real submissions).
  company_website: z.string().max(2000).optional(),
  // Attribution captured client-side (optional).
  campaign: z.string().trim().max(200).optional(),
  firstReferrer: z.string().trim().max(2000).optional(),
  lastReferrer: z.string().trim().max(2000).optional(),
});

type BookingInput = z.infer<typeof BookingInputSchema>;

interface BookingSuccessResponse {
  ok: true;
  reference: string;
  summary: string;
}

interface BookingErrorResponse {
  ok: false;
  error: string;
  fields?: Record<string, string>;
}

const VENUE_LABEL: Record<string, string> = {
  avenue: "Avenue",
  ora: "Ora",
  blacktape: "Black Tape",
  any: "Any venue",
};

function buildSummary(input: BookingInput, reference: string): string {
  const venueLabel = VENUE_LABEL[input.venue] ?? input.venue;
  return [
    `VIP request logged for ${venueLabel}, ${input.eventOrDate},`,
    `party of ${input.partySize} (${input.tablePreference.replace(/_/g, " ")}).`,
    `Reference ${reference}.`,
    `A concierge will contact you on WhatsApp — no payment is taken online.`,
  ].join(" ");
}

function buildLead(
  input: BookingInput,
  reference: string,
  attribution: ReturnType<typeof captureAttribution>
): VipBookingLead {
  return {
    reference,
    venue: input.venue,
    eventOrDate: input.eventOrDate,
    partySize: input.partySize,
    arrivalTime: input.arrivalTime,
    tablePreference: input.tablePreference,
    budgetRange: input.budgetRange,
    occasion: input.occasion,
    specialRequirements: input.specialRequirements,
    hotelGuest: input.hotelGuest,
    transportRequest: input.transportRequest,
    fullName: input.fullName,
    whatsappNumber: input.whatsappNumber,
    email: input.email,
    promoterCode: attribution.promoterCode ?? input.promoterCode,
    conciergeCode: attribution.conciergeCode ?? input.conciergeCode,
    marketingConsent: input.marketingConsent,
    firstReferrer: attribution.firstReferrer,
    lastReferrer: attribution.lastReferrer,
    campaign: attribution.campaign,
    createdAt: new Date().toISOString(),
    status: "new",
  };
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<BookingSuccessResponse | BookingErrorResponse>> {
  const ip = getClientIP(req);

  // Rate limit.
  const rl = checkRateLimit(ip, RATE_LIMIT_MAX, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", fields: {} },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Parse JSON.
  const parsed = await parseJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: "invalid_json", fields: {} },
      { status: 400 }
    );
  }
  const body = parsed.data;

  // Honeypot: silently succeed without storing.
  if (isHoneypotTriggered(body)) {
    const fakeRef = generateBookingReference(getServiceDate());
    return NextResponse.json({
      ok: true,
      reference: fakeRef,
      summary: "Thanks — your request has been received.",
    });
  }

  // Validate.
  const result = BookingInputSchema.safeParse(body);
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
  const input = result.data;

  // Dedup within 60s — return the previously-issued reference.
  const hash = bookingDedupHash({
    fullName: input.fullName,
    whatsappNumber: input.whatsappNumber,
    venue: input.venue,
    eventOrDate: input.eventOrDate,
  });
  const now = Date.now();
  const prevTs = bookingDedupStore.get(hash);
  if (prevTs && now - prevTs < DEDUP_WINDOW_MS) {
    for (const lead of bookingStore.values()) {
      const storedHash = bookingDedupHash({
        fullName: lead.fullName,
        whatsappNumber: lead.whatsappNumber,
        venue: lead.venue,
        eventOrDate: lead.eventOrDate,
      });
      if (storedHash === hash) {
        return NextResponse.json({
          ok: true,
          reference: lead.reference,
          summary: buildSummary(input, lead.reference),
        });
      }
    }
    // Fallback: no matching stored lead (edge case) — issue a new reference.
  }

  // Capture full attribution (request headers + body).
  const attribution = captureAttribution(req, {
    firstReferrer: input.firstReferrer,
    lastReferrer: input.lastReferrer,
    campaign: input.campaign,
    promoterCode: input.promoterCode,
    conciergeCode: input.conciergeCode,
  });

  const serviceDate = getServiceDate();
  const reference = generateBookingReference(serviceDate);
  const lead = buildLead(input, reference, attribution);

  bookingStore.set(reference, lead);
  bookingDedupStore.set(hash, now);

  return NextResponse.json({
    ok: true,
    reference,
    summary: buildSummary(input, reference),
  });
}
