/**
 * GET /api/events
 * ---------------
 * Returns upcoming event occurrences for the next N service days
 * (default 7, max 30 via ?days=).
 *
 * Optional filters:
 *   ?venue=avenue|ora|blacktape
 *   ?music=<genre>          (e.g. arabic, hiphop, afro)
 *   ?status=<EventStatus>   (e.g. live, scheduled)
 *
 * Returns: { events: [...], count, range: { from, to } }
 */

import { NextRequest, NextResponse } from "next/server";
import { getUpcomingOccurrences } from "@/lib/events-data";
import { getServiceDate, addDays } from "@/lib/tonight";
import type { EventOccurrence, MusicGenre, VenueSlug, EventStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const VENUE_SLUGS: readonly VenueSlug[] = ["avenue", "ora", "blacktape"];
const MUSIC_GENRES: readonly MusicGenre[] = [
  "arabic", "khaleeji", "hiphop", "rnb", "afro",
  "dancehall", "house", "international", "urban",
];
const EVENT_STATUSES: readonly EventStatus[] = [
  "draft", "scheduled", "live", "sold_out",
  "postponed", "cancelled", "completed",
];

function isVenueSlug(s: string): s is VenueSlug {
  return (VENUE_SLUGS as readonly string[]).includes(s);
}
function isMusicGenre(s: string): s is MusicGenre {
  return (MUSIC_GENRES as readonly string[]).includes(s);
}
function isEventStatus(s: string): s is EventStatus {
  return (EVENT_STATUSES as readonly string[]).includes(s);
}

export interface EventDTO {
  id: string;
  title: string;
  venue: string;
  conceptSlug: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  status: string;
  music: string[];
  artist?: string;
  description: string;
  sample: boolean;
}

export interface EventsResponse {
  events: EventDTO[];
  count: number;
  range: { from: string; to: string };
}

function toDTO(e: EventOccurrence): EventDTO {
  return {
    id: e.id,
    title: e.title,
    venue: e.venue,
    conceptSlug: e.conceptSlug,
    serviceDate: e.serviceDate,
    startTime: e.startTime,
    endTime: e.endTime,
    status: e.status,
    music: e.music,
    artist: e.artist,
    description: e.description,
    sample: e.sample,
  };
}

export async function GET(
  req: NextRequest
): Promise<NextResponse<EventsResponse>> {
  const sp = req.nextUrl.searchParams;

  // Parse days: default 7, clamp 1..30.
  const rawDays = Number.parseInt(sp.get("days") ?? "7", 10);
  const days = Number.isFinite(rawDays)
    ? Math.max(1, Math.min(30, rawDays))
    : 7;

  // Optional filters.
  const venueParam = sp.get("venue")?.trim();
  const musicParam = sp.get("music")?.trim();
  const statusParam = sp.get("status")?.trim();

  const venue = venueParam && isVenueSlug(venueParam) ? venueParam : undefined;
  const music = musicParam && isMusicGenre(musicParam) ? musicParam : undefined;
  const status = statusParam && isEventStatus(statusParam) ? statusParam : undefined;

  const from = getServiceDate();
  const to = addDays(from, days - 1);

  let events = getUpcomingOccurrences(days);
  if (venue) events = events.filter((e) => e.venue === venue);
  if (music) events = events.filter((e) => e.music.includes(music));
  if (status) events = events.filter((e) => e.status === status);

  return NextResponse.json({
    events: events.map(toDTO),
    count: events.length,
    range: { from, to },
  });
}
