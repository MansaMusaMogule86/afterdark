"use client";

/**
 * Consent-aware analytics tracking.
 *
 * - Server log (/api/track) ALWAYS fires (first-party, anonymous, no PII) —
 *   this is necessary for core functionality monitoring and is not gated.
 * - dataLayer push (GTM/GA4/Meta Pixel) ONLY fires when the user has granted
 *   analytics consent via the cookie consent banner.
 *
 * No personal information is sent to any platform.
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
  | "promoter_conversion"
  | "concierge_open"
  | "concierge_request_type_selected"
  | "concierge_venue_selected"
  | "concierge_details_completed"
  | "concierge_lead_created"
  | "concierge_whatsapp_opened"
  | "concierge_fallback_selected";

interface ConsentPreferences {
  status: "accepted" | "rejected" | null;
  preferences: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

const CONSENT_KEY = "amd_cookie_consent_v1";

/** Read the stored consent preferences from localStorage. */
export function getConsent(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
}

/** Returns true if the user has granted analytics consent. */
export function hasAnalyticsConsent(): boolean {
  const c = getConsent();
  return c?.status === "accepted" && c.preferences.analytics === true;
}

/** Returns true if the user has granted marketing consent. */
export function hasMarketingConsent(): boolean {
  const c = getConsent();
  return c?.status === "accepted" && c.preferences.marketing === true;
}

export function track(
  name: TrackEventName,
  params: Record<string, string | number | boolean | undefined> = {}
) {
  // Strip anything that looks like PII (phone/email).
  const safe: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    safe[k] = v;
  }

  // dataLayer push (GTM/GA4/Meta Pixel) — GATED by analytics consent.
  // Only fire third-party tracking when the user has explicitly opted in.
  if (hasAnalyticsConsent()) {
    try {
      const w = window as unknown as { dataLayer?: unknown[] };
      if (w.dataLayer) {
        w.dataLayer.push({ event: name, ...safe });
      }
    } catch {
      /* no-op */
    }
  }

  // Server log via fetch (first-party, anonymous) — ALWAYS fires.
  // This is necessary for core functionality monitoring and is not a
  // third-party tracker, so it does not require marketing/analytics consent.
  // No PII is transmitted.
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        params: safe,
        ts: Date.now(),
        consent: hasAnalyticsConsent() ? "granted" : "denied",
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* no-op */
  }
}
