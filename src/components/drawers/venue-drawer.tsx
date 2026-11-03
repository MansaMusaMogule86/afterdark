"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Music2, Clock, ShieldCheck, DoorOpen, Car, Navigation, CalendarCheck, MessageCircle, Phone, Mail, ArrowUpRight, AlertCircle, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/ui-store";
import { getVenue, venues } from "@/lib/venue-data";
import { getOccurrencesByVenue } from "@/lib/events-data";
import { getTonightOccurrences } from "@/lib/events-data";
import { guideArticles } from "@/lib/guide-data";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { VenueHeroMedia } from "@/components/venue-hero-media";
import { Button } from "@/components/ui/button";
import { GalleryLightbox, type GalleryImage } from "@/components/gallery-lightbox";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export function VenueDrawer() {
  const { venueDrawer, closeVenueDrawer, openConcierge, openEventDrawer } = useUi();
  const venue = venueDrawer ? getVenue(venueDrawer) : null;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (venueDrawer) {
      track("view_venue", { venue: venueDrawer, source: "drawer" });
    }
  }, [venueDrawer]);

  if (!venue) return null;
  const v = venue;
  const tonight = getTonightOccurrences().find((e) => e.venue === v.slug);
  const upcoming = getOccurrencesByVenue(v.slug).slice(0, 4);
  const relatedArticles = guideArticles.filter((a) => a.relatedVenueSlugs.includes(v.slug)).slice(0, 3);
  const otherVenues = venues.filter((x) => x.slug !== v.slug);

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={`${v.name} details`}>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={closeVenueDrawer} />
      <div
        data-venue={v.slug}
        className="venue-bg absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-hidden shadow-2xl md:w-[640px]"
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <VenueHeroMedia
              venue={v}
              purpose={`Wide ${v.shortName} room — crowd, lighting, and venue identity.`}
              alt={`${v.name} hero`}
              className="h-full w-full"
              allowSound
              showBadge
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-transparent to-transparent" />
            <button
              onClick={closeVenueDrawer}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/70 text-[var(--venue-foreground)] backdrop-blur-sm hover:bg-[var(--venue-bg)]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Logo placeholder */}
            <div className="absolute bottom-4 left-5 w-28">
              <AssetImage
                src={v.logoLight}
                file={`${v.slug}_logo_light.svg`}
                purpose={`${v.shortName} logo.`}
                crop="svg"
                venue={v.slug}
                alt={`${v.name} logo`}
                variant="logo"
                className="h-12 w-28"
              />
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Identity */}
            <div className="flex items-center gap-2">
              <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">
                {v.location.floor} · {v.location.area}
              </span>
            </div>
            <h2 className="heading-editorial mt-2 text-3xl text-[var(--venue-foreground)] md:text-4xl">{v.name}</h2>
            <p className="mt-3 text-sm text-[var(--venue-muted)] md:text-base">{v.musicIdentity}</p>

            {/* Tonight status */}
            <div className="mt-6 rounded-sm border border-[var(--venue-foreground)]/10 bg-[var(--venue-surface)] p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-muted)]">Tonight status</span>
                {tonight ? (
                  <span className="rounded-full border border-green-400/30 bg-green-400/10 px-2 py-0.5 font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] text-green-300">Live</span>
                ) : (
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">No confirmed event</span>
                )}
              </div>
              {tonight ? (
                <p className="mt-2 text-sm text-[var(--venue-foreground)]">{tonight.title} — doors {tonight.startTime}</p>
              ) : (
                <p className="mt-2 text-sm text-[var(--venue-muted)]">Contact concierge for the current schedule.</p>
              )}
            </div>

            {/* Description */}
            <section className="mt-8">
              <SectionLabel>About the venue</SectionLabel>
              <div className="mt-3 space-y-3">
                {v.description.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[var(--venue-foreground)]/85 md:text-[0.95rem]">{p}</p>
                ))}
              </div>
            </section>

            {/* Music identity */}
            <section className="mt-8">
              <SectionLabel>Music identity</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {v.genres.map((g) => (
                  <span key={g} className="rounded-full border border-[var(--venue-accent)]/30 px-3 py-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-[var(--venue-accent)]">
                    {g}
                  </span>
                ))}
              </div>
            </section>

            {/* Signature concepts */}
            <section className="mt-8">
              <SectionLabel>Signature nights</SectionLabel>
              <div className="mt-3 space-y-3">
                {v.signatureConcepts.map((c) => (
                  <div key={c.name} className="rounded-sm border border-[var(--venue-foreground)]/10 p-4">
                    <h4 className="font-serif-display text-base text-[var(--venue-foreground)]">{c.name}</h4>
                    <p className="mt-1 text-sm text-[var(--venue-muted)]">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming events */}
            <section className="mt-8">
              <SectionLabel>Upcoming events</SectionLabel>
              <div className="mt-3 space-y-2">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-[var(--venue-muted)]">No confirmed events in the next 10 days.</p>
                ) : (
                  upcoming.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => { track("view_event", { id: ev.id, source: "venue_drawer" }); openEventDrawer(ev.id); }}
                      className="flex w-full items-center justify-between gap-3 rounded-sm border border-[var(--venue-foreground)]/10 p-3 text-left transition-colors hover:border-[var(--venue-accent)]/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono-tight tnum text-[0.6875rem] text-[var(--venue-accent)]">{formatDateShort(ev.serviceDate)}</span>
                        <span className="text-sm text-[var(--venue-foreground)]">{ev.title}</span>
                      </div>
                      <span className="font-mono-tight text-[0.625rem] text-[var(--venue-muted)]">{ev.startTime}</span>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Gallery */}
            <section className="mt-8">
              <div className="flex items-center justify-between">
                <SectionLabel>Gallery</SectionLabel>
                <button
                  onClick={() => setLightboxIndex(0)}
                  className="flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
                >
                  <Maximize2 className="h-3 w-3" /> View all
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {v.gallery.slice(0, 6).map((g, i) => (
                  <button
                    key={g}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-[3/4] w-full overflow-hidden"
                    aria-label={`Open gallery image ${i + 1}`}
                  >
                    <AssetImage
                      src={g}
                      file={`${v.slug}_gallery_${String(i + 1).padStart(2, "0")}.webp`}
                      purpose={`${v.shortName} gallery image ${i + 1}.`}
                      dimensions="1600 × 2000"
                      crop="portrait"
                      venue={v.slug}
                      alt={`${v.name} gallery ${i + 1}`}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)]/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <Maximize2 className="absolute bottom-2 right-2 h-3.5 w-3.5 text-[var(--venue-accent)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </section>

            {/* VIP + Floor plan */}
            <section className="mt-8">
              <SectionLabel>VIP table experience</SectionLabel>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <AssetImage
                  src={v.gallery[3]}
                  file={`${v.slug}_vip_table.webp`}
                  purpose={`Real ${v.shortName} VIP table and sightline.`}
                  dimensions="1600 × 2000"
                  crop="portrait"
                  venue={v.slug}
                  alt={`${v.name} VIP table`}
                  className="aspect-[4/3] w-full"
                />
                <AssetImage
                  src={v.floorplan}
                  file={`${v.slug}_floorplan.svg`}
                  purpose={`Accurate ${v.shortName} seating and table plan.`}
                  crop="svg"
                  venue={v.slug}
                  alt={`${v.name} floor plan`}
                  className="aspect-[4/3] w-full"
                />
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-[var(--venue-muted)]">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Capacities, minimum spends, inclusions, and table names are shown only when verified. The floor plan above is a placeholder until the real plan is supplied.
              </p>
              <Button
                onClick={() => { track("start_vip_inquiry", { venue: v.slug, source: "venue_drawer" }); openConcierge({ venue: v.slug }); }}
                className="mt-3 rounded-none bg-[var(--venue-accent)] px-5 text-[var(--venue-bg)] hover:opacity-90"
              >
                <CalendarCheck className="mr-2 h-4 w-4" /> Request VIP Table
              </Button>
            </section>

            {/* Practical info grid */}
            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard icon={<DoorOpen className="h-4 w-4" />} title="Dress code">
                <p className="text-sm text-[var(--venue-foreground)]/85">{v.dressCode.summary}</p>
                <p className="mt-2 text-xs text-[var(--venue-muted)]">Accepted: {v.dressCode.accepted.join(", ")}.</p>
                <p className="text-xs text-[var(--venue-muted)]">Not accepted: {v.dressCode.notAccepted.join(", ")}.</p>
              </InfoCard>
              <InfoCard icon={<ShieldCheck className="h-4 w-4" />} title="Age & ID">
                <p className="text-sm text-[var(--venue-foreground)]/85">{v.agePolicy.minimumAge}+. Original ID required.</p>
                <p className="mt-2 text-xs text-[var(--venue-muted)]">{v.agePolicy.idRequired.join(", ")}.</p>
                <p className="text-xs text-[var(--venue-muted)]">{v.agePolicy.notes}</p>
              </InfoCard>
              <InfoCard icon={<DoorOpen className="h-4 w-4" />} title="Entry policy">
                <p className="text-sm text-[var(--venue-foreground)]/85">{v.entryPolicy.summary}</p>
                <p className="mt-2 text-xs text-[var(--venue-muted)]">{v.entryPolicy.guestList}</p>
              </InfoCard>
              <InfoCard icon={<MapPin className="h-4 w-4" />} title="Location & arrival">
                <p className="text-sm text-[var(--venue-foreground)]/85">{v.location.hotelName}, {v.location.floor}</p>
                <p className="mt-1 text-xs text-[var(--venue-muted)]">{v.location.entranceInstructions}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={`https://www.google.com/maps?q=${v.location.coordinates.lat},${v.location.coordinates.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => track("click_map", { venue: v.slug, source: "venue_drawer" })}
                    className="flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
                  >
                    <Navigation className="h-3 w-3" /> Open Map
                  </a>
                </div>
              </InfoCard>
              <InfoCard icon={<Car className="h-4 w-4" />} title="Parking & valet">
                <p className="text-xs text-[var(--venue-muted)]">{v.location.valetParking}</p>
                <p className="mt-1 text-xs text-[var(--venue-muted)]">{v.location.taxiInstructions}</p>
                <p className="mt-1 text-xs text-[var(--venue-muted)]">{v.location.metroNote}</p>
              </InfoCard>
              <InfoCard icon={<Clock className="h-4 w-4" />} title="Opening hours">
                <ul className="space-y-1">
                  {v.openingHours.map((h) => (
                    <li key={h.day} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--venue-foreground)]/85">{h.day}</span>
                      <span className={cn("font-mono-tight", h.status === "closed" ? "text-[var(--venue-muted)]" : "text-[var(--venue-accent)]")}>
                        {h.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
            </section>

            {/* Verification notice */}
            <div className="mt-6 rounded-sm border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="font-mono-tight text-[0.5625rem] text-amber-200/80">
                <AlertCircle className="mr-1 inline h-3 w-3" />
                Venue facts pending verification. Phone, email, opening hours, and minimum spends are not published until confirmed by the owner.
              </p>
            </div>

            {/* FAQ */}
            <section className="mt-8">
              <SectionLabel>Frequently asked</SectionLabel>
              <Accordion type="single" collapsible className="mt-3">
                <AccordionItem value="q1" className="border-[var(--venue-foreground)]/10">
                  <AccordionTrigger className="text-left text-sm text-[var(--venue-foreground)]">What time should I arrive?</AccordionTrigger>
                  <AccordionContent className="text-xs text-[var(--venue-muted)]">Doors typically open around 11 PM. Table guests should arrive at their stated arrival time. Guest list entry closes at the nightly cutoff — arrive before it.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="q2" className="border-[var(--venue-foreground)]/10">
                  <AccordionTrigger className="text-left text-sm text-[var(--venue-foreground)]">What ID do I need?</AccordionTrigger>
                  <AccordionContent className="text-xs text-[var(--venue-muted)]">Original passport, UAE driving licence, or UAE national ID. Photocopies and digital IDs are not accepted.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="q3" className="border-[var(--venue-foreground)]/10">
                  <AccordionTrigger className="text-left text-sm text-[var(--venue-foreground)]">Is there a dress code?</AccordionTrigger>
                  <AccordionContent className="text-xs text-[var(--venue-muted)]">{v.dressCode.summary} Sportswear, flip flops, shorts, and beachwear are not accepted.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="q4" className="border-[var(--venue-foreground)]/10">
                  <AccordionTrigger className="text-left text-sm text-[var(--venue-foreground)]">How do I book a table?</AccordionTrigger>
                  <AccordionContent className="text-xs text-[var(--venue-muted)]">Submit a VIP request through the concierge. We confirm availability, minimum spend, and table location, then issue a booking reference.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Contact (placeholder until verified) */}
            <section className="mt-8">
              <SectionLabel>Contact</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => track("click_whatsapp", { venue: v.slug, source: "venue_drawer" })}
                  className="rounded-none border-[var(--venue-foreground)]/20 text-[var(--venue-foreground)] hover:bg-[var(--venue-foreground)]/10"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
                <Button variant="outline" disabled className="rounded-none border-[var(--venue-foreground)]/20 text-[var(--venue-muted)] opacity-60">
                  <Phone className="mr-2 h-4 w-4" /> Phone (pending)
                </Button>
                <Button variant="outline" disabled className="rounded-none border-[var(--venue-foreground)]/20 text-[var(--venue-muted)] opacity-60">
                  <Mail className="mr-2 h-4 w-4" /> Email (pending)
                </Button>
              </div>
            </section>

            {/* Related Night Edit */}
            {relatedArticles.length > 0 && (
              <section className="mt-8">
                <SectionLabel>From The Night Edit</SectionLabel>
                <div className="mt-3 space-y-2">
                  {relatedArticles.map((a) => (
                    <a
                      key={a.slug}
                      href="#night-edit"
                      onClick={() => track("view_event", { article: a.slug, source: "venue_drawer" })}
                      className="flex items-center justify-between gap-3 rounded-sm border border-[var(--venue-foreground)]/10 p-3 transition-colors hover:border-[var(--venue-accent)]/40"
                    >
                      <span className="text-sm text-[var(--venue-foreground)]">{a.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-[var(--venue-muted)]" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Other venues */}
            <section className="mt-8 border-t border-[var(--venue-foreground)]/10 pt-6">
              <SectionLabel>Other venues</SectionLabel>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {otherVenues.map((ov) => (
                  <button
                    key={ov.slug}
                    data-venue={ov.slug}
                    onClick={() => { track("view_venue", { venue: ov.slug, source: "venue_drawer_other" }); useUi.getState().openVenueDrawer(ov.slug); }}
                    className="venue-surface rounded-sm border border-[var(--venue-foreground)]/10 p-3 text-left transition-colors hover:border-[var(--venue-accent)]/40"
                  >
                    <p className="font-serif-display text-sm text-[var(--venue-foreground)]">{ov.shortName}</p>
                    <p className="mt-0.5 text-[0.625rem] text-[var(--venue-muted)]">{ov.location.floor}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Sticky bottom CTA */}
        <div className="venue-surface flex items-center gap-2 border-t border-[var(--venue-foreground)]/10 p-4 safe-pb">
          <Button
            onClick={() => { track("start_vip_inquiry", { venue: v.slug, source: "venue_drawer_cta" }); openConcierge({ venue: v.slug }); }}
            className="flex-1 rounded-none bg-[var(--venue-accent)] py-3 text-[var(--venue-bg)] hover:opacity-90"
          >
            <CalendarCheck className="mr-2 h-4 w-4" /> Request VIP
          </Button>
          <Button
            variant="outline"
            onClick={() => track("click_whatsapp", { venue: v.slug, source: "venue_drawer_cta" })}
            className="rounded-none border-[var(--venue-foreground)]/20 px-4 text-[var(--venue-foreground)]"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gallery Lightbox */}
      <GalleryLightbox
        images={v.gallery.map((g, i) => ({
          src: g,
          file: `${v.slug}_gallery_${String(i + 1).padStart(2, "0")}.webp`,
          purpose: `${v.shortName} gallery image ${i + 1}.`,
          dimensions: "1600 × 2000",
          venue: v.slug,
          alt: `${v.name} gallery ${i + 1}`,
        }))}
        open={lightboxIndex !== null}
        initialIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">
      {children}
    </h3>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--venue-foreground)]/10 p-4">
      <div className="flex items-center gap-2 text-[var(--venue-accent)]">
        {icon}
        <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em]">{title}</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function formatDateShort(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short" }).format(d);
}
