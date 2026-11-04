"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Clock, Music2, MapPin, CalendarCheck, MessageCircle,
  Filter, X, Instagram, RefreshCw, AlertCircle, Check, ArrowUpRight, Moon, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { venues, getVenue } from "@/lib/venue-data";
import { getServiceDateLabel } from "@/lib/tonight";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { Button } from "@/components/ui/button";
import { ENGLISH_NIGHT_HASHTAG } from "@/lib/english-nights";
import type { VenueSlug } from "@/lib/types";

interface LightEvent {
  id: string;
  title: string;
  venue: VenueSlug;
  serviceDate: string;
  startTime: string;
  endTime: string;
  status: string;
  music: string[];
  artist?: string;
  importStatus: string;
  mediaId: string;
  permalink: string;
  accountHandle: string;
  poster: string;
  sample: boolean;
}

type VenueFilter = "all" | VenueSlug;
type MusicFilter = "all" | string;
type StatusFilter = "all" | "live" | "scheduled";

export function EnglishNightsView() {
  const router = useRouter();
  const { openConcierge } = useUi();
  const [events, setEvents] = useState<LightEvent[]>([]);
  const [stats, setStats] = useState<{ total: number; ready: number; needsReview: number; rejected: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [venueF, setVenueF] = useState<VenueFilter>("all");
  const [musicF, setMusicF] = useState<MusicFilter>("all");
  const [statusF, setStatusF] = useState<StatusFilter>("all");

  const tonightLabel = useMemo(() => getServiceDateLabel(), []);

  useEffect(() => {
    fetch("/api/english-nights?status=all")
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        setStats(d.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (e.importStatus !== "READY_TO_PUBLISH") return false; // only published
      if (venueF !== "all" && e.venue !== venueF) return false;
      if (musicF !== "all" && !e.music.includes(musicF)) return false;
      if (statusF === "live" && e.status !== "live") return false;
      if (statusF === "scheduled" && e.status !== "scheduled") return false;
      return true;
    });
  }, [events, venueF, musicF, statusF]);

  const tonightEvents = events.filter(
    (e) => e.importStatus === "READY_TO_PUBLISH" && e.serviceDate === tonightLabel.date
  );

  const openEvent = (e: LightEvent) => {
    track("view_event", { id: e.id, venue: e.venue, source: "english_nights" });
    router.push(`/?view=english-night&venue=${e.venue}&date=${e.serviceDate}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">{ENGLISH_NIGHT_HASHTAG}</span>
            <h1 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              English Nights
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Curated English Night events at Avenue, Ora, and Black Tape — imported exclusively from
              Instagram posts tagged <code className="rounded bg-secondary px-1.5 py-0.5 text-accent">{ENGLISH_NIGHT_HASHTAG}</code>.
              No general feed. No unrelated posts. Only validated English Nights.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 px-4 py-3">
            <Instagram className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              Auto-import · 3 approved accounts
            </p>
          </div>
        </div>

        {/* Tonight status band */}
        <div className="mt-10 rounded-sm border border-accent/20 bg-accent/5 p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-accent" />
              <div>
                <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {tonightLabel.longLabel}
                </p>
                <p className="mt-1 font-serif-display text-xl text-foreground md:text-2xl">
                  {tonightEvents.length > 0
                    ? `${tonightEvents.length} English Night${tonightEvents.length > 1 ? "s" : ""} live tonight`
                    : "No English Nights tonight"}
                </p>
              </div>
            </div>
            {tonightEvents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tonightEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => openEvent(e)}
                    className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-left hover:border-accent/40"
                  >
                    <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-accent">
                      {getVenue(e.venue)!.shortName}
                    </span>
                    <span className="text-sm text-foreground">{e.startTime}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-4 rounded-sm border border-border/40 bg-card p-4 md:flex-row md:items-center md:gap-6 md:p-5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em]">Filter</span>
          </div>
          <FilterGroup label="Venue">
            {(["all", "avenue", "ora", "blacktape"] as VenueFilter[]).map((v) => (
              <FilterChip key={v} active={venueF === v} onClick={() => { setVenueF(v); track("filter_events", { filter: "en_venue", value: v }); }}>
                {v === "all" ? "All" : getVenue(v as VenueSlug)!.shortName}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Music">
            {(["all", "international", "house", "hiphop", "rnb"].filter((m) => m === "all" || events.some((e) => e.music.includes(m)))).map((m) => (
              <FilterChip key={m} active={musicF === m} onClick={() => { setMusicF(m); track("filter_events", { filter: "en_music", value: m }); }}>
                {m === "all" ? "All" : m.charAt(0).toUpperCase() + m.slice(1)}
              </FilterChip>
            ))}
          </FilterGroup>
          <FilterGroup label="Status">
            {(["all", "scheduled", "live"] as StatusFilter[]).map((s) => (
              <FilterChip key={s} active={statusF === s} onClick={() => { setStatusF(s); track("filter_events", { filter: "en_status", value: s }); }}>
                {s === "all" ? "All" : s === "live" ? "Live" : "Scheduled"}
              </FilterChip>
            ))}
          </FilterGroup>
          {(venueF !== "all" || musicF !== "all" || statusF !== "all") && (
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
          {loading ? "Loading…" : `${filtered.length} English Night${filtered.length !== 1 ? "s" : ""}`}
          {stats && (
            <span className="ml-2 text-muted-foreground/60">· {stats.ready} ready · {stats.needsReview} need review</span>
          )}
        </p>

        {/* Event grid */}
        {loading ? (
          <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-sm border border-dashed border-border/60 py-20 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-serif-display text-2xl text-foreground">No English Nights match your filters</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New English Nights appear here automatically when tagged {ENGLISH_NIGHT_HASHTAG} on Instagram.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const v = getVenue(e.venue)!;
              return (
                <article key={e.id} data-venue={e.venue} className="venue-surface group flex flex-col">
                  {/* Poster */}
                  <button
                    onClick={() => openEvent(e)}
                    className="relative block aspect-[4/5] w-full overflow-hidden"
                    aria-label={`View ${e.title}`}
                  >
                    <AssetImage
                      src={e.poster}
                      file={`event_${e.venue}_english-night_${e.serviceDate}_portrait.webp`}
                      purpose={`English Night poster for ${e.title}.`}
                      dimensions="1600 × 2000"
                      crop="portrait"
                      venue={e.venue}
                      alt={e.title}
                      className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-transparent to-transparent" />
                    {/* Date badge */}
                    <div className="absolute left-3 top-3 flex flex-col items-center rounded-sm border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/80 px-2.5 py-1.5 backdrop-blur-sm">
                      <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-accent)]">{weekdayShort(e.serviceDate)}</span>
                      <span className="font-serif-display text-lg leading-none text-[var(--venue-foreground)] tnum">{dayNum(e.serviceDate)}</span>
                      <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-[var(--venue-muted)]">{monthShort(e.serviceDate)}</span>
                    </div>
                    {/* Instagram source badge */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/80 px-2 py-0.5 backdrop-blur-sm">
                      <Instagram className="h-2.5 w-2.5 text-[var(--venue-accent)]" />
                      <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-[var(--venue-foreground)]">EN</span>
                    </div>
                  </button>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-accent)]">
                      {v.shortName} · {e.accountHandle}
                    </p>
                    <button onClick={() => openEvent(e)} className="mt-1 text-left">
                      <h3 className="line-clamp-2 font-serif-display text-lg leading-snug text-[var(--venue-foreground)] group-hover:text-[var(--venue-accent)]">
                        {e.title}
                      </h3>
                    </button>
                    <div className="mt-3 space-y-1.5">
                      <Meta label="Music" value={e.music.join(" · ")} />
                      <Meta label="Doors" value={`${e.startTime} – ${e.endTime}`} />
                      {e.artist && <Meta label="DJ" value={e.artist} />}
                    </div>
                    {/* Availability */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[var(--venue-accent)]" />
                      <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
                        Tables · Contact Concierge
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="mt-auto flex gap-2 pt-4">
                      <button
                        onClick={() => openEvent(e)}
                        className="flex-1 rounded-none border border-[var(--venue-foreground)]/20 py-2.5 text-center font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-foreground)] transition-colors hover:bg-[var(--venue-foreground)]/10"
                      >
                        View Event <ArrowUpRight className="ml-1 inline h-3 w-3" />
                      </button>
                      <button
                        onClick={() => { track("start_vip_inquiry", { venue: e.venue, event: e.id, source: "english_nights" }); openConcierge({ venue: e.venue, eventOrDate: e.title }); }}
                        className="flex-1 rounded-none bg-[var(--venue-accent)] py-2.5 text-center font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-bg)] transition-opacity hover:opacity-90"
                      >
                        <CalendarCheck className="mr-1 inline h-3 w-3" /> VIP
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <HowItWorks
            n="01"
            title="Tagged on Instagram"
            desc={`Venue teams post with ${ENGLISH_NIGHT_HASHTAG}. Only posts with the hashtag are imported — no general feed.`}
          />
          <HowItWorks
            n="02"
            title="Parsed & classified"
            desc="Caption is parsed for venue, date, doors, music, DJs, entry, VIP, and guest list. Each import is classified READY, NEEDS REVIEW, or REJECTED."
          />
          <HowItWorks
            n="03"
            title="Auto-published when validated"
            desc="Only published automatically when venue, date, time, and event media are all validated. Otherwise held for review."
          />
        </div>

        {/* Admin link */}
        <div className="mt-10 flex items-center justify-between rounded-sm border border-border/40 bg-secondary/20 p-5">
          <div>
            <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">Import review</p>
            <p className="mt-1 text-sm text-foreground">Review NEEDS REVISION imports and manage the English Night queue.</p>
          </div>
          <Link href="/?view=english-nights-admin">
            <Button variant="outline" className="rounded-none border-foreground/30">
              Open Review Panel <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
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
        active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-baseline gap-2 text-xs">
      <span className="font-mono-tight w-12 shrink-0 text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">{label}</span>
      <span className="truncate text-foreground/90">{value}</span>
    </p>
  );
}

function HowItWorks({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="border-l border-accent/30 pl-5">
      <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.2em] text-accent">{n}</span>
      <h3 className="mt-2 font-serif-display text-xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
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
