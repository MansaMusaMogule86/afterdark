/**
 * API utilities — server-only helpers shared by API route handlers.
 *
 * IMPORTANT: This module is server-only. Do NOT import from client code.
 * - In-memory rate limiting (per IP, sliding window)
 * - Honeypot + dedup hashing for booking submissions
 * - Booking reference generation
 * - Referrer / attribution capture from request headers + body
 * - PII scrubbing for analytics payloads
 */

import type { NextRequest } from "next/server";

/* ----------------------------------------------------------------------------
 * Rate limiting — naive in-memory counter per IP.
 * Window is a sliding 60s bucket. Suitable for a single-instance mock backend.
 * ------------------------------------------------------------------------- */

interface RateBucket {
  count: number;
  windowStart: number;
}

const rateBuckets = new Map<string, RateBucket>();

/**
 * Returns true if the request is allowed; false if rate-limited.
 */
export function checkRateLimit(
  ip: string,
  max: number,
  windowMs = 60_000
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.windowStart > windowMs) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return { ok: true, remaining: max - 1, resetAt: now + windowMs };
  }
  if (bucket.count >= max) {
    return { ok: false, remaining: 0, resetAt: bucket.windowStart + windowMs };
  }
  bucket.count += 1;
  return {
    ok: true,
    remaining: max - bucket.count,
    resetAt: bucket.windowStart + windowMs,
  };
}

/* ----------------------------------------------------------------------------
 * Client IP extraction. Reads forwarded headers, falls back to a synthetic key.
 * ------------------------------------------------------------------------- */

export function getClientIP(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/* ----------------------------------------------------------------------------
 * Booking reference — `WW-YYMMDD-XXXX`.
 * XXXX is a 4-char uppercase alphanumeric suffix (crypto-sourced).
 * ------------------------------------------------------------------------- */

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars

export function generateBookingReference(serviceDate: string): string {
  const [yyyy, mm, dd] = serviceDate.split("-");
  const yy = (yyyy ?? "").slice(2);
  // 4 chars from crypto random bytes
  let suffix = "";
  const bytes = new Uint8Array(4);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < 4; i++) {
      suffix += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
    }
  } else {
    // Fallback (should not happen on Node 20+).
    for (let i = 0; i < 4; i++) {
      suffix += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
    }
  }
  return `WW-${yy}${mm}${dd}-${suffix}`;
}

/* ----------------------------------------------------------------------------
 * Dedup hash — for booking submissions within a short window.
 * Hashes the core identity fields so identical rapid submissions collapse.
 * ------------------------------------------------------------------------- */

export function bookingDedupHash(input: {
  fullName: string;
  whatsappNumber: string;
  venue: string;
  eventOrDate: string;
}): string {
  const raw = `${input.fullName}|${input.whatsappNumber}|${input.venue}|${input.eventOrDate}`;
  // Simple FNV-1a 32-bit hash → base36. Deterministic and fast.
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/* ----------------------------------------------------------------------------
 * Referrer / attribution capture.
 * Combines client-captured attribution with server-side headers.
 * ------------------------------------------------------------------------- */

export interface Attribution {
  firstReferrer?: string;
  lastReferrer?: string;
  campaign?: string;
  promoterCode?: string;
  conciergeCode?: string;
}

export function captureAttribution(
  req: NextRequest,
  body: Partial<Attribution> = {}
): Attribution {
  const refererHeader = req.headers.get("referer") ?? undefined;
  const xReferrer = req.headers.get("x-referrer") ?? undefined;

  return {
    firstReferrer: body.firstReferrer ?? refererHeader,
    lastReferrer: body.lastReferrer ?? xReferrer ?? refererHeader,
    campaign: body.campaign,
    promoterCode: body.promoterCode,
    conciergeCode: body.conciergeCode,
  };
}

/* ----------------------------------------------------------------------------
 * Honeypot check — if the honeypot field is non-empty, treat as spam.
 * ------------------------------------------------------------------------- */

export function isHoneypotTriggered(body: Record<string, unknown> | null | undefined): boolean {
  if (!body) return false;
  const v = body.company_website;
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  return true;
}

/* ----------------------------------------------------------------------------
 * Safe JSON body parser.
 * ------------------------------------------------------------------------- */

export async function parseJsonBody<T = Record<string, unknown>>(
  req: NextRequest
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const text = await req.text();
    if (!text) return { ok: false, error: "empty_body" };
    const parsed = JSON.parse(text) as T;
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}

/* ----------------------------------------------------------------------------
 * PII scrubbing for analytics payloads.
 * Strips any string value that looks like an email or phone number.
 * ------------------------------------------------------------------------- */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_DIGITS_RE = /\d/;

export function looksLikePII(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (EMAIL_RE.test(value)) return true;
  // Phone-like: at least 8 digits in the string (with optional separators).
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 8 && PHONE_DIGITS_RE.test(value)) return true;
  return false;
}

export type Primitive = string | number | boolean | undefined | null;

export function scrubPII(
  params: Record<string, Primitive>
): Record<string, Exclude<Primitive, null>> {
  const out: Record<string, Exclude<Primitive, null>> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    if (looksLikePII(v)) continue;
    out[k] = v;
  }
  return out;
}
