"use client";

import { Users, CalendarDays, BookOpen, MapPin, Building2 } from "lucide-react";
import { venues } from "@/lib/venue-data";
import { eventOccurrences } from "@/lib/events-data";
import { guideArticles } from "@/lib/guide-data";

/**
 * SocialProofStrip — platform statistics with honest verification labels.
 *
 * Per directive: Do not call data "real" merely because it comes from the
 * application data layer. Do not hardcode public numbers. When a count is
 * zero or unverifiable, hide the statistic instead of displaying a fake value.
 *
 * Current data layer state:
 * - Venues: sample data, factsVerified = false on all 3
 * - Events: sample data, sample = true on all
 * - Guides: sample content, no verification flag
 * - Locations: 2 hotel records (Shangri La + Hilton)
 *
 * Until verification status fields exist on records, we display:
 * - Venue count (3) — labelled as "venues in the group" (factual)
 * - Location count (2) — labelled as "Skyline Locations" (NOT "Hotel Partners"
 *   unless a documented partnership claim is approved)
 * - Event count — labelled as "sample schedule" (honest)
 * - Guide count — labelled as "published guides" (factual)
 *
 * No fake reviews, no fake ratings, no fake testimonials.
 */

interface StatConfig {
  icon: typeof Users;
  label: string;
  value: number;
  sub: string;
  /** Hide when value is 0 or unverifiable. */
  show: boolean;
}

export function SocialProofStrip() {
  // Factual counts from the data layer (not "verified" — just counted).
  const venueCount = venues.length;
  const locationCount = new Set(venues.map((v) => v.location.hotelName)).size;
  const eventCount = eventOccurrences.length;
  const guideCount = guideArticles.length;

  const stats: StatConfig[] = [
    {
      icon: Building2,
      label: "Venues",
      value: venueCount,
      sub: "In the group",
      show: venueCount > 0,
    },
    {
      icon: CalendarDays,
      label: "Sample Schedule",
      value: eventCount,
      sub: "Next 10 nights · sample data",
      show: eventCount > 0,
    },
    {
      icon: BookOpen,
      label: "Published Guides",
      value: guideCount,
      sub: "The Night Edit",
      show: guideCount > 0,
    },
    {
      icon: MapPin,
      label: "Skyline Locations",
      value: locationCount,
      sub: "Shangri La + Hilton",
      show: locationCount > 0,
    },
  ];

  // Filter out hidden stats (zero or unverifiable).
  const visibleStats = stats.filter((s) => s.show);

  // If nothing is visible, don't render the section at all.
  if (visibleStats.length === 0) return null;

  return (
    <section className="relative border-y border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
        {/* Label */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-accent/30" />
          <span className="eyebrow text-accent">Platform overview</span>
          <span className="h-px w-8 bg-accent/30" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 sm:grid-cols-4">
          {visibleStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center justify-center bg-card p-5 text-center transition-colors hover:bg-accent/5"
              >
                <Icon className="h-5 w-5 text-accent transition-transform group-hover:scale-110" />
                <span className="mt-2 font-serif-display text-3xl text-foreground tnum">
                  {stat.value}
                </span>
                <span className="mt-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {stat.label}
                </span>
                <span className="mt-0.5 text-[0.5625rem] text-muted-foreground/60">
                  {stat.sub}
                </span>
              </div>
            );
          })}
        </div>

        {/* Honest note */}
        <p className="mt-4 text-center font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/60">
          Platform data — venue facts pending owner verification · no fake reviews or testimonials
        </p>
      </div>
    </section>
  );
}
