"use client";

import { useEffect } from "react";
import {
  X, MapPin, Clock, Music2, Calendar, ShieldCheck, Shirt, DoorOpen,
  CalendarCheck, MessageCircle, Share2, CalendarPlus, ArrowUpRight, AlertCircle,
} from "lucide-react";
import { useUi } from "@/lib/ui-store";
import { getOccurrence } from "@/lib/events-data";
import { getVenue } from "@/lib/venue-data";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { Button } from "@/components/ui/button";

export function EventDrawer() {
  const { eventDrawer, closeEventDrawer, openBooking, openVenueDrawer } = useUi();
  const ev = eventDrawer ? getOccurrence(eventDrawer) : null;

  useEffect(() => {
    if (eventDrawer && ev) {
      track("view_event", { id: ev.id, venue: ev.venue, source: "drawer" });
    }
  }, [eventDrawer, ev]);

  if (!ev) return null;
  const v = getVenue(ev.venue)!;

  const addToCalendar = () => {
    track("add_to_calendar", { id: ev.id, venue: ev.venue });
    // Build a simple .ics
    const start = toICS(ev.serviceDate, ev.startTime);
    const end = toICS(ev.serviceDate, ev.endTime);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ABOVE MIDNIGHT DXB//EN",
      "BEGIN:VEVENT", `UID:${ev.id}@above-midnight-dxb`,
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
    track("click_map", { id: ev.id, source: "event_share" });
    if (navigator.share) {
      navigator.share({ title: ev.title, text: ev.description, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={`${ev.title} details`}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={closeEventDrawer} />
      <div
        data-venue={v.slug}
        className="venue-bg absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-hidden shadow-2xl md:w-[640px]"
      >
        <div className="flex-1 overflow-y-auto">
          {/* Poster hero */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <AssetImage
              src={ev.landscapeImage}
              file={`event_${v.slug}_${ev.conceptSlug}_${ev.serviceDate}_landscape.webp`}
              purpose={`Event landscape image for ${ev.title}.`}
              dimensions="1600 × 900"
              crop="wide"
              venue={v.slug}
              alt={ev.title}
              className="h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-transparent to-transparent" />
            <button
              onClick={closeEventDrawer}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/70 text-[var(--venue-foreground)] backdrop-blur-sm hover:bg-[var(--venue-bg)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Date badge */}
            <div className="absolute bottom-4 left-5 flex flex-col items-center rounded-sm border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/80 px-3 py-2 backdrop-blur-sm">
              <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-accent)]">{weekday(ev.serviceDate)}</span>
              <span className="font-serif-display text-2xl leading-none text-[var(--venue-foreground)] tnum">{dayNum(ev.serviceDate)}</span>
              <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-[var(--venue-muted)]">{monthShort(ev.serviceDate)}</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Venue + status */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { track("view_venue", { venue: v.slug, source: "event_drawer" }); openVenueDrawer(v.slug); }}
                className="flex items-center gap-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
              >
                {v.shortName}
                <ArrowUpRight className="h-3 w-3" />
              </button>
              {ev.sample && (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] text-amber-300">Sample data</span>
              )}
            </div>

            <h2 className="heading-editorial mt-2 text-3xl text-[var(--venue-foreground)] md:text-4xl">{ev.title}</h2>

            {/* Meta grid */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MetaCell icon={<Calendar className="h-4 w-4" />} label="Service date" value={formatFullDate(ev.serviceDate)} />
              <MetaCell icon={<Clock className="h-4 w-4" />} label="Doors" value={`${ev.startTime} – ${ev.endTime}`} />
              <MetaCell icon={<Music2 className="h-4 w-4" />} label="Music" value={ev.music.join(" · ")} />
              <MetaCell icon={<MapPin className="h-4 w-4" />} label="Location" value={`${v.location.hotelName}, ${v.location.floor}`} />
            </div>

            {/* Description */}
            <section className="mt-8">
              <h3 className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">About this event</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--venue-foreground)]/85 md:text-[0.95rem]">{ev.description}</p>
              {ev.artist && (
                <p className="mt-3 text-sm text-[var(--venue-muted)]">
                  <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em]">Artist / DJ · </span>
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

            {/* Table info — only when verified */}
            <section className="mt-6 rounded-sm border border-[var(--venue-foreground)]/10 bg-[var(--venue-surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-muted)]">Tables</span>
                <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)]">Contact Concierge</span>
              </div>
              <p className="mt-2 text-xs text-[var(--venue-muted)]">
                {ev.tableInfo?.minSpend
                  ? `Minimum spend (verified): ${ev.tableInfo.minSpend}.`
                  : "Minimum spend is not published until verified. Availability is not shown until live table data is connected — we never display fake availability or a fake sold-out state."}
              </p>
              {ev.bookingCutoff && (
                <p className="mt-2 text-xs text-[var(--venue-muted)]">Booking cutoff: {ev.bookingCutoff}.</p>
              )}
            </section>

            {/* Sample data notice */}
            {ev.sample && (
              <div className="mt-4 rounded-sm border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="font-mono-tight text-[0.5625rem] text-amber-200/80">
                  <AlertCircle className="mr-1 inline h-3 w-3" />
                  This event is sample data, clearly labelled. Schedules, artists, and pricing require owner verification before production launch.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-2">
              <Button
                onClick={() => { track("start_vip_inquiry", { venue: v.slug, event: ev.id, source: "event_drawer" }); openBooking({ venue: v.slug, eventOrDate: ev.title }); }}
                className="flex-1 rounded-none bg-[var(--venue-accent)] py-3 text-[var(--venue-bg)] hover:opacity-90"
              >
                <CalendarCheck className="mr-2 h-4 w-4" /> Request VIP
              </Button>
              <Button
                onClick={() => track("click_whatsapp", { id: ev.id, source: "event_drawer" })}
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
              <h3 className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">Location & arrival</h3>
              <div className="mt-3 rounded-sm border border-[var(--venue-foreground)]/10 p-4">
                <p className="text-sm text-[var(--venue-foreground)]">{v.location.hotelName}</p>
                <p className="mt-1 text-xs text-[var(--venue-muted)]">{ev.location.entranceInstructions}</p>
                <a
                  href={`https://www.google.com/maps?q=${ev.location.coordinates.lat},${ev.location.coordinates.lng}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => track("click_map", { id: ev.id, source: "event_drawer" })}
                  className="mt-2 inline-flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
                >
                  <MapPin className="h-3 w-3" /> Open in Maps
                </a>
              </div>
            </section>
          </div>
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
function formatFullDate(d: string): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${d}T12:00:00Z`));
}
function toICS(date: string, time: string): string {
  // time like "11:30 PM"
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return "";
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  // For end times that are AM and after midnight, the service date stays the same (nightlife logic).
  const d = new Date(`${date}T00:00:00Z`);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${mo}${da}T${String(h).padStart(2, "0")}${min}00Z`;
}
