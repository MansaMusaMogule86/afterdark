"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Filter, ArrowUpRight, CalendarCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventOccurrences } from "@/lib/events-data";
import { venues, getVenue } from "@/lib/venue-data";
import { getServiceDate, addDays } from "@/lib/tonight";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import type { MusicGenre, VenueSlug } from "@/lib/types";

type VenueFilter = "all" | VenueSlug;
type MusicFilter = "all" | MusicGenre;
type StatusFilter = "all" | "live" | "scheduled" | "available";

export function EventsSection() {
  const { openEventDrawer, openBooking } = useUi();
  const [venueF, setVenueF] = useState<VenueFilter>("all");
  const [musicF, setMusicF] = useState<MusicFilter>("all");
  const [statusF, setStatusF] = useState<StatusFilter>("all");

  const start = getServiceDate();
  const window7 = addDays(start, 6);

  const filtered = useMemo(() => {
    return eventOccurrences.filter((e) => {
      if (e.serviceDate < start || e.serviceDate > window7) return false;
      if (venueF !== "all" && e.venue !== venueF) return false;
      if (musicF !== "all" && !e.music.includes(musicF)) return false;
      if (statusF === "live" && e.status !== "live") return false;
      if (statusF === "scheduled" && e.status !== "scheduled") return false;
      // "available" = not sold out / cancelled
      if (statusF === "available" && (e.status === "sold_out" || e.status === "cancelled")) return false;
      return true;
    });
  }, [venueF, musicF, statusF, start, window7]);

  const hasActiveFilter = venueF !== "all" || musicF !== "all" || statusF !== "all";

  return (
    <section id="events" className="relative border-t border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Upcoming Events</span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              The next seven nights
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Filter by venue, sound, and availability. Availability shows{" "}
              <span className="text-foreground">Contact Concierge</span> until live table data is connected —
              we never display fake availability or a fake sold-out state.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-background/50 px-4 py-3">
            <CalendarDays className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              {formatRange(start, window7)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-4 rounded-sm border border-border/40 bg-background/40 p-4 md:flex-row md:items-center md:gap-6 md:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em]">Filter</span>
          </div>

          <FilterGroup label="Venue">
            {(["all", "avenue", "ora", "blacktape"] as VenueFilter[]).map((v) => (
              <FilterChip key={v} active={venueF === v} onClick={() => { setVenueF(v); track("filter_events", { filter: "venue", value: v }); }}>
                {v === "all" ? "All" : getVenue(v)!.shortName}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Music">
            {(["all", "arabic", "hiphop", "rnb", "afro", "international"] as MusicFilter[]).map((m) => (
              <FilterChip key={m} active={musicF === m} onClick={() => { setMusicF(m); track("filter_events", { filter: "music", value: m }); }}>
                {m === "all" ? "All" : genreLabel(m)}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label="Status">
            {(["all", "available", "live", "scheduled"] as StatusFilter[]).map((s) => (
              <FilterChip key={s} active={statusF === s} onClick={() => { setStatusF(s); track("filter_events", { filter: "status", value: s }); }}>
                {s === "all" ? "All" : s === "live" ? "Live" : s === "scheduled" ? "Scheduled" : "Available"}
              </FilterChip>
            ))}
          </FilterGroup>

          {hasActiveFilter && (
            <button
              onClick={() => { setVenueF("all"); setMusicF("all"); setStatusF("all"); }}
              className="ml-auto flex items-center gap-1 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="mt-6 font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-muted-foreground">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""} · next 7 nights
        </p>

        {/* Event grid */}
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-sm border border-dashed border-border/60 py-20 text-center">
            <p className="font-serif-display text-2xl text-foreground">No events match your filters</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Adjust the filters above, or contact the concierge for the current schedule.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => {
              const v = getVenue(ev.venue)!;
              return (
                <article
                  key={ev.id}
                  data-venue={ev.venue}
                  className="venue-surface group flex flex-col"
                >
                  {/* Poster */}
                  <button
                    onClick={() => { track("view_event", { id: ev.id, venue: ev.venue, source: "events_grid" }); openEventDrawer(ev.id); }}
                    className="relative block aspect-[4/5] w-full overflow-hidden"
                    aria-label={`View ${ev.title}`}
                  >
                    <AssetImage
                      src={ev.poster}
                      file={`event_${ev.venue}_${ev.conceptSlug}_${ev.serviceDate}_portrait.webp`}
                      purpose={`Event poster for ${ev.title}.`}
                      dimensions="1600 × 2000"
                      crop="portrait"
                      venue={ev.venue}
                      alt={ev.title}
                      className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-transparent to-transparent" />
                    {/* Date badge */}
                    <div className="absolute left-3 top-3 flex flex-col items-center rounded-sm border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/80 px-2.5 py-1.5 backdrop-blur-sm">
                      <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-accent)]">
                        {weekdayShort(ev.serviceDate)}
                      </span>
                      <span className="font-serif-display text-lg leading-none text-[var(--venue-foreground)] tnum">
                        {dayNum(ev.serviceDate)}
                      </span>
                      <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-[var(--venue-muted)]">
                        {monthShort(ev.serviceDate)}
                      </span>
                    </div>
                    {/* Status */}
                    <div className="absolute right-3 top-3">
                      <span className={cn(
                        "rounded-full border px-2 py-0.5 font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] backdrop-blur-sm",
                        ev.status === "live" && "border-green-400/40 bg-green-400/15 text-green-300",
                        ev.status === "scheduled" && "border-accent/40 bg-accent/15 text-accent",
                        ev.status === "sold_out" && "border-red-400/40 bg-red-400/15 text-red-300",
                      )}>
                        {ev.status === "live" ? "Live" : ev.status === "scheduled" ? "Scheduled" : ev.status}
                      </span>
                    </div>
                  </button>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-accent)]">
                      {v.shortName}
                    </p>
                    <button
                      onClick={() => { track("view_event", { id: ev.id, source: "events_title" }); openEventDrawer(ev.id); }}
                      className="mt-1 text-left"
                    >
                      <h3 className="line-clamp-2 font-serif-display text-lg leading-snug text-[var(--venue-foreground)] group-hover:text-[var(--venue-accent)]">
                        {ev.title}
                      </h3>
                    </button>

                    <div className="mt-3 space-y-1.5">
                      <Meta label="Music" value={ev.music.map(genreLabel).join(" · ")} />
                      <Meta label="Doors" value={`${ev.startTime} – ${ev.endTime}`} />
                      {ev.artist && <Meta label="Artist" value={ev.artist} />}
                    </div>

                    {/* Availability line — never fake */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[var(--venue-accent)]" />
                      <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
                        Tables · Contact Concierge
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2 pt-4">
                      <button
                        onClick={() => { track("view_event", { id: ev.id, source: "events_view" }); openEventDrawer(ev.id); }}
                        className="flex-1 rounded-none border border-[var(--venue-foreground)]/20 py-2.5 text-center font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-foreground)] transition-colors hover:bg-[var(--venue-foreground)]/10"
                      >
                        View Event
                        <ArrowUpRight className="ml-1 inline h-3 w-3" />
                      </button>
                      <button
                        onClick={() => { track("start_vip_inquiry", { venue: ev.venue, event: ev.id, source: "events_grid" }); openBooking({ venue: ev.venue, eventOrDate: ev.title }); }}
                        className="flex-1 rounded-none bg-[var(--venue-accent)] py-2.5 text-center font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-bg)] transition-opacity hover:opacity-90"
                      >
                        <CalendarCheck className="mr-1 inline h-3 w-3" />
                        Request VIP
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-baseline gap-2 text-xs">
      <span className="font-mono-tight w-14 shrink-0 text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span className="truncate text-foreground/90">{value}</span>
    </p>
  );
}

function genreLabel(g: MusicGenre): string {
  const map: Record<MusicGenre, string> = {
    arabic: "Arabic", khaleeji: "Khaleeji", hiphop: "Hip Hop", rnb: "R&B",
    afro: "Afro", dancehall: "Dancehall", house: "House",
    international: "International", urban: "Urban",
  };
  return map[g];
}

function weekdayShort(d: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", weekday: "short" }).format(new Date(`${d}T12:00:00Z`));
}
function dayNum(d: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "2-digit" }).format(new Date(`${d}T12:00:00Z`));
}
function monthShort(d: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", month: "short" }).format(new Date(`${d}T12:00:00Z`));
}
function formatRange(a: string, b: string): string {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short" });
  return `${f.format(new Date(`${a}T12:00:00Z`))} — ${f.format(new Date(`${b}T12:00:00Z`))}`;
}
