"use client";

import { useMemo } from "react";
import { ArrowUpRight, MapPin, Music2, Clock, CalendarCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { getTonightOccurrences } from "@/lib/events-data";
import { getServiceDateLabel } from "@/lib/tonight";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import type { EventOccurrence } from "@/lib/types";

export function TonightSection() {
  const { openEventDrawer, openBooking, openVenueDrawer } = useUi();

  // Compute once; service date is stable across server/client (Asia/Dubai date).
  const { label, longLabel } = useMemo(() => getServiceDateLabel(), []);
  const tonight = useMemo(() => getTonightOccurrences(), []);

  return (
    <section id="tonight" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Section header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Tonight in Dubai</span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              {label}
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              {longLabel}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 px-4 py-3">
            <Info className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              Service day resets at 6:00 AM Dubai time.
            </p>
          </div>
        </div>

        {/* Venue tonight cards */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 md:grid-cols-3">
          {venues.map((v) => {
            const ev = tonight.find((e) => e.venue === v.slug);
            return (
              <div
                key={v.slug}
                data-venue={v.slug}
                className="venue-surface group relative flex flex-col"
              >
                {/* Top: venue identity + status */}
                <div className="flex items-center justify-between border-b border-[var(--venue-foreground)]/10 p-5">
                  <div>
                    <p className="font-serif-display text-xl text-[var(--venue-foreground)]">
                      {v.shortName}
                    </p>
                    <p className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">
                      {v.location.hotelName}
                    </p>
                  </div>
                  <StatusPill status={ev ? ev.status : "closed"} />
                </div>

                {/* Event info */}
                <div className="flex flex-1 flex-col p-5">
                  {ev ? (
                    <>
                      <button
                        onClick={() => {
                          track("view_event", { id: ev.id, venue: v.slug, source: "tonight" });
                          openEventDrawer(ev.id);
                        }}
                        className="text-left"
                      >
                        <h3 className="font-serif-display text-lg leading-snug text-[var(--venue-foreground)] transition-colors group-hover:text-[var(--venue-accent)]">
                          {ev.title}
                        </h3>
                      </button>

                      <div className="mt-4 space-y-2.5">
                        <Row icon={<Music2 className="h-3.5 w-3.5" />} label="Music" value={ev.music.join(" · ")} venue={v.slug} />
                        <Row icon={<Clock className="h-3.5 w-3.5" />} label="Doors" value={`${ev.startTime} – ${ev.endTime}`} venue={v.slug} />
                        <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={`${v.location.hotelName}, ${v.location.floor}`} venue={v.slug} />
                      </div>

                      {/* Availability — never fake. */}
                      <div className="mt-4 flex items-center gap-2 rounded-sm border border-[var(--venue-foreground)]/10 bg-[var(--venue-bg)]/50 px-3 py-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--venue-accent)]" />
                        <span className="font-mono-tight text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
                          Table availability · Contact Concierge
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={() => {
                            track("view_event", { id: ev.id, source: "tonight_details" });
                            openEventDrawer(ev.id);
                          }}
                          className="flex-1 rounded-none border border-[var(--venue-foreground)]/20 py-2.5 text-center font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--venue-foreground)] transition-colors hover:bg-[var(--venue-foreground)]/10"
                        >
                          Event Details
                        </button>
                        <button
                          onClick={() => {
                            track("start_vip_inquiry", { venue: v.slug, source: "tonight" });
                            openBooking({ venue: v.slug, eventOrDate: ev.title });
                          }}
                          className="flex-1 rounded-none bg-[var(--venue-accent)] py-2.5 text-center font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--venue-bg)] transition-opacity hover:opacity-90"
                        >
                          Request VIP
                        </button>
                      </div>
                    </>
                  ) : (
                    <NoEventState venueSlug={v.slug} onVenue={() => openVenueDrawer(v.slug)} />
                  )}
                </div>

                {/* Subtle poster strip */}
                <div className="relative h-20 overflow-hidden border-t border-[var(--venue-foreground)]/10">
                  <AssetImage
                    src={v.gallery[0]}
                    file={`${v.slug}_gallery_01.webp`}
                    purpose={`${v.shortName} gallery image.`}
                    dimensions="1600 × 2000"
                    crop="portrait"
                    venue={v.slug}
                    alt={`${v.name} gallery`}
                    className="h-full w-full opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] to-transparent" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Row({
  icon,
  label,
  value,
  venue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  venue: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[var(--venue-muted)]" data-venue={venue}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-muted)]">
          {label}
        </p>
        <p className="truncate text-sm text-[var(--venue-foreground)]">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: EventOccurrence["status"] | "closed" }) {
  const map: Record<string, { label: string; cls: string }> = {
    live: { label: "Live Tonight", cls: "text-green-400 border-green-400/30 bg-green-400/10" },
    scheduled: { label: "Scheduled", cls: "text-accent border-accent/30 bg-accent/10" },
    sold_out: { label: "Sold Out", cls: "text-red-400 border-red-400/30 bg-red-400/10" },
    postponed: { label: "Postponed", cls: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
    cancelled: { label: "Cancelled", cls: "text-red-400 border-red-400/30 bg-red-400/10" },
    completed: { label: "Completed", cls: "text-muted-foreground border-border" },
    closed: { label: "Closed Tonight", cls: "text-muted-foreground border-border bg-secondary/40" },
  };
  const s = map[status] ?? map.closed;
  return (
    <span className={cn("rounded-full border px-2.5 py-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em]", s.cls)}>
      {s.label}
    </span>
  );
}

function NoEventState({ venueSlug, onVenue }: { venueSlug: string; onVenue: () => void }) {
  return (
    <div data-venue={venueSlug} className="flex flex-1 flex-col">
      <h3 className="font-serif-display text-lg text-[var(--venue-foreground)]">
        No confirmed event tonight
      </h3>
      <p className="mt-2 text-sm text-[var(--venue-muted)]">
        Tonight's schedule for this venue is pending verification. Contact the concierge for the current status.
      </p>
      <div className="mt-auto flex gap-2 pt-5">
        <button
          onClick={onVenue}
          className="flex-1 rounded-none border border-[var(--venue-foreground)]/20 py-2.5 text-center font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--venue-foreground)] hover:bg-[var(--venue-foreground)]/10"
        >
          <ArrowUpRight className="mr-1 inline h-3 w-3" />
          View Venue
        </button>
        <button
          onClick={() => track("click_whatsapp", { venue: venueSlug, source: "tonight_no_event" })}
          className="flex-1 rounded-none bg-[var(--venue-accent)] py-2.5 text-center font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--venue-bg)] hover:opacity-90"
        >
          Contact Concierge
        </button>
      </div>
    </div>
  );
}
