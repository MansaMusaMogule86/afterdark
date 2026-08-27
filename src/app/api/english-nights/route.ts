/**
 * GET /api/english-nights
 * -----------------------
 * Returns English Night events imported from Instagram via the
 * #AMDXBENGLISHNIGHT hashtag.
 *
 * Query:
 *   ?status=published|all|tonight   (default: published)
 *       published — only READY_TO_PUBLISH occurrences
 *       all       — every stored occurrence (incl. NEEDS_REVIEW)
 *       tonight   — published English Nights on tonight's service date
 *
 *   ?venue=avenue|ora|blacktape     (optional filter)
 *
 * Returns: { events: [...light DTO], count, stats }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  ensureSeeded,
  getAllEnglishNights,
  getPublishedEnglishNights,
  getTonightEnglishNights,
  getImportStats,
} from "@/lib/english-nights";
import type { EnglishNightEvent, ImportStatus } from "@/lib/english-nights";
import type { VenueSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

const VENUE_SLUGS: readonly VenueSlug[] = ["avenue", "ora", "blacktape"];
const STATUS_MODES = ["published", "all", "tonight"] as const;
type StatusMode = (typeof STATUS_MODES)[number];

function isVenueSlug(s: string): s is VenueSlug {
  return (VENUE_SLUGS as readonly string[]).includes(s);
}

function isStatusMode(s: string): s is StatusMode {
  return (STATUS_MODES as readonly string[]).includes(s);
}

export interface EnglishNightLightDTO {
  id: string;
  title: string;
  venue: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  status: string;
  music: string[];
  artist?: string;
  importStatus: ImportStatus;
  mediaId: string;
  permalink: string;
  accountHandle: string;
  poster: string;
  sample: boolean;
}

export interface EnglishNightsResponse {
  events: EnglishNightLightDTO[];
  count: number;
  stats: ReturnType<typeof getImportStats>;
}

function toDTO(e: EnglishNightEvent): EnglishNightLightDTO {
  return {
    id: e.id,
    title: e.title,
    venue: e.venue,
    serviceDate: e.serviceDate,
    startTime: e.startTime,
    endTime: e.endTime,
    status: e.status,
    music: e.music,
    artist: e.artist,
    importStatus: e.importStatus,
    mediaId: e.mediaId,
    permalink: e.permalink,
    accountHandle: e.accountHandle,
    poster: e.poster,
    sample: e.sample,
  };
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<EnglishNightsResponse | { error: string }>> {
  const sp = req.nextUrl.searchParams;

  const statusRaw = (sp.get("status") ?? "published").trim();
  if (!isStatusMode(statusRaw)) {
    return NextResponse.json(
      { error: `Invalid ?status=. Expected one of: ${STATUS_MODES.join(", ")}.` },
      { status: 400 }
    );
  }

  const venueRaw = sp.get("venue")?.trim();
  if (venueRaw && !isVenueSlug(venueRaw)) {
    return NextResponse.json(
      { error: `Invalid ?venue=. Expected one of: ${VENUE_SLUGS.join(", ")}.` },
      { status: 400 }
    );
  }

  ensureSeeded();

  let events: EnglishNightEvent[];
  switch (statusRaw) {
    case "tonight":
      events = getTonightEnglishNights();
      break;
    case "all":
      events = getAllEnglishNights();
      break;
    case "published":
    default:
      events = getPublishedEnglishNights();
      break;
  }

  if (venueRaw) {
    events = events.filter((e) => e.venue === venueRaw);
  }

  const stats = getImportStats();

  return NextResponse.json({
    events: events.map(toDTO),
    count: events.length,
    stats,
  });
}
