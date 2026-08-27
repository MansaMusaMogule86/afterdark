"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Clock, Music2, Calendar, ShieldCheck, Shirt, DoorOpen,
  CalendarCheck, MessageCircle, Share2, CalendarPlus, ArrowUpRight, AlertCircle,
  Instagram, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVenue } from "@/lib/venue-data";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { Button } from "@/components/ui/button";
import type { EnglishNightEvent } from "@/lib/english-nights";

interface Props {
  venue: string;
  date: string;
}

export function EnglishNightDetailView({ venue, date }: Props) {
  const { openBooking, openVenueDrawer } = useUi();
  const [ev, setEv] = useState<EnglishNightEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/english-night?venue=${encodeURIComponent(venue)}&date=${encodeURIComponent(date)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        setEv(d.event || null);
        setLoading(false);
        if (d.event) {
          track("view_event", { id: d.event.id, venue: d.event.venue, source: "english_night_detail" });
        }
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [venue, date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-20 md:px-8">
          <div className="aspect-[16/10] animate-pulse bg-card" />
        </div>
      </div>
    );
  }

  if (notFound || !ev) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-serif-display text-3xl text-foreground">English Night not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This English Night may not be published yet, or the venue/date is incorrect.
          </p>
          <Link href="/?view=english-nights">
            <Button className="mt-6 rounded-none bg-foreground text-background hover:bg-accent">
              <ArrowLeft className="mr-2 h-4 w-4" /> All English Nights
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const v = getVenue(ev.venue)!;

  const addToCalendar = () => {
    track("add_to_calendar", { id: ev.id, venue: ev.venue, source: "english_night_detail" });
    const start = toICS(ev.serviceDate, ev.startTime);
    const end = toICS(ev.serviceDate, ev.endTime);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//After Midnight DXB//EN",
      "BEGIN:VEVENT", `UID:${ev.id}@after-midnight-dxb`,
      `DTSTAMP:${start}`, `DTSTART:${start}`, `DTEND:${end}`,
      `SUMMARY:${ev.title}`, `LOCATION:${v.name} - ${v.location.hotelName}`,
      `DESCRIPTION:${ev.description}`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    track("click_map", { id: ev.id, source: "english_night_share" });
    if (navigator.share) {
      navigator.share({ title: ev.title, text: ev.description, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* JSON-LD Event structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicEvent",
            name: ev.title,
            description: ev.description,
            startDate: `${ev.serviceDate}T${to24h(ev.startTime)}+04:00`,
            endDate: `${ev.serviceDate}T${to24h(ev.endTime)}+04:00`,
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: v.name,
              address: { "@type": "PostalAddress", streetAddress: v.location.hotelName, addressLocality: "Dubai", addressCountry: "AE" },
            },
            ...(ev.artist ? { performer: { "@type": "Person", name: ev.artist } } : {}),
            image: ev.poster,
          }),
        }}
      />

      <div className="mx-auto max-w-[1100px] px-4 py-10 md:px-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/?view=english-nights" className="hover:text-foreground">English Nights</Link>
          <span>/</span>
          <span className="text-foreground">{v.shortName} · {formatDateShort(ev.serviceDate)}</span>
        </nav>

        <div data-venue={v.slug} className="venue-bg overflow-hidden rounded-sm border border-border/40">
          {/* Hero */}
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <AssetImage
              src={ev.landscapeImage}
              file={`event_${v.slug}_english-night_${ev.serviceDate}_landscape.webp`}
              purpose={`English Night landscape image for ${ev.title}.`}
              dimensions="1600 × 900"
              crop="wide"
              venue={v.slug}
              alt={ev.title}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-transparent to-transparent" />
            {/* Date badge */}
            <div className="absolute bottom-5 left-5 flex flex-col items-center rounded-sm border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/80 px-3 py-2 backdrop-blur-sm">
              <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-accent)]">{weekday(ev.serviceDate)}</span>
              <span className="font-serif-display text-2xl leading-none text-[var(--venue-foreground)] tnum">{dayNum(ev.serviceDate)}</span>
              <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-[var(--venue-muted)]">{monthShort(ev.serviceDate)}</span>
            </div>
            {/* Instagram source */}
            <a
              href={ev.permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_map", { id: ev.id, source: "english_night_ig" })}
              className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/80 px-3 py-1.5 backdrop-blur-sm hover:border-[var(--venue-accent)]/40"
            >
              <Instagram className="h-3.5 w-3.5 text-[var(--venue-accent)]" />
              <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-foreground)]">{ev.accountHandle}</span>
            </a>
          </div>

          <div className="p-6 md:p-10">
            {/* Venue + import status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => { track("view_venue", { venue: v.slug, source: "english_night_detail" }); openVenueDrawer(v.slug); }}
                className="flex items-center gap-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
              >
                {v.shortName} · {v.location.floor}
                <ArrowUpRight className="h-3 w-3" />
              </button>
              <span className="flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-2.5 py-1 font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] text-green-300">
                <Check className="h-3 w-3" /> Instagram-imported · Published
              </span>
            </div>

            <h1 className="heading-editorial mt-3 text-3xl text-[var(--venue-foreground)] md:text-5xl">{ev.title}</h1>

            {/* Meta grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetaCell icon={<Calendar className="h-4 w-4" />} label="Service date" value={formatFullDate(ev.serviceDate)} />
              <MetaCell icon={<Clock className="h-4 w-4" />} label="Doors" value={`${ev.startTime} – ${ev.endTime}`} />
              <MetaCell icon={<Music2 className="h-4 w-4" />} label="Music" value={ev.music.join(" · ")} />
              <MetaCell icon={<MapPin className="h-4 w-4" />} label="Location" value={`${v.location.hotelName}`} />
            </div>

            {/* Description */}
            <section className="mt-8">
              <h2 className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">About this English Night</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--venue-foreground)]/85 md:text-base">{ev.description}</p>
              {ev.artist && (
                <p className="mt-3 text-sm text-[var(--venue-muted)]">
                  <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em]">DJ / Performer · </span>
                  {ev.artist}
                </p>
              )}
            </section>

            {/* Entry / dress / age */}
            <section className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoPill icon={<DoorOpen className="h-4 w-4" />} title="Entry" value={ev.entryInfo} />
              <InfoPill icon={<Shirt className="h-4 w-4" />} title="Dress code" value={ev.dressCode} />
              <InfoPill icon={<ShieldCheck className="h-4 w-4" />} title="Age" value={ev.agePolicy} />
            </section>

            {/* Table info — Contact Concierge */}
            <section className="mt-6 rounded-sm border border-[var(--venue-foreground)]/10 bg-[var(--venue-surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-muted)]">VIP Tables</span>
                <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)]">Contact Concierge</span>
              </div>
              <p className="mt-2 text-xs text-[var(--venue-muted)]">
                Minimum spend is not published until verified. Availability is shown only when live table data is connected —
                we never display fake availability or a fake sold-out state.
              </p>
            </section>

            {/* Sample data notice */}
            {ev.sample && (
              <div className="mt-4 rounded-sm border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="font-mono-tight text-[0.5625rem] text-amber-200/80">
                  <AlertCircle className="mr-1 inline h-3 w-3" />
                  Sample data — imported from a mock Instagram post. Real imports require the production Instagram Graph API adapter.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-2">
              <Button
                onClick={() => { track("start_vip_inquiry", { venue: v.slug, event: ev.id, source: "english_night_detail" }); openBooking({ venue: v.slug, eventOrDate: ev.title }); }}
                className="flex-1 rounded-none bg-[var(--venue-accent)] py-3 text-[var(--venue-bg)] hover:opacity-90"
              >
                <CalendarCheck className="mr-2 h-4 w-4" /> Request VIP
              </Button>
              <Button
                onClick={() => track("click_whatsapp", { id: ev.id, source: "english_night_detail" })}
                variant="outline"
                className="rounded-none border-[var(--venue-foreground)]/20 px-4 text-[var(--venue-foreground)]"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button onClick={addToCalendar} variant="outline" className="rounded-none border-[var(--venue-foreground)]/20 px-4 text-[var(--venue-foreground)]">
                <CalendarPlus className="h-4 w-4" />
              </Button>
              <Button onClick={share} variant="outline" className="rounded-none border-[var(--venue-foreground)]/20 px-4 text-[var(--venue-foreground)]">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Location */}
            <section className="mt-8">
              <h2 className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">Location & arrival</h2>
              <div className="mt-3 rounded-sm border border-[var(--venue-foreground)]/10 p-4">
                <p className="text-sm text-[var(--venue-foreground)]">{v.location.hotelName} · {v.location.floor}</p>
                <p className="mt-1 text-xs text-[var(--venue-muted)]">{ev.location.entranceInstructions}</p>
                <a
                  href={`https://www.google.com/maps?q=${ev.location.coordinates.lat},${ev.location.coordinates.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => track("click_map", { id: ev.id, source: "english_night_detail" })}
                  className="mt-2 inline-flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
                >
                  <MapPin className="h-3 w-3" /> Open in Maps
                </a>
              </div>
            </section>

            {/* Source post */}
            <section className="mt-8 rounded-sm border border-[var(--venue-foreground)]/10 bg-[var(--venue-surface)] p-4">
              <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-muted)]">Source</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-[var(--venue-accent)]" />
                  <span className="text-sm text-[var(--venue-foreground)]">{ev.accountHandle}</span>
                </div>
                <a
                  href={ev.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
                >
                  View post <ArrowUpRight className="ml-1 inline h-3 w-3" />
                </a>
              </div>
              <p className="mt-2 font-mono-tight text-[0.5625rem] text-[var(--venue-muted)]">
                Media ID: {ev.mediaId}
              </p>
            </section>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link href="/?view=english-nights">
            <Button variant="outline" className="rounded-none border-foreground/30">
              <ArrowLeft className="mr-2 h-4 w-4" /> All English Nights
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetaCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[var(--venue-foreground)]/10 p-3">
      <div className="flex items-center gap-2 text-[var(--venue-accent)]">
        {icon}
        <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-1.5 text-sm text-[var(--venue-foreground)]">{value}</p>
    </div>
  );
}

function InfoPill({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-sm border border-[var(--venue-foreground)]/10 p-3">
      <div className="flex items-center gap-2 text-[var(--venue-accent)]">
        {icon}
        <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.18em]">{title}</span>
      </div>
      <p className="mt-1.5 text-xs text-[var(--venue-muted)]">{value}</p>
    </div>
  );
}

function weekday(d: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", weekday: "short" }).format(new Date(`${d}T12:00:00Z`));
}
function dayNum(d: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "2-digit" }).format(new Date(`${d}T12:00:00Z`));
}
function monthShort(d: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dubai", month: "short" }).format(new Date(`${d}T12:00:00Z`));
}
function formatDateShort(d: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short" }).format(new Date(`${d}T12:00:00Z`));
}
function formatFullDate(d: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));
}
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
function toICS(date: string, time: string): string {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  const d = new Date(`${date}T00:00:00Z`);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${mo}${da}T${String(h).padStart(2, "0")}${min}00Z`;
}
