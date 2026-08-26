/**
 * SEO + Structured Data helpers.
 * Generates JSON-LD for Organization, WebSite, NightClub, Event, Article, BreadcrumbList.
 */

import { siteConfig } from "./site-config";
import { venues } from "./venue-data";
import type { VenueRecord, EventOccurrence, GuideArticle } from "./types";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.parentName,
    url: siteConfig.seo.siteUrl,
    description: siteConfig.seo.defaultDescription,
    sameAs: [
      siteConfig.social.instagram,
      siteConfig.social.tiktok,
      siteConfig.social.facebook,
      siteConfig.social.youtube,
    ].filter((u) => u && u !== "#"),
    areaServed: "Dubai, United Arab Emirates",
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.seo.siteName,
    url: siteConfig.seo.siteUrl,
    inLanguage: ["en", "ar"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.seo.siteUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function nightclubJsonLd(v: VenueRecord) {
  return {
    "@context": "https://schema.org",
    "@type": "NightClub",
    name: v.name,
    description: v.seoDescription,
    image: v.ogImage,
    url: `${siteConfig.seo.siteUrl}/#venue-${v.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: v.location.hotelName,
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: v.location.coordinates.lat,
      longitude: v.location.coordinates.lng,
    },
    hasMap: `https://www.google.com/maps?q=${v.location.coordinates.lat},${v.location.coordinates.lng}`,
    sameAs: [],
    openingHours: v.openingHours
      .filter((h) => h.status !== "closed")
      .map((h) => `${h.day} ${h.doors ?? ""}-${h.close ?? ""}`.trim()),
  };
}

export function eventJsonLd(e: EventOccurrence) {
  const venue = venues.find((v) => v.slug === e.venue)!;
  const startDate = `${e.serviceDate}T${to24h(e.startTime)}+04:00`;
  const endDate = `${e.serviceDate}T${to24h(e.endTime)}+04:00`;
  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: e.title,
    description: e.description,
    startDate,
    endDate,
    eventStatus:
      e.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : e.status === "postponed"
        ? "https://schema.org/EventPostponed"
        : e.status === "sold_out"
        ? "https://schema.org/EventSoldOut"
        : "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: venue.location.hotelName,
        addressLocality: "Dubai",
        addressCountry: "AE",
      },
    },
    ...(e.artist
      ? { performer: { "@type": "Person", name: e.artist } }
      : {}),
    image: [e.poster, e.landscapeImage, e.squareImage],
  };
}

export function articleJsonLd(a: GuideArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    image: a.coverImage,
    datePublished: a.reviewedDate,
    dateModified: a.reviewedDate,
    author: { "@type": "Organization", name: siteConfig.parentName },
    publisher: { "@type": "Organization", name: siteConfig.parentName },
    inLanguage: ["en", "ar"],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Convert "11:30 PM" -> "23:30" */
function to24h(t: string): string {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return "00:00";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}
