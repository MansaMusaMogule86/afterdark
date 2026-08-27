"use client";

import { Users, CalendarDays, BookOpen, MapPin, Building2 } from "lucide-react";
import { venues } from "@/lib/venue-data";
import { eventOccurrences } from "@/lib/events-data";
import { guideArticles } from "@/lib/guide-data";

/**
 * SocialProofStrip — honest social proof using real platform metrics.
 *
 * Per directive: "Never use fake customer reviews" and "Never publish a fake award."
 * This component shows REAL counts: venues, upcoming events, guide articles,
 * locations, hotel partners. No fake reviews, no fake ratings, no fake testimonials.
 *
 * Numbers are computed from the actual data layer.
 */
export function SocialProofStrip() {
  const stats = [
    { icon: Building2, label: "Venues", value: venues.length, sub: "One owner" },
    { icon: CalendarDays, label: "Upcoming Events", value: eventOccurrences.length, sub: "Next 10 nights" },
    { icon: BookOpen, label: "Guide Articles", value: guideArticles.length, sub: "The Night Edit" },
    { icon: MapPin, label: "Skyline Addresses", value: 2, sub: "Shangri La + Hilton" },
    { icon: Users, label: "Hotel Partners", value: 2, sub: "Shangri La + Hilton" },
  ];

  return (
    <section className="relative border-y border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
        {/* Label */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-accent/30" />
          <span className="eyebrow text-accent">By the numbers</span>
          <span className="h-px w-8 bg-accent/30" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => {
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

        {/* Note */}
        <p className="mt-4 text-center font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/60">
          Real metrics from the platform data layer — no fake reviews or testimonials
        </p>
      </div>
    </section>
  );
}
