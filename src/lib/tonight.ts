/**
 * Tonight Engine — Nightlife Service Date Logic
 * ----------------------------------------------
 * A nightlife service date must NOT reset at midnight.
 * Boundary: 6:00 AM Dubai time = start of new service day.
 *
 * An event starting at 11:00 PM and finishing at 4:00 AM stays attached
 * to the ORIGINAL service date.
 *
 * All times are Asia/Dubai.
 */

import { siteConfig } from "./site-config";

/**
 * Returns the current nightlife service date in Asia/Dubai as YYYY-MM-DD.
 * Uses Intl with timeZone to avoid relying on the server's local clock.
 */
export function getServiceDate(now: Date = new Date()): string {
  const tz = siteConfig.timezone;
  // Get Dubai wall-clock parts.
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = parseInt(get("hour"), 10);

  const boundary = siteConfig.serviceDayBoundaryHour; // 6

  // If current hour is before 6 AM, the service date is the PREVIOUS calendar day.
  if (hour < boundary) {
    const prev = new Date(`${year}-${month}-${day}T00:00:00Z`);
    prev.setUTCDate(prev.getUTCDate() - 1);
    return prev.toISOString().slice(0, 10);
  }
  return `${year}-${month}-${day}`;
}

/**
 * Returns a human label for the service date, e.g. "Tonight" / "Saturday Night".
 */
export function getServiceDateLabel(now: Date = new Date()): {
  label: string;
  longLabel: string;
  date: string;
} {
  const serviceDate = getServiceDate(now);
  const tz = siteConfig.timezone;
  // Determine the weekday of the service date.
  const d = new Date(`${serviceDate}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
  }).format(d);
  const dateStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

  // Is this service date "tonight"? Compare to today's service date.
  const tonightService = getServiceDate(new Date());
  const isTonight = serviceDate === tonightService;

  return {
    label: isTonight ? "Tonight" : `${weekday} Night`,
    longLabel: isTonight
      ? `Tonight — ${weekday}, ${dateStr}`
      : `${weekday}, ${dateStr}`,
    date: serviceDate,
  };
}

/**
 * Generate a slug-friendly date key.
 */
export function dateToKey(date: string): string {
  return date;
}

/**
 * Add days to a YYYY-MM-DD date string (returns YYYY-MM-DD).
 */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Get the next N days of service dates starting from a given date.
 */
export function getNextServiceDates(start: string, count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(addDays(start, i));
  }
  return out;
}
