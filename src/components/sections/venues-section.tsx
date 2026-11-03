"use client";

import { ArrowUpRight, MapPin, Music2, Clock, GitCompare } from "lucide-react";
import { venues } from "@/lib/venue-data";
import { getOccurrencesByVenue } from "@/lib/events-data";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { VenueHeroMedia } from "@/components/venue-hero-media";
import { VenueCompareModal } from "@/components/venue-compare-modal";
import { siteConfig } from "@/lib/site-config";

export function VenuesSection() {
  const { openVenueDrawer, openConcierge, openEventDrawer } = useUi();

  return (
    <section id="venues" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Choose Your Venue</span>
            <h2 className="heading-editorial mt-3 max-w-3xl text-4xl text-foreground md:text-6xl">
              Three rooms. Three sounds. One night, your way.
            </h2>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <p className="max-w-sm text-sm text-muted-foreground">
              Each venue keeps its own visual world and music identity. Compare them, then open the one that fits your night.
            </p>
            <VenueCompareModal />
          </div>
        </div>

        {/* Editorial panels */}
        <div className="mt-14 space-y-px">
          {venues.map((v, idx) => {
            const upcoming = getOccurrencesByVenue(v.slug).slice(0, 3);
            const reverse = idx % 2 === 1;
            return (
              <article
                key={v.slug}
                data-venue={v.slug}
                className="venue-bg group relative grid gap-0 overflow-hidden md:grid-cols-12"
              >
                {/* Visual */}
                <div className={reverse ? "md:col-span-5 md:order-2" : "md:col-span-5"}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-auto md:h-full md:min-h-[560px]">
                    <VenueHeroMedia
                      venue={v}
                      purpose={`Wide ${v.shortName} room — crowd, lighting, and venue identity.`}
                      alt={`${v.name} interior`}
                      className="absolute inset-0 h-full w-full"
                      allowSound
                      controlsClassName="right-5 top-5"
                    />
                    {/* Tint with venue color */}
                    <div
                      className="absolute inset-0 mix-blend-multiply"
                      style={{
                        background: `linear-gradient(180deg, transparent 40%, ${v.theme.bg} 100%)`,
                      }}
                    />
                    {/* Floor badge */}
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-sm border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/70 px-3 py-1.5 backdrop-blur-sm">
                      <MapPin className="h-3 w-3 text-[var(--venue-accent)]" />
                      <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-foreground)]">
                        {v.location.floor} · {v.location.area}
                      </span>
                    </div>
                    {/* Logo placeholder */}
                    <div className="absolute bottom-5 right-5 w-24">
                      <AssetImage
                        src={v.logoLight}
                        file={`${v.slug}_logo_light.svg`}
                        purpose={`${v.shortName} logo for dark backgrounds.`}
                        crop="svg"
                        venue={v.slug}
                        alt={`${v.name} logo`}
                        variant="logo"
                        className="h-12 w-24"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="venue-surface relative flex flex-col justify-between p-6 md:col-span-7 md:p-12">
                  {/* Index + name */}
                  <div className="flex items-start justify-between">
                    <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.2em] text-[var(--venue-muted)]">
                      Venue {String(idx + 1).padStart(2, "0")} / 03
                    </span>
                    <span
                      className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em]"
                      style={{ color: v.theme.accent }}
                    >
                      {v.genres.slice(0, 3).join(" · ")}
                    </span>
                  </div>

                  {/* Heading */}
                  <div className="mt-8 md:mt-12">
                    <h3 className="heading-editorial text-3xl leading-tight text-[var(--venue-foreground)] md:text-5xl">
                      {v.heading}
                    </h3>
                    <p className="mt-4 max-w-lg text-sm text-[var(--venue-muted)] md:text-base">
                      {v.supportingIdea}
                    </p>
                  </div>

                  {/* Description excerpt */}
                  <p className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--venue-foreground)]/80">
                    {v.description[0]}
                  </p>

                  {/* Upcoming mini list */}
                  <div className="mt-8 border-t border-[var(--venue-foreground)]/10 pt-6">
                    <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-muted)]">
                      Next confirmed events
                    </p>
                    <ul className="mt-3 space-y-2">
                      {upcoming.map((ev) => (
                        <li key={ev.id}>
                          <button
                            onClick={() => {
                              track("view_event", { id: ev.id, venue: v.slug, source: "venues_panel" });
                              openEventDrawer(ev.id);
                            }}
                            className="group/item flex w-full items-center justify-between gap-3 py-1.5 text-left transition-colors hover:text-[var(--venue-accent)]"
                          >
                            <span className="flex items-center gap-3">
                              <span className="font-mono-tight tnum text-[0.6875rem] text-[var(--venue-accent)]">
                                {formatDateShort(ev.serviceDate)}
                              </span>
                              <span className="text-sm text-[var(--venue-foreground)]">
                                {ev.title}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
                              <Clock className="h-3 w-3" />
                              {ev.startTime}
                              <ArrowUpRight className="h-3 w-3 transition-transform group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5" />
                            </span>
                          </button>
                        </li>
                      ))}
                      {upcoming.length === 0 && (
                        <li className="py-1.5 text-sm text-[var(--venue-muted)]">
                          No confirmed events in the next 10 days — contact concierge.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        track("view_venue", { venue: v.slug, source: "venues_panel" });
                        openVenueDrawer(v.slug);
                      }}
                      className="rounded-none border border-[var(--venue-foreground)] px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--venue-foreground)] transition-colors hover:bg-[var(--venue-foreground)] hover:text-[var(--venue-bg)]"
                    >
                      Explore {v.shortName}
                      <ArrowUpRight className="ml-1 inline h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        track("start_vip_inquiry", { venue: v.slug, source: "venues_panel" });
                        openConcierge({ venue: v.slug });
                      }}
                      className="rounded-none bg-[var(--venue-accent)] px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--venue-bg)] transition-opacity hover:opacity-90"
                    >
                      Request VIP
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Entity resolution notice */}
        <div className="mt-10 rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="font-mono-tight text-[0.6875rem] text-amber-200/80">
            <strong className="text-amber-200">Entity notice:</strong> Ora and Black Tape
            share level forty four of Hilton Dubai Al Habtoor City. Entity mode is{" "}
            <code className="text-amber-300">{siteConfig.venueEntityMode}</code>. Separate
            local business structured data and map claims are not published until the correct
            entity mode is confirmed.
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
