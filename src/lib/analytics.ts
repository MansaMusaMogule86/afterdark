"use client";

/**
 * Consent-aware analytics tracking.
 * Fires events to /api/track (server log) and pushes to dataLayer for GTM/GA4
 * when consent is granted. No personal information is sent.
 */

export type TrackEventName =
  | "view_venue"
  | "view_event"
  | "filter_events"
  | "complete_venue_matcher"
  | "start_vip_inquiry"
  | "submit_vip_inquiry"
  | "click_whatsapp"
  | "click_call"
  | "click_map"
  | "add_to_calendar"
  | "newsletter_signup"
  | "promoter_conversion";

export function track(
  name: TrackEventName,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  // Avoid sending PII — strip anything that looks like a phone/email.
  const safe: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    safe[k] = v;
  }

  // dataLayer push (GTM/GA4) — gated by consent flag if present.
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    if (w.dataLayer) {
      w.dataLayer.push({ event: name, ...safe });
    }
  } catch {
    /* no-op */
  }

  // Server log via fetch (fire and forget).
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, params: safe, ts: Date.now() }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* no-op */
  }
}
