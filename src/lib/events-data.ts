/**
 * Events Data — SAMPLE / WORKING DATA
 * -----------------------------------
 * Two content types:
 * 1. EventConcept — a recurring brand (e.g. Urban Project).
 * 2. EventOccurrence — one specific date.
 *
 * All occurrences are clearly labelled sample: true.
 * Availability is NEVER faked — shows "Contact Concierge" when not supported
 * by live data, per directive.
 *
 * This is a typed mock adapter for the future NightOps OS adapter.
 * The interface is identical to the production adapter.
 */

import type { EventConcept, EventOccurrence } from "./types";
import { getServiceDate, addDays } from "./tonight";

const serviceDate = getServiceDate();

export const eventConcepts: EventConcept[] = [
  {
    slug: "arabic-night",
    name: "Arabic Night",
    venue: "avenue",
    description: "Resident Arabic and Khaleeji sets with live percussion at Avenue.",
    music: ["arabic", "khaleeji"],
    recurring: true,
  },
  {
    slug: "urban-project",
    name: "Urban Project",
    venue: "avenue",
    description: "Selected urban and international concepts at Avenue.",
    music: ["urban", "international"],
    recurring: true,
  },
  {
    slug: "bad-habits",
    name: "Bad Habits",
    venue: "avenue",
    description: "A late, darker concept for the after-midnight crowd at Avenue.",
    music: ["urban", "house"],
    recurring: true,
  },
  {
    slug: "ora-arabic",
    name: "Ora Arabic",
    venue: "ora",
    description: "Resident Arabic and Khaleeji sets with immersive projection at Ora.",
    music: ["arabic", "khaleeji"],
    recurring: true,
  },
  {
    slug: "ora-international",
    name: "Ora International",
    venue: "ora",
    description: "International and house sets through the second half of the night at Ora.",
    music: ["international", "house"],
    recurring: true,
  },
  {
    slug: "black-tape-hiphop",
    name: "Black Tape Hip Hop",
    venue: "blacktape",
    description: "Resident hip hop and R&B sets at Black Tape.",
    music: ["hiphop", "rnb"],
    recurring: true,
  },
  {
    slug: "black-tape-afro",
    name: "Black Tape Afro",
    venue: "blacktape",
    description: "Afro, Afrobeats, and Dancehall concept nights at Black Tape.",
    music: ["afro", "dancehall"],
    recurring: true,
  },
];

/**
 * Generate sample occurrences for the next 10 service days.
 * Clearly labelled sample data. Availability intentionally NOT set so the UI
 * shows "Contact Concierge" rather than a fake quantity.
 */
function generateSampleOccurrences(): EventOccurrence[] {
  const out: EventOccurrence[] = [];
  const days = 10;

  // Define which concept runs on which weekday (0=Sun ... 6=Sat).
  // This is SAMPLE scheduling — pending verification.
  const schedule: {
    weekday: number;
    conceptSlug: string;
    title: string;
    startTime: string;
    endTime: string;
    music: EventOccurrence["music"];
    artist?: string;
    description: string;
  }[] = [
    { weekday: 1, conceptSlug: "urban-project", title: "Urban Project — Monday", startTime: "11:00 PM", endTime: "4:00 AM", music: ["urban", "international"], description: "Urban and international sets opening the week at Avenue." },
    { weekday: 3, conceptSlug: "arabic-night", title: "Arabic Night — Wednesday", startTime: "11:00 PM", endTime: "4:00 AM", music: ["arabic", "khaleeji"], artist: "Resident DJs + Live Percussion", description: "Midweek Arabic and Khaleeji night at Avenue with live percussion." },
    { weekday: 4, conceptSlug: "arabic-night", title: "Arabic Night — Thursday", startTime: "11:30 PM", endTime: "4:00 AM", music: ["arabic", "khaleeji"], artist: "Resident DJs", description: "Thursday Arabic night at Avenue." },
    { weekday: 5, conceptSlug: "arabic-night", title: "Arabic Night — Friday", startTime: "11:30 PM", endTime: "4:30 AM", music: ["arabic", "khaleeji"], artist: "Guest DJ (Sample)", description: "Friday Arabic night at Avenue with a guest DJ." },
    { weekday: 6, conceptSlug: "urban-project", title: "Urban Project — Saturday", startTime: "11:30 PM", endTime: "4:30 AM", music: ["urban", "international"], artist: "Resident DJs", description: "Saturday urban concept at Avenue." },
    // Ora
    { weekday: 3, conceptSlug: "ora-arabic", title: "Ora Arabic — Wednesday", startTime: "11:30 PM", endTime: "4:00 AM", music: ["arabic", "khaleeji"], artist: "Resident DJs", description: "Midweek immersive Arabic night at Ora." },
    { weekday: 4, conceptSlug: "ora-arabic", title: "Ora Arabic — Thursday", startTime: "11:30 PM", endTime: "4:00 AM", music: ["arabic", "khaleeji"], artist: "Resident DJs + Live Percussion", description: "Thursday Arabic night with live percussion at Ora." },
    { weekday: 5, conceptSlug: "ora-arabic", title: "Ora Arabic — Friday", startTime: "11:30 PM", endTime: "4:30 AM", music: ["arabic", "khaleeji"], artist: "Guest DJ (Sample)", description: "Friday Arabic night with guest DJ at Ora." },
    { weekday: 6, conceptSlug: "ora-international", title: "Ora International — Saturday", startTime: "11:30 PM", endTime: "4:30 AM", music: ["international", "house"], artist: "Resident DJs", description: "Saturday international and house sets at Ora." },
    // Black Tape
    { weekday: 1, conceptSlug: "black-tape-hiphop", title: "Black Tape Hip Hop — Monday", startTime: "11:30 PM", endTime: "4:00 AM", music: ["hiphop", "rnb"], artist: "Resident DJs", description: "Monday hip hop and R&B at Black Tape." },
    { weekday: 4, conceptSlug: "black-tape-hiphop", title: "Black Tape R&B — Thursday", startTime: "11:30 PM", endTime: "4:00 AM", music: ["rnb", "hiphop"], artist: "Resident DJs", description: "Thursday R&B night at Black Tape." },
    { weekday: 5, conceptSlug: "black-tape-afro", title: "Black Tape Afro — Friday", startTime: "11:30 PM", endTime: "4:30 AM", music: ["afro", "dancehall"], artist: "Guest DJ (Sample)", description: "Friday Afro and Dancehall night at Black Tape." },
    { weekday: 6, conceptSlug: "black-tape-hiphop", title: "Black Tape Hip Hop — Saturday", startTime: "11:30 PM", endTime: "4:30 AM", music: ["hiphop", "rnb"], artist: "Guest DJ (Sample)", description: "Saturday hip hop headline night at Black Tape." },
  ];

  const conceptBySlug = Object.fromEntries(eventConcepts.map((c) => [c.slug, c]));

  for (let i = 0; i < days; i++) {
    const dateStr = addDays(serviceDate, i);
    // weekday of this date
    const d = new Date(`${dateStr}T12:00:00Z`);
    const weekday = d.getUTCDay(); // 0=Sun ... 6=Sat
    const todays = schedule.filter((s) => s.weekday === weekday);
    for (const s of todays) {
      const concept = conceptBySlug[s.conceptSlug];
      const id = `${s.conceptSlug}-${dateStr}`;
      out.push({
        id,
        conceptSlug: s.conceptSlug,
        title: s.title,
        venue: concept.venue,
        serviceDate: dateStr,
        startTime: s.startTime,
        endTime: s.endTime,
        timezone: "Asia/Dubai",
        status: i === 0 ? "live" : "scheduled",
        music: s.music,
        artist: s.artist,
        description: s.description,
        poster: `/placeholders/event_${concept.venue}_${s.conceptSlug}_${dateStr}_portrait.webp`,
        landscapeImage: `/placeholders/event_${concept.venue}_${s.conceptSlug}_${dateStr}_landscape.webp`,
        squareImage: `/placeholders/event_${concept.venue}_${s.conceptSlug}_${dateStr}_square.webp`,
        entryInfo: "Guest list and table entry. Original ID required at the door.",
        dressCode: "Elevated nightlife attire. See venue page for full dress code.",
        agePolicy: "21+. Original ID required.",
        // tableInfo intentionally omitted — shows "Contact Concierge"
        offerInfo: undefined,
        bookingCutoff: "9:00 PM Dubai time on event night",
        location: concept.venue === "avenue" ? avenueLoc : habtoorLoc,
        whatsappAction: "Contact Concierge",
        relatedEventIds: [],
        sample: true,
      });
    }
  }

  // Wire related events (same venue, next 2 occurrences).
  for (const ev of out) {
    ev.relatedEventIds = out
      .filter((o) => o.venue === ev.venue && o.id !== ev.id)
      .slice(0, 3)
      .map((o) => o.id);
  }

  return out;
}

const avenueLoc = {
  hotelName: "Shangri La Dubai",
  area: "Sheikh Zayed Road",
  floor: "Level 42",
  coordinates: { lat: 25.1865, lng: 55.2619 },
  entranceInstructions: "Enter through the main Shangri La Dubai lobby. Take the Avenue elevators to level 42.",
  valetParking: "Hotel valet available at the main entrance.",
  taxiInstructions: "Shangri La Dubai, Sheikh Zayed Road.",
  metroNote: "Metro walking time not published until verified.",
};

const habtoorLoc = {
  hotelName: "Hilton Dubai Al Habtoor City",
  area: "Al Habtoor City, Business Bay",
  floor: "Level 44",
  coordinates: { lat: 25.1885, lng: 55.2672 },
  entranceInstructions: "Enter through the main Hilton Dubai Al Habtoor City lobby. Take the nightclub elevators to level 44.",
  valetParking: "Hotel valet available at the main entrance.",
  taxiInstructions: "Hilton Dubai Al Habtoor City, Business Bay.",
  metroNote: "Metro walking time not published until verified.",
};

export const eventOccurrences: EventOccurrence[] = generateSampleOccurrences();

export function getTonightOccurrences(now: Date = new Date()): EventOccurrence[] {
  const tonight = getServiceDate(now);
  return eventOccurrences.filter((e) => e.serviceDate === tonight);
}

export function getUpcomingOccurrences(days = 7, now: Date = new Date()): EventOccurrence[] {
  const start = getServiceDate(new Date());
  const end = addDays(start, days - 1);
  return eventOccurrences.filter((e) => e.serviceDate >= start && e.serviceDate <= end);
}

export function getOccurrencesByVenue(venue: string): EventOccurrence[] {
  return eventOccurrences.filter((e) => e.venue === venue);
}

export function getOccurrence(id: string): EventOccurrence | undefined {
  return eventOccurrences.find((e) => e.id === id);
}
