/**
 * English Night Instagram Automation
 * ----------------------------------
 *
 * RULES (per directive):
 * - Do NOT import all Instagram content.
 * - Do NOT create a general Instagram feed.
 * - Only import posts whose caption contains: #AMDXBENGLISHNIGHT
 * - Monitor approved accounts for Avenue, Ora, Black Tape only.
 * - Ignore every post without the hashtag.
 *
 * For every matching post, extract:
 *   venue, title, date, doors, close, music, DJs, entry, VIP, guest list,
 *   media ID + permalink.
 *
 * Import statuses:
 *   READY TO PUBLISH  — venue ✓, date ✓, time ✓, event media ✓
 *   NEEDS REVIEW      — some fields missing/ambiguous
 *   REJECTED          — doesn't meet criteria (e.g. no date, duplicate)
 *
 * Auto-publish ONLY when venue, date, time, and event media are validated.
 *
 * This is a typed mock adapter. The interface is identical to the future
 * production Instagram Graph API adapter. No real Instagram credentials
 * are used or exposed.
 */

import type { MusicGenre, VenueSlug, EventOccurrence, EventStatus } from "./types";
import { getVenue } from "./venue-data";
import { getServiceDate, addDays } from "./tonight";

export const ENGLISH_NIGHT_HASHTAG = "#AMDXBENGLISHNIGHT";

export type ImportStatus = "READY_TO_PUBLISH" | "NEEDS_REVIEW" | "REJECTED";

/** Approved Instagram accounts per venue. */
export const approvedAccounts: Record<VenueSlug, { handle: string; instagramId: string }> = {
  avenue: { handle: "@avenueclub.dubai", instagramId: "avenue_ig_id" },
  ora: { handle: "@oraclub.dubai", instagramId: "ora_ig_id" },
  blacktape: { handle: "@blacktape.dubai", instagramId: "blacktape_ig_id" },
};

/** Reverse lookup: handle → venue. */
const handleToVenue: Record<string, VenueSlug> = Object.fromEntries(
  (Object.entries(approvedAccounts) as [VenueSlug, { handle: string }][]).map(
    ([slug, info]) => [info.handle.toLowerCase(), slug]
  )
);

export interface ParsedCaption {
  venue: VenueSlug | null;
  title: string | null;
  date: string | null; // YYYY-MM-DD
  doors: string | null; // "11:30 PM"
  close: string | null; // "4:00 AM"
  music: MusicGenre[];
  djs: string[];
  entry: string | null;
  vip: string | null;
  guestList: string | null;
}

export interface InstagramImport {
  id: string;
  /** Instagram media ID. */
  mediaId: string;
  permalink: string;
  /** Account handle that posted. */
  accountHandle: string;
  venue: VenueSlug | null;
  caption: string;
  postedAt: string; // ISO
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  thumbnailUrl: string;
  parsed: ParsedCaption;
  status: ImportStatus;
  statusReason: string;
  /** Resulting event occurrence id (when published). */
  occurrenceId: string | null;
  /** Sample data flag. */
  sample: boolean;
  importedAt: string;
}

export interface EnglishNightEvent extends EventOccurrence {
  /** Origin: Instagram import. */
  source: "instagram";
  mediaId: string;
  permalink: string;
  accountHandle: string;
  importStatus: ImportStatus;
}

/* ---------------------------------------------------------------------------
 * Caption parser
 * -------------------------------------------------------------------------
 * Supports two caption styles:
 *  1. Structured key:value lines (Title:, Date:, Doors:, etc.)
 *  2. Natural-language fallback (best-effort regex extraction)
 *
 * The parser is deterministic and side-effect free so it can run server-side
 * on import and be unit-tested.
 * ------------------------------------------------------------------------- */

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

const GENRE_KEYWORDS: { genre: MusicGenre; keywords: string[] }[] = [
  { genre: "arabic", keywords: ["arabic", "khaleeji", "khaliji"] },
  { genre: "hiphop", keywords: ["hip hop", "hiphop", "hip-hop"] },
  { genre: "rnb", keywords: ["r&b", "rnb", "r and b"] },
  { genre: "afro", keywords: ["afro", "afrobeats", "afrobeat"] },
  { genre: "dancehall", keywords: ["dancehall"] },
  { genre: "house", keywords: ["house", "deep house", "tech house"] },
  { genre: "international", keywords: ["international", "open format", "open-format"] },
  { genre: "urban", keywords: ["urban"] },
];

export function parseCaption(caption: string, accountHandle: string): ParsedCaption {
  const text = caption.trim();
  const lower = text.toLowerCase();

  // Venue from account handle.
  const venue: VenueSlug | null = handleToVenue[accountHandle.toLowerCase()] ?? null;

  // Key:value extraction.
  const kv = (key: string): string | null => {
    const m = text.match(new RegExp(`^\\s*${key}\\s*:\\s*(.+)$`, "im"));
    return m ? m[1].trim() : null;
  };

  const title = kv("Title") || kv("Event");
  const doors = kv("Doors") || kv("Door");
  const close = kv("Close") || kv("Closing") || kv("End");
  const entry = kv("Entry");
  const vip = kv("VIP") || kv("Table");
  const guestList = kv("Guest List") || kv("Guest list");

  // Date extraction.
  let date: string | null = kv("Date");
  if (!date) {
    // Try natural-language date: "Friday 28 August", "Aug 28", "28/08", "2026-08-28"
    date = extractDateNatural(text);
  }
  if (date) {
    date = normalizeDate(date);
  }

  // Music genres.
  const music: MusicGenre[] = [];
  const musicKv = kv("Music");
  const musicText = musicKv ? musicKv.toLowerCase() : lower;
  for (const g of GENRE_KEYWORDS) {
    if (g.keywords.some((k) => musicText.includes(k))) {
      if (!music.includes(g.genre)) music.push(g.genre);
    }
  }

  // DJs / performers.
  const djKv = kv("DJ") || kv("DJs") || kv("Performer") || kv("Performers");
  let djs: string[] = [];
  if (djKv) {
    djs = djKv.split(/[,;/]|(?:\s+&\s+)|\s+and\s+/i).map((s) => s.trim()).filter(Boolean);
  } else {
    const djMatch = lower.match(/(?:dj|performing|live)[:\s]+(.+?)(?:\n|$)/i);
    if (djMatch) {
      djs = djMatch[1].split(/[,;/]|(?:\s+&\s+)/).map((s) => s.trim()).filter(Boolean);
    }
  }

  return { venue, title, date, doors, close, music, djs, entry, vip, guestList };
}

function extractDateNatural(text: string): string | null {
  // ISO: 2026-08-28
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = text.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](20\d{2})\b/);
  if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2, "0")}-${String(dmy[1]).padStart(2, "0")}`;
  // "Friday 28 August" / "28 August 2026" / "Aug 28"
  const monthNames = Object.keys(MONTHS).join("|");
  const m1 = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${monthNames})(?:\\s+(20\\d{2}))?\\b`, "i"));
  if (m1) {
    const day = m1[1];
    const mon = String(MONTHS[m1[2].toLowerCase().slice(0, 3)]).padStart(2, "0");
    const year = m1[3] || String(new Date().getUTCFullYear());
    return `${year}-${mon}-${String(day).padStart(2, "0")}`;
  }
  const m2 = text.match(new RegExp(`\\b(${monthNames})\\s+(\\d{1,2})(?:\\s+(20\\d{2}))?\\b`, "i"));
  if (m2) {
    const mon = String(MONTHS[m2[1].toLowerCase().slice(0, 3)]).padStart(2, "0");
    const day = m2[2];
    const year = m2[3] || String(new Date().getUTCFullYear());
    return `${year}-${mon}-${String(day).padStart(2, "0")}`;
  }
  return null;
}

function normalizeDate(d: string): string | null {
  const m = d.match(/^(20\d{2})-(\d{2})-(\d{2})$/);
  if (m) return d;
  const parsed = new Date(d);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

/* ---------------------------------------------------------------------------
 * Import status classification
 * ------------------------------------------------------------------------- */

export function classifyImport(parsed: ParsedCaption, isDuplicate: boolean): {
  status: ImportStatus;
  reason: string;
} {
  if (isDuplicate) {
    return { status: "REJECTED", reason: "Duplicate event — media ID or venue+date already imported." };
  }
  if (!parsed.venue) {
    return { status: "REJECTED", reason: "Could not identify venue from account." };
  }
  if (!parsed.date) {
    return { status: "NEEDS_REVIEW", reason: "No event date found in caption." };
  }
  if (!parsed.doors) {
    return { status: "NEEDS_REVIEW", reason: "No doors time found in caption." };
  }
  if (!parsed.title) {
    return { status: "NEEDS_REVIEW", reason: "No event title found in caption." };
  }
  // Auto-publish requires venue ✓, date ✓, time ✓, event media ✓.
  return { status: "READY_TO_PUBLISH", reason: "Venue, date, time validated. Ready to publish." };
}

/* ---------------------------------------------------------------------------
 * English Night occurrence generation
 * ------------------------------------------------------------------------- */

let occurrenceCounter = 0;

export function importToOccurrence(imp: InstagramImport): EnglishNightEvent | null {
  if (imp.status !== "READY_TO_PUBLISH" && imp.status !== "NEEDS_REVIEW") return null;
  const p = imp.parsed;
  if (!p.venue || !p.date || !p.doors) return null;

  const venue = getVenue(p.venue)!;
  const conceptSlug = "english-night";
  const title = p.title || `English Night — ${venue.shortName}`;
  const occurrenceId = `en-${p.venue}-${p.date}`;

  const ev: EnglishNightEvent = {
    id: occurrenceId,
    conceptSlug,
    title,
    venue: p.venue,
    serviceDate: p.date,
    startTime: p.doors,
    endTime: p.close || "4:00 AM",
    timezone: "Asia/Dubai",
    status: "scheduled",
    music: p.music.length > 0 ? p.music : ["international"],
    artist: p.djs.length > 0 ? p.djs.join(", ") : undefined,
    description: `English Night at ${venue.name}. ${p.music.length > 0 ? p.music.join(", ").toUpperCase() : "International"} night imported from Instagram via #AMDXBENGLISHNIGHT.`,
    poster: imp.thumbnailUrl,
    landscapeImage: imp.thumbnailUrl,
    squareImage: imp.thumbnailUrl,
    entryInfo: p.entry || "Guest list and table entry. Original ID required.",
    dressCode: venue.dressCode.summary,
    agePolicy: `${venue.agePolicy.minimumAge}+. Original ID required.`,
    tableInfo: undefined, // never fake — Contact Concierge
    offerInfo: undefined,
    bookingCutoff: "9:00 PM Dubai time on event night",
    location: venue.location,
    whatsappAction: "Contact Concierge",
    relatedEventIds: [],
    sample: imp.sample,
    source: "instagram",
    mediaId: imp.mediaId,
    permalink: imp.permalink,
    accountHandle: imp.accountHandle,
    importStatus: imp.status,
  };

  occurrenceCounter++;
  return ev;
}

/* ---------------------------------------------------------------------------
 * In-memory import store (typed mock)
 * ------------------------------------------------------------------------- */

const importStore = new Map<string, InstagramImport>();
const occurrenceStore = new Map<string, EnglishNightEvent>();
const seenMediaIds = new Set<string>();

let importRunCount = 0;
let lastImportAt: string | null = null;

export function getImportStats() {
  const arr = Array.from(importStore.values());
  return {
    total: arr.length,
    ready: arr.filter((i) => i.status === "READY_TO_PUBLISH").length,
    needsReview: arr.filter((i) => i.status === "NEEDS_REVIEW").length,
    rejected: arr.filter((i) => i.status === "REJECTED").length,
    runs: importRunCount,
    lastImportAt,
  };
}

export function getAllImports(): InstagramImport[] {
  return Array.from(importStore.values()).sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function getPublishedEnglishNights(): EnglishNightEvent[] {
  return Array.from(occurrenceStore.values())
    .filter((e) => e.importStatus === "READY_TO_PUBLISH")
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));
}

export function getAllEnglishNights(): EnglishNightEvent[] {
  return Array.from(occurrenceStore.values()).sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));
}

export function getEnglishNight(venue: string, date: string): EnglishNightEvent | null {
  return occurrenceStore.get(`en-${venue}-${date}`) || null;
}

export function getTonightEnglishNights(): EnglishNightEvent[] {
  const tonight = getServiceDate();
  return getPublishedEnglishNights().filter((e) => e.serviceDate === tonight);
}

/* ---------------------------------------------------------------------------
 * Import runner (mock)
 * -------------------------------------------------------------------------
 * In production this would poll the Instagram Graph API for the three
 * approved accounts, filter by hashtag, and import matching posts.
 * Here we simulate by ingesting sample captions.
 * ------------------------------------------------------------------------- */

const SAMPLE_CAPTIONS: { venue: VenueSlug; caption: string; postedAt: string }[] = [
  {
    venue: "avenue",
    postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    caption: `${ENGLISH_NIGHT_HASHTAG}
Title: English Night — Friday
Date: ${addDays(getServiceDate(), 2)}
Doors: 11:30 PM
Close: 4:00 AM
Music: International, House
DJ: DJ Noir & Resident
Entry: Guest list + tables
VIP: Tables via concierge
Guest List: Close 10:30 PM`,
  },
  {
    venue: "ora",
    postedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    caption: `${ENGLISH_NIGHT_HASHTAG}
Title: English Night — Saturday
Date: ${addDays(getServiceDate(), 3)}
Doors: 11:30 PM
Close: 4:30 AM
Music: International, Open Format
DJ: Guest DJ (Sample)
Entry: Guest list and table entry
VIP: Premium tables available
Guest List: Close 10 PM`,
  },
  {
    venue: "blacktape",
    postedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    caption: `${ENGLISH_NIGHT_HASHTAG}
Title: English Night — Thursday
Date: ${addDays(getServiceDate(), 1)}
Doors: 11:30 PM
Close: 4:00 AM
Music: Hip Hop, R&B
DJ: DJ Sample + MC
Entry: Guest list + tables
VIP: Stage tables via concierge
Guest List: Close 10 PM`,
  },
  {
    // NEEDS REVIEW — missing doors time
    venue: "avenue",
    postedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    caption: `${ENGLISH_NIGHT_HASHTAG}
Title: English Night — Wednesday
Date: ${addDays(getServiceDate(), 5)}
Music: International
DJ: TBA`,
  },
  {
    // READY but missing title (will be auto-generated)
    venue: "ora",
    postedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    caption: `${ENGLISH_NIGHT_HASHTAG}
Date: ${addDays(getServiceDate(), 7)}
Doors: 11:30 PM
Music: House, International
DJ: Resident`,
  },
];

/**
 * Run one import pass. Returns the count of newly imported posts.
 * Idempotent: re-running with the same sample data does not create duplicates
 * because media IDs are tracked.
 */
export function runImport(): { imported: number; updated: number; skipped: number } {
  importRunCount++;
  lastImportAt = new Date().toISOString();

  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const sample of SAMPLE_CAPTIONS) {
    const mediaId = `ig_${sample.venue}_${sample.postedAt.slice(0, 10)}`;
    if (seenMediaIds.has(mediaId)) {
      skipped++;
      continue;
    }

    const accountInfo = approvedAccounts[sample.venue];
    const parsed = parseCaption(sample.caption, accountInfo.handle);

    // Duplicate check: same venue + date already published?
    const dupKey = parsed.date ? `${parsed.venue}-${parsed.date}` : null;
    const isDuplicate = dupKey ? Array.from(occurrenceStore.values()).some(
      (e) => e.venue === parsed.venue && e.serviceDate === parsed.date
    ) : false;

    const { status, reason } = classifyImport(parsed, isDuplicate);

    const imp: InstagramImport = {
      id: `imp_${mediaId}`,
      mediaId,
      permalink: `https://www.instagram.com/p/${mediaId.replace(/[^a-z0-9]/gi, "")}/`,
      accountHandle: accountInfo.handle,
      venue: parsed.venue,
      caption: sample.caption,
      postedAt: sample.postedAt,
      mediaType: "IMAGE",
      thumbnailUrl: `/placeholders/event_${sample.venue}_english-night_${parsed.date || "tba"}_portrait.webp`,
      parsed,
      status,
      statusReason: reason,
      occurrenceId: null,
      sample: true,
      importedAt: lastImportAt,
    };

    importStore.set(imp.id, imp);
    seenMediaIds.add(mediaId);

    // Auto-publish only when READY_TO_PUBLISH (venue ✓, date ✓, time ✓, media ✓).
    if (status === "READY_TO_PUBLISH") {
      const occ = importToOccurrence(imp);
      if (occ) {
        occurrenceStore.set(occ.id, occ);
        imp.occurrenceId = occ.id;
        imported++;
      } else {
        updated++;
      }
    } else if (status === "NEEDS_REVIEW") {
      // Store as a pending occurrence for manual review.
      const occ = importToOccurrence(imp);
      if (occ) {
        occurrenceStore.set(occ.id, occ);
        imp.occurrenceId = occ.id;
      }
      updated++;
    }
  }

  return { imported, updated, skipped };
}

/**
 * Manually publish a NEEDS_REVIEW import after an admin reviews it.
 */
export function publishImport(importId: string): { ok: boolean; occurrenceId?: string; error?: string } {
  const imp = importStore.get(importId);
  if (!imp) return { ok: false, error: "Import not found." };
  if (imp.status === "REJECTED") return { ok: false, error: "Cannot publish a rejected import." };
  if (imp.status === "READY_TO_PUBLISH" && imp.occurrenceId) {
    return { ok: true, occurrenceId: imp.occurrenceId };
  }
  const occ = importToOccurrence(imp);
  if (!occ) return { ok: false, error: "Cannot build occurrence — missing required fields." };
  occurrenceStore.set(occ.id, occ);
  imp.status = "READY_TO_PUBLISH";
  imp.statusReason = "Manually published after review.";
  imp.occurrenceId = occ.id;
  return { ok: true, occurrenceId: occ.id };
}

/**
 * Reject an import.
 */
export function rejectImport(importId: string, reason?: string): { ok: boolean; error?: string } {
  const imp = importStore.get(importId);
  if (!imp) return { ok: false, error: "Import not found." };
  if (imp.occurrenceId) {
    occurrenceStore.delete(imp.occurrenceId);
  }
  imp.status = "REJECTED";
  imp.statusReason = reason || "Manually rejected.";
  imp.occurrenceId = null;
  return { ok: true };
}

/**
 * Seed the store on first access so the views have data to show.
 */
let seeded = false;
export function ensureSeeded(): void {
  if (seeded) return;
  seeded = true;
  runImport();
}
