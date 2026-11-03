/**
 * Honest demand indicator — based on REAL booking inquiry volume, never faked.
 *
 * Per directive: "Never display fake availability or a fake sold-out state."
 * This module counts actual booking leads per event/venue from the in-memory
 * booking store and classifies demand honestly:
 *
 *   - LOW:      0-2 inquiries
 *   - TRENDING: 3-5 inquiries
 *   - HIGH:     6+ inquiries
 *
 * If no booking data exists (fresh server start), returns "NEW" — not a fake
 * "selling fast" state. The label always reflects actual inquiry volume.
 */

import { bookingStore } from "./api-store";
import type { VipBookingLead } from "./types";

export type DemandLevel = "NEW" | "LOW" | "TRENDING" | "HIGH";

export interface DemandInfo {
  level: DemandLevel;
  label: string;
  description: string;
  inquiryCount: number;
}

/**
 * Count booking inquiries for a specific event.
 */
export function getEventDemand(eventOrDate: string): DemandInfo {
  let count = 0;
  for (const lead of bookingStore.values()) {
    if (lead.eventOrDate === eventOrDate) {
      count++;
    }
  }
  return classifyDemand(count);
}

/**
 * Count booking inquiries for a specific venue.
 */
export function getVenueDemand(venue: string): DemandInfo {
  let count = 0;
  for (const lead of bookingStore.values()) {
    if (lead.venue === venue) {
      count++;
    }
  }
  return classifyDemand(count);
}

/**
 * Get total booking count (for stats display).
 */
export function getTotalBookings(): number {
  return bookingStore.size;
}

/**
 * Get recent bookings (for demand trends).
 */
export function getRecentBookings(limit = 10): VipBookingLead[] {
  return Array.from(bookingStore.values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

function classifyDemand(count: number): DemandInfo {
  if (count === 0) {
    return {
      level: "NEW",
      label: "New",
      description: "No inquiries yet — be the first to request a table.",
      inquiryCount: 0,
    };
  }
  if (count <= 2) {
    return {
      level: "LOW",
      label: `${count} ${count === 1 ? "inquiry" : "inquiries"}`,
      description: "Light demand — tables likely available.",
      inquiryCount: count,
    };
  }
  if (count <= 5) {
    return {
      level: "TRENDING",
      label: `Trending · ${count} inquiries`,
      description: "Building interest — request early to secure a table.",
      inquiryCount: count,
    };
  }
  return {
    level: "HIGH",
    label: `High demand · ${count} inquiries`,
    description: "Strong interest — contact concierge immediately to secure a table.",
    inquiryCount: count,
  };
}
