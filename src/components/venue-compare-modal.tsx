"use client";

import { useState } from "react";
import { GitCompare, X, Check, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import type { VenueRecord } from "@/lib/types";

type CompareField = {
  label: string;
  key: string;
  render: (v: VenueRecord) => React.ReactNode;
};

const FIELDS: CompareField[] = [
  {
    label: "Live Atmosphere",
    key: "video",
    render: (v) => v.heroVideo && !v.heroVideo.startsWith("/placeholders/") ? (
      <div className="relative aspect-square w-24 overflow-hidden rounded-sm border border-[var(--venue-foreground)]/20 shadow-md">
        <video src={v.heroVideo} autoPlay loop muted playsInline className="h-full w-full object-cover" />
        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 font-mono-tight text-[0.45rem] uppercase text-white">Reel</span>
      </div>
    ) : (
      <span className="text-xs text-muted-foreground">Photos only</span>
    ),
  },
  {
    label: "Music identity",
    key: "musicIdentity",
    render: (v) => v.musicIdentity,
  },
  {
    label: "Location",
    key: "location",
    render: (v) => `${v.location.hotelName}, ${v.location.floor}`,
  },
  {
    label: "Area",
    key: "area",
    render: (v) => v.location.area,
  },
  {
    label: "Signature nights",
    key: "concepts",
    render: (v) => v.signatureConcepts.map((c) => c.name).join(", "),
  },
  {
    label: "Music genres",
    key: "genres",
    render: (v) => v.genres.join(", "),
  },
  {
    label: "Dress code",
    key: "dress",
    render: (v) => v.dressCode.summary,
  },
  {
    label: "Minimum age",
    key: "age",
    render: (v) => `${v.agePolicy.minimumAge}+`,
  },
  {
    label: "ID required",
    key: "id",
    render: (v) => v.agePolicy.idRequired.join(", "),
  },
  {
    label: "Entry policy",
    key: "entry",
    render: (v) => v.entryPolicy.summary,
  },
  {
    label: "Table types",
    key: "tables",
    render: () => "Guest list · Standard · Premium · Stage/DJ · Private",
  },
  {
    label: "Parking",
    key: "parking",
    render: (v) => v.location.valetParking,
  },
];

export function VenueCompareModal() {
  const { openVenueDrawer, openConcierge } = useUi();
  const [selected, setSelected] = useState<string[]>(["avenue", "ora", "blacktape"]);
  const [open, setOpen] = useState(false);

  const selectedVenues = selected
    .map((s) => venues.find((v) => v.slug === s))
    .filter(Boolean) as VenueRecord[];

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          track("filter_events", { source: "compare_open" });
        }}
        className="group flex items-center gap-2 rounded-sm border border-border/60 bg-card/80 px-4 py-2.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground backdrop-blur-sm transition-colors hover:border-foreground/40 hover:text-foreground"
      >
        <GitCompare className="h-3.5 w-3.5" />
        Compare Venues
      </button>
    );
  }

  const toggleVenue = (slug: string) => {
    setSelected((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length < 3
        ? [...prev, slug]
        : prev // max 3
    );
  };

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label="Compare venues">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setOpen(false)} />
      <div className="relative z-10 mx-auto mt-[5vh] w-full max-w-5xl overflow-hidden rounded-lg border border-border/60 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div>
            <span className="eyebrow text-accent">Side by Side</span>
            <h2 className="mt-1 font-serif-display text-xl text-foreground">Compare Venues</h2>
          </div>
          <button onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Venue selector chips */}
        <div className="border-b border-border/40 p-4">
          <p className="mb-2 font-mono-tight text-[0.5rem] uppercase tracking-[0.18em] text-muted-foreground">
            Select up to 3 venues to compare
          </p>
          <div className="flex flex-wrap gap-2">
            {venues.map((v) => (
              <button
                key={v.slug}
                data-venue={v.slug}
                onClick={() => toggleVenue(v.slug)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
                  selected.includes(v.slug)
                    ? "border-[var(--venue-accent)] bg-[var(--venue-accent)]/10 text-[var(--venue-accent)]"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
                style={
                  selected.includes(v.slug)
                    ? { color: v.theme.accent, borderColor: `${v.theme.accent}66`, backgroundColor: `${v.theme.accent}1a` }
                    : undefined
                }
              >
                {selected.includes(v.slug) ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {v.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile horizontal scroll hint */}
        <div className="flex items-center justify-between px-4 pt-2 text-[0.5rem] font-mono-tight uppercase tracking-wider text-muted-foreground/70 sm:hidden">
          <span>Scroll horizontally to view all venues</span>
          <span>→</span>
        </div>

        {/* Comparison table */}
        <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[560px]">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border/40">
                <th className="w-40 p-4 text-left font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Field
                </th>
                {selectedVenues.map((v) => (
                  <th key={v.slug} className="p-4 text-left" data-venue={v.slug}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif-display text-base text-[var(--venue-foreground)]">
                        {v.shortName}
                      </span>
                      <span
                        className="font-mono-tight text-[0.5rem] uppercase tracking-[0.12em]"
                        style={{ color: v.theme.accent }}
                      >
                        {v.location.floor}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field, i) => (
                <tr key={field.key} className={cn("border-b border-border/20", i % 2 === 0 && "bg-secondary/20")}>
                  <td className="p-4 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground align-top">
                    {field.label}
                  </td>
                  {selectedVenues.map((v) => (
                    <td key={v.slug} className="p-4 text-sm text-foreground align-top" data-venue={v.slug}>
                      <span className="text-[var(--venue-foreground)]">{field.render(v)}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions footer */}
        <div className="border-t border-border/40 p-4 safe-pb">
          <div className="flex flex-wrap gap-2">
            {selectedVenues.map((v) => (
              <div key={v.slug} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    track("view_venue", { venue: v.slug, source: "compare_modal" });
                    openVenueDrawer(v.slug);
                  }}
                  className="rounded-sm border border-border px-3 py-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-foreground hover:bg-foreground/5"
                >
                  {v.shortName} <ArrowRight className="ml-1 inline h-2.5 w-2.5" />
                </button>
                <button
                  onClick={() => {
                    track("start_vip_inquiry", { venue: v.slug, source: "compare_modal" });
                    openConcierge({ venue: v.slug });
                  }}
                  className="rounded-sm border border-border px-3 py-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                >
                  VIP
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
