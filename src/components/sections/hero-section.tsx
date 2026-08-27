"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Sparkles, ArrowRight, CalendarCheck, MapPin, Music2, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { siteConfig } from "@/lib/site-config";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { getTonightOccurrences } from "@/lib/events-data";
import { Button } from "@/components/ui/button";
import { AssetImage } from "@/components/asset-image";
import { DoorsCountdown } from "@/components/doors-countdown";

const VENUE_ORDER = ["avenue", "ora", "blacktape"] as const;

export function HeroSection() {
  const { heroVenue, setHeroVenue, openBooking, openVenueDrawer } = useUi();
  const [auto, setAuto] = useState(true);
  const tonight = getTonightOccurrences();

  // Auto-cycle venues on desktop when not interacting.
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setHeroVenue(
        VENUE_ORDER[(VENUE_ORDER.indexOf(heroVenue) + 1) % VENUE_ORDER.length]
      );
    }, 6000);
    return () => clearInterval(t);
  }, [auto, heroVenue, setHeroVenue]);

  const active = venues.find((v) => v.slug === heroVenue)!;
  const tonightAtActive = tonight.find((e) => e.venue === heroVenue);

  return (
    <section
      id="top"
      className="relative min-h-[100svh] w-full overflow-hidden bg-background"
      aria-label="ABOVE MIDNIGHT DXB"
    >
      {/* Per-venue cinematic background layers */}
      <div className="absolute inset-0">
        {VENUE_ORDER.map((slug) => {
          const v = venues.find((x) => x.slug === slug)!;
          const isActive = slug === heroVenue;
          return (
            <div
              key={slug}
              data-venue={slug}
              className={cn(
                "light-sweep absolute inset-0 transition-opacity duration-1000",
                isActive ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={!isActive}
            >
              <div className="absolute inset-0" style={{ backgroundColor: v.theme.bg }} />
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(120% 80% at 75% 20%, ${v.theme.primary}33 0%, transparent 55%), radial-gradient(100% 70% at 15% 90%, ${v.theme.accent}1f 0%, transparent 60%)`,
                }}
              />
              <div className="grain absolute inset-0" />
            </div>
          );
        })}
      </div>

      {/* Content — split layout: left text, right venue visual panel */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col px-4 pb-24 pt-28 md:px-8 md:pt-36">
        {/* Eyebrow + tonight status */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span className="eyebrow text-accent">{siteConfig.eyebrow}</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-muted-foreground">
              {tonightAtActive
                ? `Live Tonight at ${active.shortName} — ${tonightAtActive.startTime}`
                : "No confirmed event tonight — Contact Concierge"}
            </span>
            {/* Doors countdown */}
            <div className="ml-2 hidden sm:block">
              <DoorsCountdown />
            </div>
          </div>
        </div>

        {/* Split: heading + CTAs (left) / venue visual panel (right) */}
        <div className="mt-auto grid items-end gap-10 lg:grid-cols-12">
          {/* Left: heading + CTAs */}
          <div className="lg:col-span-7">
            <h1 className="heading-editorial text-[2.5rem] leading-[1.02] text-foreground sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.5rem]">
              {siteConfig.heroHeading}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
              {siteConfig.heroSupporting}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#tonight">
                <Button
                  size="lg"
                  className="rounded-none bg-foreground px-7 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-background hover:bg-accent hover:text-background"
                  onClick={() => track("filter_events", { source: "hero_see_tonight" })}
                >
                  See Tonight
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#find-my-venue">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-none border-foreground/30 bg-transparent px-7 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:bg-foreground/10"
                  onClick={() => track("complete_venue_matcher", { source: "hero_find" })}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Find My Venue
                </Button>
              </a>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-none px-7 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-foreground hover:bg-foreground/5"
                onClick={() => {
                  track("start_vip_inquiry", { source: "hero_direct_vip" });
                  openBooking({ venue: active.slug });
                }}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                Direct VIP
              </Button>
            </div>
          </div>

          {/* Right: dedicated venue visual panel */}
          <div className="lg:col-span-5">
            <VenueVisualPanel
              active={active}
              tonightAtActive={tonightAtActive}
              onExplore={() => {
                setAuto(false);
                track("view_venue", { source: "hero_panel", venue: active.slug });
                openVenueDrawer(active.slug);
              }}
            />
          </div>
        </div>

        {/* Venue transition tabs */}
        <div className="mt-14 grid grid-cols-1 gap-px border-t border-border/40 pt-8 sm:grid-cols-3">
          {VENUE_ORDER.map((slug) => {
            const v = venues.find((x) => x.slug === slug)!;
            const isActive = slug === heroVenue;
            return (
              <button
                key={slug}
                data-venue={slug}
                onMouseEnter={() => { setAuto(false); setHeroVenue(slug); }}
                onFocus={() => { setAuto(false); setHeroVenue(slug); }}
                onClick={() => {
                  setAuto(false);
                  setHeroVenue(slug);
                  track("view_venue", { source: "hero_tab", venue: slug });
                  openVenueDrawer(slug);
                }}
                className={cn(
                  "group relative -mx-2 px-2 py-3 text-left transition-colors sm:mx-0 sm:px-4",
                  isActive ? "" : "opacity-60 hover:opacity-100"
                )}
                aria-pressed={isActive}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="font-serif-display text-lg transition-colors"
                    style={{ color: isActive ? v.theme.accent : "var(--foreground)" }}
                  >
                    {v.shortName}
                  </span>
                  <span
                    className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]"
                    style={{ color: isActive ? v.theme.accent : "var(--muted-foreground)" }}
                  >
                    {v.location.floor}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                  {isActive ? v.supportingIdea : v.musicIdentity}
                </p>
                <span
                  className="absolute -top-px left-0 h-px transition-all duration-500"
                  style={{ width: isActive ? "100%" : "0%", backgroundColor: v.theme.accent }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#tonight"
        aria-label="Scroll to tonight"
        className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground md:flex lg:bottom-8"
      >
        <span className="eyebrow text-[0.5rem]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

function VenueVisualPanel({
  active,
  tonightAtActive,
  onExplore,
}: {
  active: typeof venues[0];
  tonightAtActive: ReturnType<typeof getTonightOccurrences>[0] | undefined;
  onExplore: () => void;
}) {
  return (
    <div
      data-venue={active.slug}
      className="venue-surface group relative overflow-hidden rounded-sm border border-[var(--venue-foreground)]/10"
    >
      {/* Visual — hero preview image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[4/5]">
        <AssetImage
          src={active.heroDesktop}
          file={`${active.slug}_hero_desktop.webp`}
          purpose={`Wide ${active.shortName} hero — crowd, lighting, and venue identity.`}
          dimensions="2400 × 1350"
          crop="desktop"
          venue={active.slug}
          alt={`${active.name} hero image`}
          className="h-full w-full transition-transform duration-1000 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] via-[var(--venue-bg)]/40 to-transparent" />
        {/* Color tint */}
        <div
          className="absolute inset-0 mix-blend-color opacity-30"
          style={{ backgroundColor: active.theme.primary }}
        />

        {/* Top overlay: venue name + floor */}
        <div className="absolute left-4 top-4 right-4 flex items-start justify-between">
          <div>
            <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em]" style={{ color: active.theme.accent }}>
              Now showing
            </p>
            <p className="mt-1 font-serif-display text-2xl text-[var(--venue-foreground)]">
              {active.shortName}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/70 px-2.5 py-1 backdrop-blur-sm">
            <MapPin className="h-3 w-3" style={{ color: active.theme.accent }} />
            <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] text-[var(--venue-foreground)]">
              {active.location.floor}
            </span>
          </div>
        </div>

        {/* Bottom overlay: tonight status + explore */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {tonightAtActive ? (
            <div className="mb-3 rounded-sm border border-[var(--venue-foreground)]/15 bg-[var(--venue-bg)]/60 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                </span>
                <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-green-300">
                  Live Tonight
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[var(--venue-foreground)] line-clamp-1">
                {tonightAtActive.title}
              </p>
              <div className="mt-1.5 flex items-center gap-3 font-mono-tight text-[0.5625rem] text-[var(--venue-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {tonightAtActive.startTime}
                </span>
                <span className="flex items-center gap-1">
                  <Music2 className="h-2.5 w-2.5" /> {tonightAtActive.music.slice(0, 2).join(" · ")}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-3 rounded-sm border border-[var(--venue-foreground)]/15 bg-[var(--venue-bg)]/60 p-3 backdrop-blur-sm">
              <p className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">
                Tonight
              </p>
              <p className="mt-1 text-xs text-[var(--venue-foreground)]/70">
                No confirmed event — contact concierge
              </p>
            </div>
          )}

          {/* Explore button */}
          <button
            onClick={onExplore}
            className="flex w-full items-center justify-between rounded-sm border border-[var(--venue-accent)]/40 bg-[var(--venue-accent)]/10 px-4 py-2.5 transition-colors hover:bg-[var(--venue-accent)]/20"
          >
            <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em]" style={{ color: active.theme.accent }}>
              Explore {active.shortName}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: active.theme.accent }} />
          </button>
        </div>
      </div>

      {/* Footer strip: music identity */}
      <div className="flex items-center justify-between border-t border-[var(--venue-foreground)]/10 px-4 py-2.5">
        <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">
          {active.genres.slice(0, 3).join(" · ")}
        </span>
        <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">
          {active.location.area}
        </span>
      </div>
    </div>
  );
}
