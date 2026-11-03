import { NextRequest, NextResponse } from "next/server";
import { getEventDemand, getVenueDemand, getTotalBookings } from "@/lib/demand";

export const dynamic = "force-dynamic";

/**
 * GET /api/demand
 * Returns honest demand info based on real booking inquiry volume.
 *
 * Query params:
 *   ?event=<eventOrDate>  — demand for a specific event
 *   ?venue=<venueSlug>    — demand for a specific venue
 *   (no params)           — total bookings count
 *
 * Per directive: never fake availability or sold-out state.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const event = searchParams.get("event");
  const venue = searchParams.get("venue");

  if (event) {
    const demand = getEventDemand(event);
    return NextResponse.json({ demand, event });
  }

  if (venue) {
    const demand = getVenueDemand(venue);
    return NextResponse.json({ demand, venue });
  }

  // Default: total bookings
  return NextResponse.json({
    totalBookings: getTotalBookings(),
  });
}
