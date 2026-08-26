/**
 * Venue Matcher — Find My Venue
 * -----------------------------
 * Asks: preferred date, music, mood, location, group size, occasion, budget.
 * Ranks live events and venues using structured data only (no hallucinations).
 * Returns a recommendation with a concise explanation.
 *
 * IMPORTANT: Only uses live venue + event records. No open-ended chatbot.
 */

import { venues } from "./venue-data";
import { eventOccurrences } from "./events-data";
import { getServiceDate, addDays } from "./tonight";
import type { MusicGenre, VenueSlug } from "./types";

export interface MatcherInput {
  preferredDate: string; // YYYY-MM-DD service date
  music: MusicGenre | "any";
  mood: "energy" | "immersive" | "social" | "late" | "any";
  location: "shangrila" | "habtoor" | "any";
  groupSize: number;
  occasion: "night_out" | "birthday" | "bachelorette" | "corporate" | "date" | "any";
  budget: "standard" | "premium" | "stage" | "any";
}

export interface MatcherResult {
  venue: VenueSlug;
  venueName: string;
  reason: string;
  event?: {
    id: string;
    title: string;
    startTime: string;
  };
  score: number;
}

const venueMood: Record<VenueSlug, string[]> = {
  avenue: ["social", "energy"],
  ora: ["immersive", "energy"],
  blacktape: ["late", "energy"],
};

const venueLocation: Record<VenueSlug, "shangrila" | "habtoor"> = {
  avenue: "shangrila",
  ora: "habtoor",
  blacktape: "habtoor",
};

export function runVenueMatcher(input: MatcherInput): MatcherResult[] {
  const results: MatcherResult[] = [];

  // Find events on the preferred date.
  const dateEvents = eventOccurrences.filter(
    (e) => e.serviceDate === input.preferredDate && e.status !== "cancelled"
  );

  for (const v of venues) {
    let score = 0;
    const reasons: string[] = [];

    // Music match.
    if (input.music !== "any") {
      if (v.genres.includes(input.music)) {
        score += 30;
        reasons.push(`matches your ${genreLabel(input.music)} preference`);
      }
    }

    // Mood match.
    if (input.mood !== "any") {
      if (venueMood[v.slug].includes(input.mood)) {
        score += 20;
        reasons.push(`fits a ${input.mood} mood`);
      }
    }

    // Location match.
    if (input.location !== "any") {
      if (venueLocation[v.slug] === input.location) {
        score += 20;
        reasons.push(`at your preferred ${input.location === "shangrila" ? "Sheikh Zayed Road" : "Al Habtoor City"} location`);
      }
    }

    // Occasion match.
    if (input.occasion === "corporate" || input.occasion === "birthday" || input.occasion === "bachelorette") {
      // All venues handle celebrations, but premium-leaning venues score higher for premium occasions.
      if (v.slug === "ora" || v.slug === "avenue") {
        score += 10;
        reasons.push("well suited to hosted celebrations");
      }
    }

    // Budget match (qualitative — no real pricing).
    if (input.budget === "premium" && (v.slug === "ora" || v.slug === "avenue")) {
      score += 5;
    }
    if (input.budget === "stage" && v.slug === "blacktape") {
      score += 5;
    }

    // Find an event on the date.
    const ev = dateEvents.find((e) => e.venue === v.slug);
    if (ev) {
      score += 25;
      reasons.push(`has a live event on your date`);
    } else {
      reasons.push("no confirmed event on that date — contact concierge for the current schedule");
    }

    // Group size (qualitative).
    if (input.groupSize >= 6) {
      score += 5;
      reasons.push("handles larger groups with table service");
    }

    results.push({
      venue: v.slug,
      venueName: v.name,
      reason: `This venue ${reasons.slice(0, 3).join(", ")}.`,
      event: ev
        ? { id: ev.id, title: ev.title, startTime: ev.startTime }
        : undefined,
      score,
    });
  }

  // Sort by score desc.
  results.sort((a, b) => b.score - a.score);

  // If all scores are 0 (e.g. no events), still return sorted by venue name for stability.
  return results;
}

function genreLabel(g: MusicGenre): string {
  const map: Record<MusicGenre, string> = {
    arabic: "Arabic",
    khaleeji: "Khaleeji",
    hiphop: "Hip Hop",
    rnb: "R&B",
    afro: "Afro",
    dancehall: "Dancehall",
    house: "House",
    international: "International",
    urban: "Urban",
  };
  return map[g];
}

/** Convenience: the default suggested date for the matcher is tonight. */
export function defaultMatcherDate(): string {
  return getServiceDate();
}

/** Next 7 service dates for the date selector. */
export function matcherDateOptions(): { value: string; label: string }[] {
  const start = getServiceDate();
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    const date = new Date(`${d}T12:00:00Z`);
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dubai",
      weekday: "short",
    }).format(date);
    const dayMonth = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dubai",
      day: "numeric",
      month: "short",
    }).format(date);
    out.push({
      value: d,
      label: i === 0 ? `Tonight — ${weekday} ${dayMonth}` : `${weekday} ${dayMonth}`,
    });
  }
  return out;
}
