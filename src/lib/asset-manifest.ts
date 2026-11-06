/**
 * Asset Manifest — required assets for production launch.
 * Used by the internal /asset_manifest view (excluded from indexing & sitemap).
 *
 * Each entry records: required asset, expected path, purpose, dimensions,
 * crop, present/missing status, venue, page usage.
 *
 * ASSET_STRICT_MODE (siteConfig.assetStrictMode):
 * - dev/false: missing assets render designed placeholders.
 * - prod/true: required hero and logo assets FAIL the launch check.
 */

export interface AssetManifestEntry {
  id: string;
  file: string;
  path: string;
  purpose: string;
  dimensions: string;
  crop: "desktop" | "mobile" | "portrait" | "square" | "wide" | "svg";
  present: boolean;
  venue?: "global" | "avenue" | "ora" | "blacktape" | "night_edit";
  pageUsage: string[];
}

const DIM = {
  desktopHero: "2400 × 1350",
  mobileHero: "1080 × 1440",
  wideSection: "2000 × 1125",
  portraitCard: "1600 × 2000",
  eventLandscape: "1600 × 900",
  eventPortrait: "1600 × 2000",
  squareSocial: "1200 × 1200",
  openGraph: "1200 × 630",
};

export const assetManifest: AssetManifestEntry[] = [
  // Global
  { id: "g1", file: "group_logo_light.svg", path: "/placeholders/group_logo_light.svg", purpose: "Parent group logo for dark backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "global", pageUsage: ["header", "footer"] },
  { id: "g2", file: "group_logo_dark.svg", path: "/placeholders/group_logo_dark.svg", purpose: "Parent group logo for light backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "global", pageUsage: ["footer"] },
  { id: "g3", file: "group_mark.svg", path: "/placeholders/group_mark.svg", purpose: "Compact header and favicon symbol.", dimensions: "vector", crop: "svg", present: false, venue: "global", pageUsage: ["favicon", "mobile header"] },
  { id: "g4", file: "home_hero_desktop.webp", path: "/placeholders/home_hero_desktop.webp", purpose: "Cinematic composition representing all three nightlife brands.", dimensions: DIM.desktopHero, crop: "desktop", present: false, venue: "global", pageUsage: ["home hero"] },
  { id: "g5", file: "home_hero_mobile.webp", path: "/placeholders/home_hero_mobile.webp", purpose: "Mobile composition representing all three nightlife brands.", dimensions: DIM.mobileHero, crop: "mobile", present: false, venue: "global", pageUsage: ["home hero"] },
  { id: "g6", file: "home_vip_experience.webp", path: "/placeholders/home_vip_experience.webp", purpose: "Real premium table experience from one of the venues.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["vip section"] },
  { id: "g7", file: "home_locations_wide.webp", path: "/placeholders/home_locations_wide.webp", purpose: "Dubai skyline connecting the two hotel destinations.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations section"] },
  { id: "g8", file: "home_night_edit_feature.webp", path: "/placeholders/home_night_edit_feature.webp", purpose: "Editorial Dubai nightlife image.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["night edit section"] },
  { id: "g9", file: "global_og_default.jpg", path: "/global_og_default.jpg", purpose: "Default social sharing image.", dimensions: DIM.openGraph, crop: "wide", present: true, venue: "global", pageUsage: ["og default"] },

  // Locations
  { id: "l1", file: "shangri_la_arrival.webp", path: "/placeholders/shangri_la_arrival.webp", purpose: "Exact hotel arrival and entrance used for Avenue guests.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l2", file: "shangri_la_lobby.webp", path: "/placeholders/shangri_la_lobby.webp", purpose: "Guest journey from hotel lobby to Avenue.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l3", file: "shangri_la_map.webp", path: "/placeholders/shangri_la_map.webp", purpose: "Clear location and arrival map graphic.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l4", file: "hilton_habtoor_arrival.webp", path: "/placeholders/hilton_habtoor_arrival.webp", purpose: "Exact hotel arrival and entrance used for Ora and Black Tape guests.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l5", file: "hilton_habtoor_lobby.webp", path: "/placeholders/hilton_habtoor_lobby.webp", purpose: "Guest journey from hotel lobby to the nightclub entrance.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l6", file: "hilton_habtoor_map.webp", path: "/placeholders/hilton_habtoor_map.webp", purpose: "Clear Al Habtoor City arrival map graphic.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l7", file: "business_bay_night.webp", path: "/placeholders/business_bay_night.webp", purpose: "Business Bay skyline at night.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },
  { id: "l8", file: "sheikh_zayed_road_night.webp", path: "/placeholders/sheikh_zayed_road_night.webp", purpose: "Sheikh Zayed Road and Downtown skyline at night.", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "global", pageUsage: ["locations"] },

  // Avenue
  { id: "a1", file: "avenue_logo_light.svg", path: "/placeholders/avenue_logo_light.svg", purpose: "Avenue logo for dark backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "avenue", pageUsage: ["venue page", "home"] },
  { id: "a2", file: "avenue_logo_dark.svg", path: "/placeholders/avenue_logo_dark.svg", purpose: "Avenue logo for light backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "avenue", pageUsage: ["venue page"] },
  { id: "a3", file: "avenue_hero_desktop.webp", path: "/venues/avenue/avenue_hero_desktop.webp", purpose: "Wide Avenue dance floor with strong crowd and skyline context.", dimensions: DIM.desktopHero, crop: "desktop", present: true, venue: "avenue", pageUsage: ["venue hero", "home venue panel"] },
  { id: "a4", file: "avenue_hero_mobile.webp", path: "/placeholders/avenue_hero_mobile.webp", purpose: "Vertical Avenue crowd or performer moment.", dimensions: DIM.mobileHero, crop: "mobile", present: false, venue: "avenue", pageUsage: ["venue hero mobile"] },
  { id: "a5", file: "avenue_floorplan.svg", path: "/placeholders/avenue_floorplan.svg", purpose: "Accurate Avenue seating and table plan.", dimensions: "vector", crop: "svg", present: false, venue: "avenue", pageUsage: ["venue vip"] },
  { id: "a6", file: "avenue_og.jpg", path: "/venues/avenue/avenue_og.jpg", purpose: "Avenue social sharing image.", dimensions: DIM.openGraph, crop: "wide", present: true, venue: "avenue", pageUsage: ["og"] },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `ag${i + 1}`,
    file: `avenue_gallery_${String(i + 1).padStart(2, "0")}.webp`,
    path: `/placeholders/avenue_gallery_${String(i + 1).padStart(2, "0")}.webp`,
    purpose: `Avenue gallery image ${i + 1}.`,
    dimensions: DIM.portraitCard,
    crop: "portrait" as const,
    present: false,
    venue: "avenue" as const,
    pageUsage: ["venue gallery"],
  })),

  // Ora
  { id: "o1", file: "ora_logo_light.svg", path: "/placeholders/ora_logo_light.svg", purpose: "Ora logo for dark backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "ora", pageUsage: ["venue page", "home"] },
  { id: "o2", file: "ora_logo_dark.svg", path: "/placeholders/ora_logo_dark.svg", purpose: "Ora logo for light backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "ora", pageUsage: ["venue page"] },
  { id: "o3", file: "ora_hero_desktop.webp", path: "/venues/ora/ora_hero_desktop.webp", purpose: "Wide Ora room showing its immersive visual identity.", dimensions: DIM.desktopHero, crop: "desktop", present: true, venue: "ora", pageUsage: ["venue hero", "home venue panel"] },
  { id: "o4", file: "ora_hero_mobile.webp", path: "/placeholders/ora_hero_mobile.webp", purpose: "Vertical Ora crowd or performance image.", dimensions: DIM.mobileHero, crop: "mobile", present: false, venue: "ora", pageUsage: ["venue hero mobile"] },
  { id: "o5", file: "ora_floorplan.svg", path: "/placeholders/ora_floorplan.svg", purpose: "Accurate Ora seating and table plan.", dimensions: "vector", crop: "svg", present: false, venue: "ora", pageUsage: ["venue vip"] },
  { id: "o6", file: "ora_og.jpg", path: "/venues/ora/ora_og.jpg", purpose: "Ora social sharing image.", dimensions: DIM.openGraph, crop: "wide", present: true, venue: "ora", pageUsage: ["og"] },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `og${i + 1}`,
    file: `ora_gallery_${String(i + 1).padStart(2, "0")}.webp`,
    path: `/placeholders/ora_gallery_${String(i + 1).padStart(2, "0")}.webp`,
    purpose: `Ora gallery image ${i + 1}.`,
    dimensions: DIM.portraitCard,
    crop: "portrait" as const,
    present: false,
    venue: "ora" as const,
    pageUsage: ["venue gallery"],
  })),

  // Black Tape
  { id: "b0", file: "black_tape_hero_video.mp4", path: "/venues/blacktape/black_tape_hero_video.mp4", purpose: "Official Black Tape urban video reel.", dimensions: "1080 × 1080", crop: "square", present: true, venue: "blacktape", pageUsage: ["venue hero", "home venue panel", "venue drawer", "tonight preview"] },
  { id: "b1", file: "black_tape_logo_light.svg", path: "/placeholders/black_tape_logo_light.svg", purpose: "Black Tape logo for dark backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "blacktape", pageUsage: ["venue page", "home"] },
  { id: "b2", file: "black_tape_logo_dark.svg", path: "/placeholders/black_tape_logo_dark.svg", purpose: "Black Tape logo for light backgrounds.", dimensions: "vector", crop: "svg", present: false, venue: "blacktape", pageUsage: ["venue page"] },
  { id: "b3", file: "black_tape_hero_desktop.webp", path: "/venues/blacktape/black_tape_hero_desktop.webp", purpose: "Wide Black Tape room with a strong urban crowd (poster frame from the official reel).", dimensions: DIM.desktopHero, crop: "desktop", present: true, venue: "blacktape", pageUsage: ["venue hero", "home venue panel"] },
  { id: "b4", file: "black_tape_hero_mobile.webp", path: "/placeholders/black_tape_hero_mobile.webp", purpose: "Vertical crowd, DJ, or performance image.", dimensions: DIM.mobileHero, crop: "mobile", present: false, venue: "blacktape", pageUsage: ["venue hero mobile"] },
  { id: "b5", file: "black_tape_floorplan.svg", path: "/placeholders/black_tape_floorplan.svg", purpose: "Accurate Black Tape seating and table plan.", dimensions: "vector", crop: "svg", present: false, venue: "blacktape", pageUsage: ["venue vip"] },
  { id: "b6", file: "black_tape_og.jpg", path: "/venues/blacktape/black_tape_og.jpg", purpose: "Black Tape social sharing image.", dimensions: DIM.openGraph, crop: "wide", present: true, venue: "blacktape", pageUsage: ["og"] },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `bg${i + 1}`,
    file: `black_tape_gallery_${String(i + 1).padStart(2, "0")}.webp`,
    path: `/placeholders/black_tape_gallery_${String(i + 1).padStart(2, "0")}.webp`,
    purpose: `Black Tape gallery image ${i + 1}.`,
    dimensions: DIM.portraitCard,
    crop: "portrait" as const,
    present: false,
    venue: "blacktape" as const,
    pageUsage: ["venue gallery"],
  })),

  // Night Edit
  { id: "ne1", file: "night_edit_hero_desktop.webp", path: "/placeholders/night_edit_hero_desktop.webp", purpose: "Night Edit hero (desktop).", dimensions: DIM.wideSection, crop: "wide", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne2", file: "night_edit_hero_mobile.webp", path: "/placeholders/night_edit_hero_mobile.webp", purpose: "Night Edit hero (mobile).", dimensions: DIM.mobileHero, crop: "mobile", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne3", file: "night_edit_category_arabic.webp", path: "/placeholders/night_edit_category_arabic.webp", purpose: "Arabic category image.", dimensions: DIM.squareSocial, crop: "square", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne4", file: "night_edit_category_urban.webp", path: "/placeholders/night_edit_category_urban.webp", purpose: "Urban category image.", dimensions: DIM.squareSocial, crop: "square", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne5", file: "night_edit_category_vip.webp", path: "/placeholders/night_edit_category_vip.webp", purpose: "VIP category image.", dimensions: DIM.squareSocial, crop: "square", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne6", file: "night_edit_category_city.webp", path: "/placeholders/night_edit_category_city.webp", purpose: "City category image.", dimensions: DIM.squareSocial, crop: "square", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne7", file: "night_edit_category_dress.webp", path: "/placeholders/night_edit_category_dress.webp", purpose: "Dress category image.", dimensions: DIM.squareSocial, crop: "square", present: false, venue: "night_edit", pageUsage: ["night edit"] },
  { id: "ne8", file: "night_edit_category_celebrations.webp", path: "/placeholders/night_edit_category_celebrations.webp", purpose: "Celebrations category image.", dimensions: DIM.squareSocial, crop: "square", present: false, venue: "night_edit", pageUsage: ["night edit"] },
];

export function getMissingAssetCount(): number {
  return assetManifest.filter((a) => !a.present).length;
}
