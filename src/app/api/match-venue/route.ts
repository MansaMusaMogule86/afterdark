/**
 * POST /api/match-venue
 * ---------------------
 * Runs the structured venue matcher ("Find My Venue").
 *
 * Accepts a MatcherInput JSON body, validates the shape loosely, runs
 * `runVenueMatcher`, and returns the ranked results.
 *
 * Returns: { results: MatcherResult[] }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runVenueMatcher } from "@/lib/matcher";
import type { MatcherResult } from "@/lib/matcher";
import {
  isHoneypotTriggered,
  parseJsonBody,
} from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const MatcherInputSchema = z.object({
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "preferredDate must be YYYY-MM-DD"),
  music: z.enum([
    "arabic", "khaleeji", "hiphop", "rnb", "afro",
    "dancehall", "house", "international", "urban", "any",
  ]),
  mood: z.enum(["energy", "immersive", "social", "late", "any"]),
  location: z.enum(["shangrila", "habtoor", "any"]),
  groupSize: z.number().int().min(1).max(50),
  occasion: z.enum([
    "night_out", "birthday", "bachelorette", "corporate", "date", "any",
  ]),
  budget: z.enum(["standard", "premium", "stage", "any"]),
  // Honeypot (accepted, ignored).
  company_website: z.string().max(2000).optional(),
});

interface MatchVenueResponse {
  ok: true;
  results: MatcherResult[];
}

interface MatchVenueErrorResponse {
  ok: false;
  error: string;
  fields?: Record<string, string>;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<MatchVenueResponse | MatchVenueErrorResponse>> {
  const parsed = await parseJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  // Honeypot — silently return empty results for bots.
  if (isHoneypotTriggered(parsed.data)) {
    return NextResponse.json({ ok: true, results: [] });
  }

  const result = MatcherInputSchema.safeParse(parsed.data);
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

  const results = runVenueMatcher(result.data);
  return NextResponse.json({ ok: true, results });
}
