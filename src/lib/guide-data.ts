/**
 * The Night Edit — Editorial Content
 * ----------------------------------
 * Visible name: "The Night Edit"
 * Search positioning: "Dubai Nightlife Guide"
 *
 * Launch articles per directive. Each article answers the main question
 * immediately, includes a reviewed date, links to venue pages and current
 * events, and avoids unsupported superlatives.
 *
 * SAMPLE content — fluent human review (especially Arabic) required before launch.
 */

import type { GuideArticle } from "./types";

export const guideArticles: GuideArticle[] = [
  {
    slug: "dubai-nightlife-guide-what-to-know",
    title: "Dubai Nightlife Guide: What to Know Before You Go",
    category: "Tonight and This Week",
    excerpt:
      "The practical starting point for a night out in Dubai — service days, ID rules, dress codes, arrival, and how to book the right venue.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Dubai nightlife runs on service days that do not reset at midnight. An event that starts at 11 PM and finishes at 4 AM belongs to the same night. Plan arrival, transport, and booking around the service date, not the calendar date.",
          "Bring original identification. The door team checks ID for every guest. Photocopies and digital IDs are not accepted.",
        ],
      },
      {
        heading: "Service days and the 6 AM boundary",
        paragraphs: [
          "A nightlife service date in Dubai resets at 6 AM local time. If you are out until 3 AM on Saturday, you are still on Friday night's service date for booking and event purposes.",
          "This matters for guest list cutoffs, table reservations, and event listings. Always confirm which service date your booking is attached to.",
        ],
      },
      {
        heading: "Dress code and door",
        paragraphs: [
          "Dubai nightclubs enforce an elevated dress code. Sportswear, flip flops, shorts, and beachwear are not accepted. Smart shoes are safest; clean sneakers are accepted on selected nights only.",
          "When in doubt, dress up rather than down. The door team's decision is final.",
        ],
      },
      {
        heading: "Booking a table vs the guest list",
        paragraphs: [
          "A guest list request gives you entry access, not a seat. A table reservation gives you a dedicated table, service, and a clear sightline of the room.",
          "For groups, birthdays, and celebrations, a table is the more reliable path. For a quick night out, the guest list can work if you arrive before the cutoff.",
        ],
      },
      {
        heading: "Getting there",
        paragraphs: [
          "Taxi and hotel transfer are the most reliable arrivals, especially after midnight. Metro service does not cover late nightlife hours, and walking times to venues are not always practical.",
          "Both Avenue (Shangri La Dubai, Sheikh Zayed Road) and Ora / Black Tape (Hilton Dubai Al Habtoor City, Business Bay) have hotel valet and dedicated nightclub entrances.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_dubai-nightlife-guide-what-to-know_cover.webp",
    ogImage: "/placeholders/article_dubai-nightlife-guide-what-to-know_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "arabic-and-khaleeji-nights-in-dubai",
    title: "Arabic and Khaleeji Nights in Dubai",
    category: "Arabic and Khaleeji",
    excerpt:
      "Where to find Arabic and Khaleeji nights in Dubai, what to expect from the crowd, and how Avenue and Ora approach the format differently.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Arabic and Khaleeji nights are the backbone of Dubai's club calendar. Avenue leads with Arabic and Khaleeji nights above Sheikh Zayed Road; Ora runs immersive Arabic nights above Al Habtoor City.",
          "Expect live percussion, resident Arabic DJs, and a crowd that knows the music. The energy is controlled and social rather than chaotic.",
        ],
      },
      {
        heading: "Avenue vs Ora for Arabic nights",
        paragraphs: [
          "Avenue's Arabic nights sit on level forty two of Shangri La Dubai. The room is built for the format — skyline context, controlled table flow, and resident DJs who hold the floor late.",
          "Ora's Arabic nights sit on level forty four of Hilton Dubai Al Habtoor City and layer an immersive visual system over the music. The projection and light respond to the set.",
          "Both rooms are Arabic-first. Choose Avenue for skyline and table culture; choose Ora for the immersive visual layer.",
        ],
      },
      {
        heading: "What to expect",
        paragraphs: [
          "Live percussion is common on key nights. Resident DJs mix Khaleeji, Arabic pop, and selected international crossover. The crowd tends to arrive after midnight and stay until close.",
          "Dress code is elevated. Tables are the preferred format for groups.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_arabic-and-khaleeji-nights-in-dubai_cover.webp",
    ogImage: "/placeholders/article_arabic-and-khaleeji-nights-in-dubai_og.jpg",
    relatedVenueSlugs: ["avenue", "ora"],
    hasArabicVersion: true,
  },
  {
    slug: "hip-hop-and-rnb-clubs-in-business-bay",
    title: "Hip Hop and R&B Clubs in Business Bay",
    category: "Hip Hop and R&B",
    excerpt:
      "Black Tape is the urban music room above Al Habtoor City. Here's how it works, what runs on which night, and how to book.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Black Tape, on level forty four of Hilton Dubai Al Habtoor City in Business Bay, is the clearest hip hop and R&B identity in the group. Monday is hip hop, Thursday is R&B, Friday is Afro and Dancehall, Saturday is the hip hop headline night.",
          "The room uses ink black, graphite, and cold white with restrained red accents. The music identity is the point — no filler formats.",
        ],
      },
      {
        heading: "How Black Tape differs from Ora",
        paragraphs: [
          "Black Tape and Ora share the same floor and hotel, but they are different rooms with different sound systems and different crowds. Black Tape is urban and sharp; Ora is Arabic and immersive.",
          "The door team directs guests to the correct room on arrival.",
        ],
      },
      {
        heading: "Booking a table",
        paragraphs: [
          "For hip hop nights, tables are the reliable format — the room fills early on headline nights. Request a VIP table through the group concierge and the correct venue team will confirm.",
          "Guest list access is available but subject to the nightly cutoff.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_hip-hop-and-rnb-clubs-in-business-bay_cover.webp",
    ogImage: "/placeholders/article_hip-hop-and-rnb-clubs-in-business-bay_og.jpg",
    relatedVenueSlugs: ["blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "how-vip-table-booking-works-in-dubai",
    title: "How VIP Table Booking Works in Dubai",
    category: "VIP and Tables",
    excerpt:
      "The difference between guest list, standard tables, premium tables, and stage tables — and what to expect from each.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Dubai nightclub tables run on minimum spend, not a fixed table price. You commit to a minimum spend for the night; the table, the location, and the service are built around that commitment.",
          "Minimum spends are venue, night, and table specific. Only verified minimum spends are ever published. If a figure is not shown, contact the concierge for the current figure.",
        ],
      },
      {
        heading: "Table types",
        paragraphs: [
          "Guest list: entry access only, no seat. Arrive before the cutoff.",
          "Standard table: a dedicated table in the main room with full service.",
          "Premium table: a better sightline, usually closer to the DJ or stage, with higher minimum spend.",
          "Stage or DJ area table: the closest table to the action. Limited availability.",
          "Private or corporate request: full or partial buyout enquiries for celebrations and brand events.",
        ],
      },
      {
        heading: "The booking flow",
        paragraphs: [
          "Submit a VIP request with your venue, date, party size, and arrival time. The concierge confirms availability, minimum spend, and table location. You receive a booking reference.",
          "On the night, present your reference at the table host line for fast entry.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_how-vip-table-booking-works-in-dubai_cover.webp",
    ogImage: "/placeholders/article_how-vip-table-booking-works-in-dubai_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "dubai-nightclub-dress-code-and-original-id-guide",
    title: "Dubai Nightclub Dress Code and Original ID Guide",
    category: "Dress and Door",
    excerpt:
      "What to wear, what to bring, and what gets turned away at the door of Dubai nightclubs.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Bring original identification — passport, UAE driving licence, or UAE national ID. Photocopies and digital IDs are not accepted.",
          "Dress elevated. Sportswear, flip flops, shorts, and beachwear are not accepted. Smart shoes are safest.",
        ],
      },
      {
        heading: "Accepted ID",
        paragraphs: [
          "Original Passport.",
          "Original UAE Driving Licence.",
          "Original UAE National ID (residents only).",
          "The door team verifies ID for every guest, every night.",
        ],
      },
      {
        heading: "Dress code by venue",
        paragraphs: [
          "Avenue: elegant smart. Tailored separates, dresses, smart shoes. Clean sneakers on selected nights only.",
          "Ora: elevated evening. Refined nightlife attire.",
          "Black Tape: urban elevated. Sharp, considered street-to-evening. Clean sneakers accepted.",
          "When in doubt, dress up. The door team's decision is final.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_dubai-nightclub-dress-code-and-original-id-guide_cover.webp",
    ogImage: "/placeholders/article_dubai-nightclub-dress-code-and-original-id-guide_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "nightlife-at-al-habtoor-city",
    title: "Nightlife at Al Habtoor City",
    category: "Areas and Hotels",
    excerpt:
      "Hilton Dubai Al Habtoor City is home to Ora and Black Tape on level forty four. Arrival, valet, and what to expect.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Hilton Dubai Al Habtoor City in Business Bay houses two of the group's venues on level forty four: Ora (Arabic, immersive) and Black Tape (hip hop, R&B, Afro).",
          "Enter through the main lobby. The nightclub elevator bank is signposted. Both rooms share the same floor; the door team directs you to the correct room.",
        ],
      },
      {
        heading: "Arrival",
        paragraphs: [
          "Taxi and hotel transfer are the most reliable arrivals. Hotel valet is available at the main entrance. Self-parking is in the basement.",
          "Drop off is at the main lobby portico. From there, follow signage to the nightclub elevators to level forty four.",
        ],
      },
      {
        heading: "Which room tonight",
        paragraphs: [
          "If you want Arabic, Khaleeji, international, or immersive visuals, head to Ora.",
          "If you want hip hop, R&B, Afro, or Dancehall, head to Black Tape.",
          "Check the tonight status before you leave — both rooms run on different weekly schedules.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_nightlife-at-al-habtoor-city_cover.webp",
    ogImage: "/placeholders/article_nightlife-at-al-habtoor-city_og.jpg",
    relatedVenueSlugs: ["ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "nightlife-on-sheikh-zayed-road",
    title: "Nightlife on Sheikh Zayed Road",
    category: "Areas and Hotels",
    excerpt:
      "Avenue sits on level forty two of Shangri La Dubai on Sheikh Zayed Road. Here's how to plan the night.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Shangri La Dubai on Sheikh Zayed Road is home to Avenue on level forty two. The room looks straight down the road toward the Burj Khalifa skyline.",
          "Avenue leads with Arabic and Khaleeji nights, with selected urban concepts through the week.",
        ],
      },
      {
        heading: "Arrival",
        paragraphs: [
          "Taxi is the most reliable arrival. Hotel valet is available at the main entrance. Self-parking is in the basement.",
          "From the lobby, take the dedicated Avenue elevators to level forty two.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_nightlife-on-sheikh-zayed-road_cover.webp",
    ogImage: "/placeholders/article_nightlife-on-sheikh-zayed-road_og.jpg",
    relatedVenueSlugs: ["avenue"],
    hasArabicVersion: true,
  },
  {
    slug: "where-to-go-out-near-burj-khalifa",
    title: "Where to Go Out Near Burj Khalifa",
    category: "Areas and Hotels",
    excerpt:
      "The closest group venues to Burj Khalifa, how to move between Downtown and the venues, and what to book.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Avenue at Shangri La Dubai is the closest group venue to the Burj Khalifa skyline, sitting on Sheikh Zayed Road with direct views from level forty two.",
          "Ora and Black Tape at Hilton Dubai Al Habtoor City are a short taxi ride from Downtown, in Business Bay.",
        ],
      },
      {
        heading: "Moving between Downtown and the venues",
        paragraphs: [
          "Taxi is the most reliable option, especially after midnight. Allow time for weekend traffic around Downtown and Business Bay.",
          "Hotel transfers can be arranged through your hotel concierge.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_where-to-go-out-near-burj-khalifa_cover.webp",
    ogImage: "/placeholders/article_where-to-go-out-near-burj-khalifa_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "monday-nightlife-in-dubai",
    title: "Monday Nightlife in Dubai",
    category: "Tonight and This Week",
    excerpt:
      "Monday runs urban at Avenue and hip hop at Black Tape. How to choose and what to book.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Monday is an active nightlife night in Dubai. Avenue runs Urban Project; Black Tape runs its Monday hip hop concept.",
          "Choose Avenue for urban and international crossover; choose Black Tape for hip hop and R&B.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_monday-nightlife-in-dubai_cover.webp",
    ogImage: "/placeholders/article_monday-nightlife-in-dubai_og.jpg",
    relatedVenueSlugs: ["avenue", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "wednesday-nightlife-in-dubai",
    title: "Wednesday Nightlife in Dubai",
    category: "Tonight and This Week",
    excerpt:
      "Wednesday opens the Arabic week at Avenue and Ora. How to plan the midweek night.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Wednesday is the start of the Arabic nightlife week. Avenue runs Arabic Night; Ora runs Ora Arabic.",
          "Both rooms are Arabic-first on Wednesday. Choose by location and visual preference.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_wednesday-nightlife-in-dubai_cover.webp",
    ogImage: "/placeholders/article_wednesday-nightlife-in-dubai_og.jpg",
    relatedVenueSlugs: ["avenue", "ora"],
    hasArabicVersion: true,
  },
  {
    slug: "planning-a-birthday-night-in-dubai",
    title: "Planning a Birthday Night in Dubai",
    category: "Celebrations",
    excerpt:
      "How to plan a birthday at a Dubai nightclub — table booking, group size, arrival, and what the venue needs from you.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "For a birthday, book a table, not the guest list. A dedicated table gives the group a home base, service, and a clear spot for any cake or celebration moment.",
          "Submit a celebrations request with the venue, date, party size, and occasion. The concierge confirms the table, any inclusions, and the arrival plan.",
        ],
      },
      {
        heading: "What to confirm in advance",
        paragraphs: [
          "Party size and table capacity.",
          "Arrival time — earlier is better for birthdays.",
          "Any cake, decoration, or presentation request.",
          "Promoter or concierge code if you have one.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_planning-a-birthday-night-in-dubai_cover.webp",
    ogImage: "/placeholders/article_planning-a-birthday-night-in-dubai_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "planning-a-bachelorette-night-in-dubai",
    title: "Planning a Bachelorette Night in Dubai",
    category: "Celebrations",
    excerpt:
      "Bachelorette nights work best with a premium table and a clear arrival plan. Here's how to set it up.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Book a premium table for a bachelorette. The better sightline and dedicated service make the night. Confirm the table location relative to the DJ or stage when you book.",
          "Arrive early, before the room peaks, so the group settles in before the crowd builds.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_planning-a-bachelorette-night-in-dubai_cover.webp",
    ogImage: "/placeholders/article_planning-a-bachelorette-night-in-dubai_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
  {
    slug: "avenue-ora-or-black-tape-which-venue",
    title: "Avenue, Ora, or Black Tape: Which Venue Fits Your Night?",
    category: "Venue Notes",
    excerpt:
      "A direct comparison of the three venues — sound, location, mood, and the night each one is built for.",
    body: [
      {
        heading: "The short answer",
        paragraphs: [
          "Avenue: Arabic and Khaleeji nights with selected urban concepts. Sheikh Zayed Road, level forty two. Skyline views, controlled table culture.",
          "Ora: Arabic, Khaleeji, international, and house. Immersive visual system. Al Habtoor City, level forty four.",
          "Black Tape: hip hop, R&B, Afro, Dancehall. Sharp urban identity. Al Habtoor City, level forty four (same floor as Ora, different room).",
        ],
      },
      {
        heading: "Choose by sound",
        paragraphs: [
          "Arabic and Khaleeji first: Avenue or Ora.",
          "International and house: Ora.",
          "Hip hop and R&B: Black Tape.",
          "Afro and Dancehall: Black Tape.",
        ],
      },
      {
        heading: "Choose by location",
        paragraphs: [
          "Sheikh Zayed Road / closer to Burj Khalifa: Avenue.",
          "Business Bay / Al Habtoor City: Ora or Black Tape.",
        ],
      },
      {
        heading: "Use the venue matcher",
        paragraphs: [
          "Still unsure? Use the Find My Venue matcher on the homepage. Answer a few questions and it ranks the live events and venues that fit your night.",
        ],
      },
    ],
    reviewedDate: "2025-01-15",
    coverImage: "/placeholders/article_avenue-ora-or-black-tape-which-venue_cover.webp",
    ogImage: "/placeholders/article_avenue-ora-or-black-tape-which-venue_og.jpg",
    relatedVenueSlugs: ["avenue", "ora", "blacktape"],
    hasArabicVersion: true,
  },
];

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return guideArticles.find((a) => a.slug === slug);
}

export const guideCategories: GuideArticle["category"][] = [
  "Tonight and This Week",
  "Arabic and Khaleeji",
  "Hip Hop and R&B",
  "VIP and Tables",
  "Dress and Door",
  "Areas and Hotels",
  "Celebrations",
  "Artist Stories",
  "Venue Notes",
];
