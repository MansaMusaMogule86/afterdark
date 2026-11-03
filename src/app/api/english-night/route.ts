/**
 * GET /api/english-night?venue=<slug>&date=<YYYY-MM-DD>
 * -----------------------------------------------------
 * Returns the full English Night event occurrence for the given
 * venue + service date. Event ids follow the pattern
 * `en-{venue}-{date}`, so we look them up directly.
 *
 * Query (required):
 *   ?venue=avenue|ora|blacktape
 *   ?date=YYYY-MM-DD
 *
 * Returns the full EnglishNightEvent object, or 404 if not found.
 */

import { NextRequest, NextResponse } from "next/server";
import { ensureSeeded, getEnglishNight } from "@/lib/english-nights";
import type { EnglishNightEvent } from "@/lib/english-nights";
import type { VenueSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

const VENUE_SLUGS: readonly VenueSlug[] = ["avenue", "ora", "blacktape"];

function isVenueSlug(s: string): s is VenueSlug {
  return (VENUE_SLUGS as readonly string[]).includes(s);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface EnglishNightDetailResponse {
  event: EnglishNightEvent;
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<EnglishNightDetailResponse | { error: string }>> {
  const sp = req.nextUrl.searchParams;

  const venueRaw = sp.get("venue")?.trim() ?? "";
  const dateRaw = sp.get("date")?.trim() ?? "";

  if (!venueRaw) {
    return NextResponse.json(
      { error: "Missing required ?venue= query parameter." },
      { status: 400 }
    );
  }
  if (!isVenueSlug(venueRaw)) {
    return NextResponse.json(
      { error: `Invalid ?venue=. Expected one of: ${VENUE_SLUGS.join(", ")}.` },
      { status: 400 }
    );
  }
  if (!dateRaw) {
    return NextResponse.json(
      { error: "Missing required ?date= query parameter (YYYY-MM-DD)." },
      { status: 400 }
    );
  }
  if (!ISO_DATE_RE.test(dateRaw)) {
    return NextResponse.json(
      { error: "Invalid ?date=. Expected ISO format YYYY-MM-DD." },
      { status: 400 }
    );
  }

  ensureSeeded();

  const event = getEnglishNight(venueRaw, dateRaw);
  if (!event) {
    return NextResponse.json(
      { error: `No English Night found for ${venueRaw} on ${dateRaw}.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ event });
}
