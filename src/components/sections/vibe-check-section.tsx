"use client";

import { useState } from "react";
import { Sparkles, Heart, Flame, Moon, Zap, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { track } from "@/lib/analytics";
import { useUi } from "@/lib/ui-store";

interface Vibe {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  icon: typeof Heart;
  matchVenue: "avenue" | "ora" | "blacktape";
  matchReason: string;
}

const VIBES: Vibe[] = [
  {
    id: "social",
    label: "Social",
    emoji: "🥂",
    desc: "Table culture, conversation, control.",
    icon: Heart,
    matchVenue: "avenue",
    matchReason: "Avenue's elevated table culture and skyline views fit a social night.",
  },
  {
    id: "immersive",
    label: "Immersive",
    emoji: "🌀",
    desc: "Visuals, light, movement.",
    icon: Sparkles,
    matchVenue: "ora",
    matchReason: "Ora's immersive projection system moves with the music.",
  },
  {
    id: "energy",
    label: "High Energy",
    emoji: "⚡",
    desc: "Peak crowd, peak sound.",
    icon: Zap,
    matchVenue: "blacktape",
    matchReason: "Black Tape's urban energy hits hardest on headline nights.",
  },
  {
    id: "late",
    label: "Late Night",
    emoji: "🌙",
    desc: "After midnight, until close.",
    icon: Moon,
    matchVenue: "blacktape",
    matchReason: "Black Tape carries the room to close on the right nights.",
  },
  {
    id: "arabic",
    label: "Arabic Night",
    emoji: "🪕",
    desc: "Khaleeji, live percussion.",
    icon: Heart,
    matchVenue: "avenue",
    matchReason: "Avenue leads with Arabic and Khaleeji nights with live percussion.",
  },
  {
    id: "hiphop",
    label: "Hip Hop / R&B",
    emoji: "🎧",
    desc: "Sharp urban, no filler.",
    icon: Flame,
    matchVenue: "blacktape",
    matchReason: "Black Tape is the clear hip hop and R&B identity in the group.",
  },
];

/**
 * VibeCheck — quick interactive mood selector.
 *
 * A fun, lightweight feature: pick a vibe, get matched to a venue, and jump
 * straight to that venue's drawer. Not a replacement for the full Find My
 * Venue matcher — just a fast, playful way to explore.
 */
export function VibeCheckSection() {
  const { openVenueDrawer } = useUi();
  const [selected, setSelected] = useState<Vibe | null>(null);

  const selectVibe = (vibe: Vibe) => {
    setSelected(vibe);
    track("complete_venue_matcher", { source: "vibe_check", vibe: vibe.id, venue: vibe.matchVenue });
  };

  const reset = () => {
    setSelected(null);
    track("filter_events", { source: "vibe_check", action: "reset" });
  };

  const matchedVenue = selected ? venues.find((v) => v.slug === selected.matchVenue) : null;

  return (
    <section id="vibe-check" className="relative border-t border-border/40 bg-secondary/10">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
        {/* Header */}
        <div className="text-center">
          <span className="eyebrow text-accent">
            <Sparkles className="mr-1 inline h-3 w-3" />
            Vibe Check
          </span>
          <h2 className="heading-editorial mt-3 text-3xl text-foreground md:text-5xl">
            What's your tonight?
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground md:text-base">
            Pick a vibe. We'll match you to the venue that fits. Quick, fun, no commitment.
          </p>
        </div>

        {!selected ? (
          /* Vibe selector grid */
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            {VIBES.map((vibe) => {
              const Icon = vibe.icon;
              return (
                <button
                  key={vibe.id}
                  onClick={() => selectVibe(vibe)}
                  className="group flex flex-col items-center gap-2 rounded-sm border border-border/40 bg-card p-5 text-center transition-all hover:border-accent/40 hover:bg-accent/5"
                >
                  <span className="text-3xl">{vibe.emoji}</span>
                  <span className="font-serif-display text-base text-foreground group-hover:text-accent">
                    {vibe.label}
                  </span>
                  <span className="text-[0.6875rem] text-muted-foreground">{vibe.desc}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Result */
          <div className="mx-auto mt-10 max-w-2xl">
            {matchedVenue && (
              <div
                data-venue={matchedVenue.slug}
                className="venue-surface overflow-hidden rounded-sm border border-[var(--venue-foreground)]/15"
              >
                {/* Match banner */}
                <div className="border-b border-[var(--venue-foreground)]/10 p-6 text-center">
                  <span className="text-4xl">{selected.emoji}</span>
                  <p className="mt-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">
                    Your vibe: {selected.label}
                  </p>
                  <h3 className="heading-editorial mt-2 text-3xl text-[var(--venue-foreground)]">
                    {matchedVenue.shortName}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--venue-muted)]">
                    {selected.matchReason}
                  </p>
                </div>

                {/* Venue quick info */}
                <div className="grid grid-cols-3 gap-px bg-[var(--venue-foreground)]/10">
                  <div className="venue-bg p-3 text-center">
                    <p className="font-mono-tight text-[0.45rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">Floor</p>
                    <p className="mt-1 text-xs text-[var(--venue-foreground)]">{matchedVenue.location.floor}</p>
                  </div>
                  <div className="venue-bg p-3 text-center">
                    <p className="font-mono-tight text-[0.45rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">Music</p>
                    <p className="mt-1 truncate text-xs text-[var(--venue-foreground)]">{matchedVenue.genres.slice(0, 2).join(" · ")}</p>
                  </div>
                  <div className="venue-bg p-3 text-center">
                    <p className="font-mono-tight text-[0.45rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">Area</p>
                    <p className="mt-1 truncate text-xs text-[var(--venue-foreground)]">{matchedVenue.location.area}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4">
                  <button
                    onClick={() => {
                      track("view_venue", { venue: matchedVenue.slug, source: "vibe_check" });
                      openVenueDrawer(matchedVenue.slug);
                    }}
                    className="flex-1 rounded-none bg-[var(--venue-accent)] py-2.5 text-center font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-bg)] transition-opacity hover:opacity-90"
                  >
                    Explore {matchedVenue.shortName} <ArrowRight className="ml-1 inline h-3 w-3" />
                  </button>
                  <button
                    onClick={reset}
                    className="rounded-none border border-[var(--venue-foreground)]/20 px-4 py-2.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-foreground)] hover:bg-[var(--venue-foreground)]/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
