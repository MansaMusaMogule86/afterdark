/**
 * W W Nightlife Dubai — Central Site Configuration
 * --------------------------------------------------
 * This is the SINGLE source of truth for parent group identity, venue records,
 * contact details, social profiles, and operational mode flags.
 *
 * The permanent group name can be replaced here instantly.
 * Logo references are clearly labelled placeholders until the real group
 * identity is supplied.
 *
 * IMPORTANT: Per directive, phone numbers, emails, opening hours, prices,
 * entry fees, and minimum spends are NOT hardcoded as verified facts.
 * They are stored as `pending_verification` until the owner confirms them.
 */

export type VenueEntityMode =
  | "separate_rooms"
  | "shared_room_event_brands"
  | "alternating_concepts"
  | "pending_verification";

export interface SiteConfig {
  /** Temporary parent name. Replace instantly when permanent name is confirmed. */
  parentName: string;
  parentShortName: string;
  /** Brand promise line. */
  promise: string;
  /** Eyebrow shown above hero heading. */
  eyebrow: string;
  heroHeading: string;
  heroSupporting: string;
  /** Primary / secondary hero CTAs. */
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  /** Entity resolution mode for Ora + Black Tape (same floor/hotel). */
  venueEntityMode: VenueEntityMode;
  /** Locale config. */
  defaultLocale: "en";
  locales: ("en" | "ar")[];
  /** Nightlife service day boundary (Dubai time). 6:00 AM = boundary. */
  serviceDayBoundaryHour: number; // 6
  timezone: "Asia/Dubai";
  /** SEO defaults. */
  seo: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultOgImage: string;
    siteUrl: string; // placeholder
  };
  /** Contact (placeholder until verified). */
  contact: {
    whatsappPlaceholder: string; // shown as "Contact Concierge" until verified
    phoneStatus: "pending_verification";
    emailStatus: "pending_verification";
  };
  /** Social profiles (placeholders). */
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
    youtube: string;
  };
  /** Asset strict mode (dev = placeholders allowed; prod launch = required assets fail). */
  assetStrictMode: boolean;
}

export const siteConfig: SiteConfig = {
  parentName: "AFTER MIDNIGHT DXB",
  parentShortName: "After Midnight",
  promise: "Three venues. Two skyline addresses. One Dubai after dark.",
  eyebrow: "Avenue. Ora. Black Tape.",
  heroHeading: "Three venues. Two skyline addresses. One Dubai after dark.",
  heroSupporting:
    "See what is live tonight, choose the sound that fits you, and reserve through one direct nightlife concierge.",
  primaryAction: { label: "See Tonight", href: "#tonight" },
  secondaryAction: { label: "Find My Venue", href: "#find-my-venue" },
  venueEntityMode: "pending_verification",
  defaultLocale: "en",
  locales: ["en", "ar"],
  serviceDayBoundaryHour: 6,
  timezone: "Asia/Dubai",
  seo: {
    siteName: "AFTER MIDNIGHT DXB",
    defaultTitle: "Dubai Nightlife Events and VIP Tables | AFTER MIDNIGHT DXB",
    defaultDescription:
      "Discover and reserve the right Dubai night across three distinct venues — Avenue, Ora, and Black Tape. See what is live tonight, compare venues, and book VIP tables through one direct nightlife concierge.",
    defaultOgImage: "/placeholders/global_og_default.jpg",
    siteUrl: "https://after-midnight-dxb.example",
  },
  contact: {
    whatsappPlaceholder: "Contact Concierge",
    phoneStatus: "pending_verification",
    emailStatus: "pending_verification",
  },
  social: {
    instagram: "#",
    tiktok: "#",
    facebook: "#",
    youtube: "#",
  },
  assetStrictMode: false,
};

/**
 * Positioning — must NOT lead with "best nightclub in Dubai".
 * The platform is positioned as the most direct way to discover and reserve
 * the right Dubai night across three distinct venues.
 */
export const positioning =
  "The most direct way to discover and reserve the right Dubai night across three distinct venues.";
