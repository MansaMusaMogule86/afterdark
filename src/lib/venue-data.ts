/**
 * Venue Records — ABOVE MIDNIGHT DXB
 * -----------------------------------
 * SAMPLE / WORKING DATA — clearly labelled. All phone numbers, emails,
 * opening hours, prices, minimum spends, and event schedules require
 * owner verification before production launch (see venueFactsVerified flag).
 *
 * Entity resolution note: Ora and Black Tape currently appear online as
 * separate clubs using the same floor and hotel. venueEntityMode is
 * `pending_verification` until confirmed.
 */

import type { VenueRecord } from "./types";

export const venues: VenueRecord[] = [
  {
    slug: "avenue",
    name: "Avenue Club Dubai",
    shortName: "Avenue",
    musicIdentity: "Arabic and Khaleeji nights with selected urban concepts.",
    genres: ["arabic", "khaleeji", "urban", "international"],
    heading: "Forty two floors above the ordinary.",
    supportingIdea:
      "Arabic and Khaleeji nights meet selected urban concepts above Sheikh Zayed Road.",
    description: [
      "Avenue sits on level forty two of Shangri La Dubai, looking straight down Sheikh Zayed Road toward the Burj Khalifa skyline. The room was built for Arabic and Khaleeji nights, with selected urban concepts layered through the week.",
      "The crowd comes for the music first. Resident DJs and live Arabic performers hold the floor late, while elevated table service keeps the energy controlled rather than crowded.",
      "Avenue is the calmer of the three venues on a quiet night, and the loudest room in the city on the right one.",
    ],
    signatureConcepts: [
      { name: "Arabic Night", description: "Resident Arabic and Khaleeji sets with live percussion." },
      { name: "Urban Project", description: "Selected urban and international concepts on recurring nights." },
      { name: "Bad Habits", description: "A late, darker concept for the after-midnight crowd." },
    ],
    location: {
      hotelName: "Shangri La Dubai",
      area: "Sheikh Zayed Road",
      floor: "Level 42",
      coordinates: { lat: 25.1865, lng: 55.2619 },
      entranceInstructions:
        "Enter through the main Shangri La Dubai lobby on Sheikh Zayed Road. Take the dedicated Avenue elevators to level forty two. Hotel valet can direct you to the nightclub lift bank.",
      valetParking: "Hotel valet parking is available at the main entrance. Self-parking is in the basement; take the lift to the lobby then transfer to the Avenue elevators.",
      taxiInstructions: "Ask the driver for Shangri La Dubai on Sheikh Zayed Road. Drop off is at the main lobby portico.",
      metroNote: "Metro walking time is not published until verified. Use taxi or hotel transfer for the most reliable arrival.",
    },
    dressCode: {
      summary: "Elegant smart. Elevated nightlife attire.",
      accepted: ["Tailored separates", "Dresses and elegant evening wear", "Smart shoes", "Clean sneakers (selected nights only)"],
      notAccepted: ["Sportswear", "Flip flops", "Shorts", "Beachwear", "Sports team jerseys"],
    },
    agePolicy: {
      minimumAge: 21,
      idRequired: ["Original Passport", "Original UAE Driving Licence", "Original National ID (UAE residents only)"],
      notes: "Photocopies and digital IDs are not accepted. The door team verifies original identification for every guest.",
    },
    entryPolicy: {
      summary: "Guest list, table, and hotel guest entry. Walk-ins are subject to capacity.",
      guestList: "Guest list requests close at a set cutoff each night. Arrive before the stated time to guarantee entry.",
      tableGuests: "Table guests enter through the dedicated table host line.",
      hotelGuests: "Shangri La in-house guests receive priority entry subject to capacity and dress code.",
    },
    openingHours: [
      { day: "Mon", label: "Urban Project", status: "pending_verification" },
      { day: "Tue", label: "Closed", status: "closed" },
      { day: "Wed", label: "Arabic Night", status: "pending_verification" },
      { day: "Thu", label: "Arabic Night", status: "pending_verification" },
      { day: "Fri", label: "Arabic Night", status: "pending_verification" },
      { day: "Sat", label: "Urban Project", status: "pending_verification" },
      { day: "Sun", label: "Closed", status: "closed" },
    ],
    theme: {
      bg: "#050507",
      surface: "#0E0A0C",
      primary: "#86142A",
      accent: "#D2AF69",
      foreground: "#F5EFE6",
      muted: "#9A8A82",
    },
    logoLight: "/placeholders/avenue_logo_light.svg",
    logoDark: "/placeholders/avenue_logo_dark.svg",
    heroDesktop: "/venues/avenue/primary-2.webp",
    heroMobile: "/venues/avenue/primary-2.webp",
    heroVideo: "/placeholders/avenue_hero_video.mp4",
    gallery: [
      "/venues/avenue/primary-2.webp",
      "/placeholders/avenue_gallery_02.webp",
      "/placeholders/avenue_gallery_03.webp",
      "/placeholders/avenue_gallery_04.webp",
      "/placeholders/avenue_gallery_05.webp",
      "/placeholders/avenue_gallery_06.webp",
    ],
    floorplan: "/placeholders/avenue_floorplan.svg",
    ogImage: "/placeholders/avenue_og.jpg",
    seoTitle: "Avenue Club Dubai | Arabic and Urban Nights at Shangri La",
    seoDescription:
      "Avenue Club Dubai — Arabic and Khaleeji nights with selected urban concepts on level forty two of Shangri La Dubai, Sheikh Zayed Road. See tonight's status, upcoming events, and request a VIP table.",
    factsVerified: false,
  },
  {
    slug: "ora",
    name: "Ora Club Dubai",
    shortName: "Ora",
    musicIdentity: "Arabic, Khaleeji, international music, immersive visuals, premium table culture.",
    genres: ["arabic", "khaleeji", "international", "house"],
    heading: "A room built to move with the night.",
    supportingIdea:
      "Immersive visuals, Arabic energy, and premium late night events above Al Habtoor City.",
    description: [
      "Ora occupies level forty four of Hilton Dubai Al Habtoor City, inside the same floor footprint as Black Tape. The room is built around an immersive visual system — projection, light, and circular motifs that respond to the music.",
      "The sound leans Arabic and Khaleeji first, opening out to international and house sets through the night. The table culture is deliberately premium: clear sightlines, controlled flow, and service that stays out of the way of the room.",
      "Ora is the room that feels engineered for movement — visuals, light, and crowd working as one system.",
    ],
    signatureConcepts: [
      { name: "Ora Arabic", description: "Resident Arabic and Khaleeji sets with immersive projection." },
      { name: "Ora International", description: "International and house sets through the second half of the night." },
      { name: "Ora Late", description: "After 2 AM concept for the room that stays until close." },
    ],
    location: {
      hotelName: "Hilton Dubai Al Habtoor City",
      area: "Al Habtoor City, Business Bay",
      floor: "Level 44",
      coordinates: { lat: 25.1885, lng: 55.2672 },
      entranceInstructions:
        "Enter through the main Hilton Dubai Al Habtoor City lobby. The nightclub elevator bank is signposted from the lobby. Take the lift to level forty four.",
      valetParking: "Hotel valet parking is available at the main entrance. Self-parking is available in the hotel basement.",
      taxiInstructions: "Ask the driver for Hilton Dubai Al Habtoor City, Business Bay. Drop off is at the main lobby portico.",
      metroNote: "Metro walking time is not published until verified. Use taxi or hotel transfer.",
    },
    dressCode: {
      summary: "Elevated evening. Refined nightlife attire.",
      accepted: ["Elegant evening wear", "Tailored separates", "Dresses", "Smart shoes"],
      notAccepted: ["Sportswear", "Flip flops", "Shorts", "Beachwear", "Sports team jerseys"],
    },
    agePolicy: {
      minimumAge: 21,
      idRequired: ["Original Passport", "Original UAE Driving Licence", "Original National ID (UAE residents only)"],
      notes: "Original identification is required at the door. Digital copies are not accepted.",
    },
    entryPolicy: {
      summary: "Guest list, table, and hotel guest entry. Walk-ins subject to capacity.",
      guestList: "Guest list requests close at a set cutoff. Arrive before the stated time.",
      tableGuests: "Table guests use the dedicated table host line.",
      hotelGuests: "Hilton in-house guests receive priority entry subject to capacity and dress code.",
    },
    openingHours: [
      { day: "Mon", label: "Closed", status: "closed" },
      { day: "Tue", label: "Closed", status: "closed" },
      { day: "Wed", label: "Ora Arabic", status: "pending_verification" },
      { day: "Thu", label: "Ora Arabic", status: "pending_verification" },
      { day: "Fri", label: "Ora Arabic", status: "pending_verification" },
      { day: "Sat", label: "Ora International", status: "pending_verification" },
      { day: "Sun", label: "Closed", status: "closed" },
    ],
    theme: {
      bg: "#031A17",
      surface: "#062824",
      primary: "#006B58",
      accent: "#C7A66A",
      foreground: "#EAF3F0",
      muted: "#7E9C93",
    },
    logoLight: "/placeholders/ora_logo_light.svg",
    logoDark: "/placeholders/ora_logo_dark.svg",
    heroDesktop: "/venues/ora/ora_hero_desktop.webp",
    heroMobile: "/venues/ora/ora_hero_desktop.webp",
    heroVideo: "/placeholders/ora_hero_video.mp4",
    gallery: [
      "/venues/ora/ora_hero_desktop.webp",
      "/placeholders/ora_gallery_02.webp",
      "/placeholders/ora_gallery_03.webp",
      "/placeholders/ora_gallery_04.webp",
      "/placeholders/ora_gallery_05.webp",
      "/placeholders/ora_gallery_06.webp",
    ],
    floorplan: "/placeholders/ora_floorplan.svg",
    ogImage: "/placeholders/ora_og.jpg",
    seoTitle: "Ora Club Dubai | Arabic Nights at Hilton Al Habtoor City",
    seoDescription:
      "Ora Club Dubai — immersive visuals, Arabic energy, and premium late night events on level forty four of Hilton Dubai Al Habtoor City. See tonight's status, upcoming events, and request a VIP table.",
    factsVerified: false,
  },
  {
    slug: "blacktape",
    name: "Black Tape Club Dubai",
    shortName: "Black Tape",
    musicIdentity: "Hip hop, R&B, Afro, Dancehall, and urban music.",
    genres: ["hiphop", "rnb", "afro", "dancehall", "urban"],
    heading: "Hip hop. R&B. Afro. No filler.",
    supportingIdea:
      "A darker urban experience with a clear music identity and direct VIP access.",
    description: [
      "Black Tape shares level forty four of Hilton Dubai Al Habtoor City with Ora, but the room is a different world. Where Ora is immersive and Arabic, Black Tape is sharp, urban, and built around hip hop, R&B, Afro, and Dancehall.",
      "The room uses ink black, graphite, and cold white with restrained red accents. Strong typography, sharp cropping, minimal visual noise. The music identity is the clearest of the three venues — no filler formats.",
      "Black Tape is the venue for guests who want a defined urban night, direct VIP access, and a crowd that came for the sound.",
    ],
    signatureConcepts: [
      { name: "Black Tape Hip Hop", description: "Resident hip hop and R&B sets." },
      { name: "Black Tape Afro", description: "Afro, Afrobeats, and Dancehall concept nights." },
      { name: "Black Tape Late", description: "After midnight concept carrying the room to close." },
    ],
    location: {
      hotelName: "Hilton Dubai Al Habtoor City",
      area: "Al Habtoor City, Business Bay",
      floor: "Level 44",
      coordinates: { lat: 25.1885, lng: 55.2672 },
      entranceInstructions:
        "Enter through the main Hilton Dubai Al Habtoor City lobby. The nightclub elevator bank is signposted from the lobby. Take the lift to level forty four. Black Tape and Ora share the same floor; the door team directs guests to the correct room.",
      valetParking: "Hotel valet parking is available at the main entrance. Self-parking is available in the hotel basement.",
      taxiInstructions: "Ask the driver for Hilton Dubai Al Habtoor City, Business Bay. Drop off is at the main lobby portico.",
      metroNote: "Metro walking time is not published until verified. Use taxi or hotel transfer.",
    },
    dressCode: {
      summary: "Urban elevated. Sharp, considered street-to-evening.",
      accepted: ["Elevated streetwear", "Tailored urban looks", "Clean sneakers", "Smart separates"],
      notAccepted: ["Sportswear", "Flip flops", "Beachwear", "Sports team jerseys"],
    },
    agePolicy: {
      minimumAge: 21,
      idRequired: ["Original Passport", "Original UAE Driving Licence", "Original National ID (UAE residents only)"],
      notes: "Original identification is required at the door. Digital copies are not accepted.",
    },
    entryPolicy: {
      summary: "Guest list, table, and hotel guest entry. Walk-ins subject to capacity.",
      guestList: "Guest list requests close at a set cutoff. Arrive before the stated time.",
      tableGuests: "Table guests use the dedicated table host line.",
      hotelGuests: "Hilton in-house guests receive priority entry subject to capacity and dress code.",
    },
    openingHours: [
      { day: "Mon", label: "Black Tape Hip Hop", status: "pending_verification" },
      { day: "Tue", label: "Closed", status: "closed" },
      { day: "Wed", label: "Closed", status: "closed" },
      { day: "Thu", label: "Black Tape R&B", status: "pending_verification" },
      { day: "Fri", label: "Black Tape Afro", status: "pending_verification" },
      { day: "Sat", label: "Black Tape Hip Hop", status: "pending_verification" },
      { day: "Sun", label: "Closed", status: "closed" },
    ],
    theme: {
      bg: "#050505",
      surface: "#171717",
      primary: "#E8E8E8",
      accent: "#C01818",
      foreground: "#F4F4F4",
      muted: "#8A8A8A",
    },
    logoLight: "/placeholders/black_tape_logo_light.svg",
    logoDark: "/placeholders/black_tape_logo_dark.svg",
    heroDesktop: "/venues/blacktape/black_tape_hero_desktop.webp",
    heroMobile: "/venues/blacktape/black_tape_hero_mobile.webp",
    heroVideo: "/venues/blacktape/TAPE-Generic-1-1080x1080-1.mp4",
    gallery: [
      "/venues/blacktape/black_tape_hero_desktop.webp",
      "/placeholders/black_tape_gallery_02.webp",
      "/placeholders/black_tape_gallery_03.webp",
      "/placeholders/black_tape_gallery_04.webp",
      "/placeholders/black_tape_gallery_05.webp",
      "/placeholders/black_tape_gallery_06.webp",
    ],
    floorplan: "/placeholders/black_tape_floorplan.svg",
    ogImage: "/placeholders/black_tape_og.jpg",
    seoTitle: "Black Tape Dubai | Hip Hop and R&B Club in Business Bay",
    seoDescription:
      "Black Tape Dubai — hip hop, R&B, Afro, and Dancehall on level forty four of Hilton Dubai Al Habtoor City, Business Bay. See tonight's status, upcoming events, and request a VIP table.",
    factsVerified: false,
  },
];

export function getVenue(slug: string): VenueRecord | undefined {
  return venues.find((v) => v.slug === slug);
}

export const locationRecords = [
  {
    slug: "shangrila" as const,
    hotelName: "Shangri La Dubai",
    area: "Sheikh Zayed Road",
    venues: ["avenue"] as const,
    arrivalImage: "/placeholders/shangri_la_arrival.webp",
    lobbyImage: "/placeholders/shangri_la_lobby.webp",
    mapImage: "/placeholders/shangri_la_map.webp",
    description:
      "Shangri La Dubai sits on Sheikh Zayed Road with direct skyline views toward Burj Khalifa. Avenue operates on level forty two.",
    coordinates: { lat: 25.1865, lng: 55.2619 },
  },
  {
    slug: "habtoor" as const,
    hotelName: "Hilton Dubai Al Habtoor City",
    area: "Al Habtoor City, Business Bay",
    venues: ["ora", "blacktape"] as const,
    arrivalImage: "/placeholders/hilton_habtoor_arrival.webp",
    lobbyImage: "/placeholders/hilton_habtoor_lobby.webp",
    mapImage: "/placeholders/hilton_habtoor_map.webp",
    description:
      "Hilton Dubai Al Habtoor City in Al Habtoor City, Business Bay. Ora and Black Tape share level forty four.",
    coordinates: { lat: 25.1885, lng: 55.2672 },
  },
];
