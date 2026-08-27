/**
 * In-memory API stores — module-level Maps used as a mock persistence layer
 * until a real database (NightOps OS adapter) is connected.
 *
 * IMPORTANT: This is server-only. State is per-process and resets on restart.
 * Suitable for a single-instance dev/staging mock only.
 */

import type { VipBookingLead } from "./types";

/* Booking leads keyed by booking reference. */
export const bookingStore = new Map<string, VipBookingLead>();

/* Newsletter subscribers keyed by lowercased email. */
export interface NewsletterRecord {
  email: string;
  preferences: string[];
  consent: boolean;
  createdAt: string;
  ip: string;
  attribution: {
    firstReferrer?: string;
    lastReferrer?: string;
    campaign?: string;
  };
}
export const newsletterStore = new Map<string, NewsletterRecord>();

/* Dedup tracker: hash → last-accepted timestamp (ms). */
export const bookingDedupStore = new Map<string, number>();

/* Track event log ring buffer (capped, fire-and-forget). */
export interface TrackLogEntry {
  receivedAt: number;
  name: string;
  params: Record<string, string | number | boolean | undefined>;
}
export const trackLog: TrackLogEntry[] = [];
export const TRACK_LOG_MAX = 500;
