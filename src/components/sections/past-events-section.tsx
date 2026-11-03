"use client";

import { Archive, Clock, History, ArrowUpRight } from "lucide-react";
import { eventOccurrences } from "@/lib/events-data";
import { getVenue } from "@/lib/venue-data";
import { getServiceDate } from "@/lib/tonight";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { DemandIndicator } from "@/components/demand-indicator";

/**
 * PastEventsSection — archive of completed events.
 *
 * Shows events with status "completed" (past service dates) as a compact
 * archive grid. This gives the site historical depth and SEO content,
 * without claiming any unverified facts.
 *
 * Since the sample data only generates future events, this section shows
 * a curated "recent archive" with a note that real past events will appear
 * once the NightOps adapter is connected.
 */
export function PastEventsSection() {
  const { openEventDrawer } = useUi();
  const tonight = getServiceDate();

  // For demo purposes, show the earliest upcoming events as "recently announced"
  // since we don't have real past data yet. In production, this would filter
  // for status === "completed" and serviceDate < tonight.
  const recentEvents = eventOccurrences
    .filter((e) => e.serviceDate >= tonight)
    .slice(0, 4);

  return (
    <section id="archive" className="relative border-t border-border/40 bg-secondary/10">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">
              <History className="mr-1 inline h-3 w-3" />
              Recent Archive
            </span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              Nights that moved Dubai.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              A record of recent English Nights and signature events across the three venues.
              Real historical events will populate here once the NightOps adapter is connected.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-background/50 px-4 py-3">
            <Archive className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              {recentEvents.length} recent events
            </p>
          </div>
        </div>

        {/* Archive grid */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-4">
          {recentEvents.map((ev) => {
            const v = getVenue(ev.venue)!;
            return (
              <article
                key={`archive-${ev.id}`}
                data-venue={ev.venue}
                className="venue-surface group flex flex-col"
              >
                {/* Poster */}
                <button
                  onClick={() => {
                    track("view_event", { id: ev.id, venue: ev.venue, source: "archive" });
                    openEventDrawer(ev.id);
                  }}
                  className="relative block aspect-[4/3] w-full overflow-hidden"
                  aria-label={`View ${ev.title}`}
                >
                  <AssetImage
                    src={ev.landscapeImage}
                    file={`event_${ev.venue}_${ev.conceptSlug}_${ev.serviceDate}_landscape.webp`}
                    purpose={`Event image for ${ev.title}.`}
                    dimensions="1600 × 900"
                    crop="wide"
                    venue={ev.venue}
                    alt={ev.title}
                    className="h-full w-full opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-[var(--venue-bg)]/40 to-transparent" />
                  {/* Date badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="font-mono-tight tnum text-[0.625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)]">
                      {formatDateShort(ev.serviceDate)}
                    </span>
                  </div>
                </button>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-accent)]">
                    {v.shortName}
                  </p>
                  <h3 className="mt-1 line-clamp-2 min-h-[2.4rem] font-serif-display text-sm leading-snug text-[var(--venue-foreground)] group-hover:text-[var(--venue-accent)]">
                    {ev.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Clock className="h-2.5 w-2.5 text-[var(--venue-muted)]" />
                    <span className="font-mono-tight text-[0.5625rem] text-[var(--venue-muted)]">
                      {ev.startTime}
                    </span>
                  </div>
                  <DemandIndicator event={ev.title} />
                  <button
                    onClick={() => {
                      track("view_event", { id: ev.id, source: "archive_view" });
                      openEventDrawer(ev.id);
                    }}
                    className="mt-3 flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
                  >
                    View <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-8 rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="font-mono-tight text-[0.5625rem] text-amber-200/80">
            <Archive className="mr-1 inline h-3 w-3" />
            Sample data — real historical events will populate here once the NightOps OS adapter
            is connected and completed events sync automatically.
          </p>
        </div>
      </div>
    </section>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
  }).format(d);
}
