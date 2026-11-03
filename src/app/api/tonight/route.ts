/**
 * GET /api/tonight
 * ----------------
 * Returns tonight's nightlife service date, human label, and the list of
 * event occurrences scheduled for tonight (stripped to a light DTO).
 *
 * The "service date" uses the Asia/Dubai boundary (6:00 AM = new day),
 * so an event starting 11 PM and ending 4 AM stays attached to the
 * original service date.
 */

import { NextResponse } from "next/server";
import { getServiceDateLabel } from "@/lib/tonight";
import { getTonightOccurrences } from "@/lib/events-data";
import type { EventOccurrence } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface TonightEventDTO {
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
}

export interface TonightResponse {
  date: string;
  label: string;
  longLabel: string;
  events: TonightEventDTO[];
}

function toDTO(e: EventOccurrence): TonightEventDTO {
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
  };
}

export async function GET(): Promise<NextResponse<TonightResponse>> {
  const { date, label, longLabel } = getServiceDateLabel();
  const events = getTonightOccurrences().map(toDTO);
  return NextResponse.json({
    date,
    label,
    longLabel,
    events,
  });
}
