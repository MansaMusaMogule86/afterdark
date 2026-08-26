/**
 * Core domain types for W W Nightlife Dubai.
 * Mirrors the NightOps OS source-of-truth model so the typed mock adapter
 * and the future production adapter share an identical interface.
 */

export type VenueSlug = "avenue" | "ora" | "blacktape";

export type MusicGenre =
  | "arabic"
  | "khaleeji"
  | "hiphop"
  | "rnb"
  | "afro"
  | "dancehall"
  | "house"
  | "international"
  | "urban";

export type EventStatus =
  | "draft"
  | "scheduled"
  | "live"
  | "sold_out"
  | "postponed"
  | "cancelled"
  | "completed";

export type TableTypeSlug =
  | "guest_list"
  | "standard_table"
  | "premium_table"
  | "stage_dj_table"
  | "private_corporate";

export interface VenueTheme {
  /** Base background (near-black). */
  bg: string;
  /** Surface / card. */
  surface: string;
  /** Primary brand color. */
  primary: string;
  /** Accent / metallic. */
  accent: string;
  /** Foreground text. */
  foreground: string;
  /** Muted foreground. */
  muted: string;
}

export interface VenueLocation {
  hotelName: string;
  area: string;
  floor: string;
  /** Working coordinates — require owner verification. */
  coordinates: { lat: number; lng: number };
  entranceInstructions: string;
  valetParking: string;
  taxiInstructions: string;
  metroNote: string; // intentionally cautious — no unverified metro walking times
}

export interface DressCode {
  summary: string;
  accepted: string[];
  notAccepted: string[];
}

export interface AgePolicy {
  minimumAge: number;
  idRequired: string[];
  notes: string;
}

export interface EntryPolicy {
  summary: string;
  guestList: string;
  tableGuests: string;
  hotelGuests: string;
}

export interface OpeningHour {
  day: string; // "Mon", "Tue"...
  label: string; // "Arabic Night", "Urban Project" etc.
  status: "open" | "closed" | "pending_verification";
  doors?: string; // "11:00 PM"
  close?: string; // "4:00 AM"
}

export interface VenueRecord {
  slug: VenueSlug;
  name: string;
  shortName: string;
  /** Music identity headline. */
  musicIdentity: string;
  /** Music genres. */
  genres: MusicGenre[];
  /** Hero heading for venue page. */
  heading: string;
  /** Supporting idea. */
  supportingIdea: string;
  /** Long description — unique per venue. */
  description: string[];
  /** Signature night concepts. */
  signatureConcepts: { name: string; description: string }[];
  /** Location. */
  location: VenueLocation;
  /** Dress code. */
  dressCode: DressCode;
  /** Age policy. */
  agePolicy: AgePolicy;
  /** Entry policy. */
  entryPolicy: EntryPolicy;
  /** Opening hours (pending verification). */
  openingHours: OpeningHour[];
  /** Visual theme. */
  theme: VenueTheme;
  /** Logo references (placeholders). */
  logoLight: string;
  logoDark: string;
  /** Required hero assets. */
  heroDesktop: string;
  heroMobile: string;
  heroVideo?: string;
  /** Gallery placeholders. */
  gallery: string[];
  /** Floor plan placeholder. */
  floorplan: string;
  /** Social sharing image. */
  ogImage: string;
  /** SEO title. */
  seoTitle: string;
  seoDescription: string;
  /** Verification status. */
  factsVerified: boolean;
}

export interface EventConcept {
  slug: string;
  name: string;
  venue: VenueSlug;
  description: string;
  music: MusicGenre[];
  recurring: boolean;
}

export interface EventOccurrence {
  id: string;
  conceptSlug: string;
  title: string;
  venue: VenueSlug;
  /** ISO date (Dubai service date). */
  serviceDate: string; // YYYY-MM-DD
  startTime: string; // "11:00 PM"
  endTime: string; // "4:00 AM"
  timezone: "Asia/Dubai";
  status: EventStatus;
  music: MusicGenre[];
  artist?: string;
  description: string;
  poster: string;
  landscapeImage: string;
  squareImage: string;
  entryInfo: string;
  dressCode: string;
  agePolicy: string;
  /** Table info — only show when verified. */
  tableInfo?: {
    minSpend?: string; // only when verified
    capacity?: string;
  };
  offerInfo?: string;
  bookingCutoff?: string;
  location: VenueLocation;
  whatsappAction: string;
  relatedEventIds: string[];
  /** Sample data flag. */
  sample: boolean;
}

export interface GuideArticle {
  slug: string;
  title: string;
  category: GuideCategory;
  excerpt: string;
  /** Body sections. */
  body: { heading: string; paragraphs: string[] }[];
  reviewedDate: string;
  coverImage: string;
  ogImage: string;
  relatedVenueSlugs: VenueSlug[];
  /** Arabic version available. */
  hasArabicVersion: boolean;
}

export type GuideCategory =
  | "Tonight and This Week"
  | "Arabic and Khaleeji"
  | "Hip Hop and R&B"
  | "VIP and Tables"
  | "Dress and Door"
  | "Areas and Hotels"
  | "Celebrations"
  | "Artist Stories"
  | "Venue Notes";

export interface VipBookingLead {
  reference: string;
  venue: VenueSlug | "any";
  eventOrDate: string;
  partySize: number;
  arrivalTime: string;
  tablePreference: TableTypeSlug;
  budgetRange: string;
  occasion: string;
  specialRequirements?: string;
  hotelGuest: boolean;
  transportRequest?: string;
  fullName: string;
  whatsappNumber: string;
  email: string;
  promoterCode?: string;
  conciergeCode?: string;
  marketingConsent: boolean;
  /** Attribution. */
  firstReferrer?: string;
  lastReferrer?: string;
  campaign?: string;
  createdAt: string;
  status: "new";
}

export interface TrackableEvent {
  name: string;
  params: Record<string, string | number | boolean | undefined>;
}
