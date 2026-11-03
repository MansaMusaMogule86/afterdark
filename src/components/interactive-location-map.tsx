"use client";

import { useState } from "react";
import { MapPin, Building2, Navigation, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { locationRecords, venues } from "@/lib/venue-data";
import { track } from "@/lib/analytics";

/**
 * InteractiveLocationMap — stylized interactive map of the two hotel locations.
 *
 * Shows both hotels (Shangri La Dubai on Sheikh Zayed Road, Hilton Dubai Al
 * Habtoor City in Business Bay) as clickable pins on a stylized map. Selecting
 * a location highlights it and shows its venues + arrival info.
 *
 * Uses an SVG-based stylized map (not Google Maps embed) to avoid requiring
 * API keys and to keep the visual consistent with the editorial design.
 */
export function InteractiveLocationMap() {
  const [active, setActive] = useState<"shangrila" | "habtoor">("shangrila");

  const activeLocation = locationRecords.find((l) => l.slug === active)!;
  const activeVenues = activeLocation.venues.map((slug) =>
    venues.find((v) => v.slug === slug)!
  );

  return (
    <div className="mt-8 overflow-hidden rounded-sm border border-border/40 bg-card">
      <div className="grid lg:grid-cols-12">
        {/* Map visual */}
        <div className="relative lg:col-span-7">
          <StylizedMap active={active} onSelect={setActive} />

          {/* Legend overlay */}
          <div className="absolute left-4 top-4 rounded-sm border border-border/60 bg-background/80 p-3 backdrop-blur-sm">
            <p className="font-mono-tight text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
              Two skyline addresses
            </p>
            <p className="mt-1 font-serif-display text-sm text-foreground">
              ABOVE MIDNIGHT DXB
            </p>
          </div>
        </div>

        {/* Active location panel */}
        <div className="border-t border-border/40 p-6 lg:col-span-5 lg:border-l lg:border-t-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="eyebrow text-accent">
                Location {active === "shangrila" ? "01" : "02"} / 02
              </span>
              <h3 className="heading-editorial mt-2 text-2xl text-foreground md:text-3xl">
                {activeLocation.hotelName}
              </h3>
              <p className="mt-1 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
                {activeLocation.area}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps?q=${activeLocation.coordinates.lat},${activeLocation.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("click_map", { location: active, source: "interactive_map" })}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              aria-label="Open in Google Maps"
            >
              <Navigation className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {activeLocation.description}
          </p>

          {/* Venues at this location */}
          <div className="mt-5">
            <p className="font-mono-tight text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
              Venues at this location
            </p>
            <div className="mt-2 space-y-2">
              {activeVenues.map((v) => (
                <div
                  key={v.slug}
                  data-venue={v.slug}
                  className="venue-surface flex items-center gap-3 rounded-sm border border-[var(--venue-foreground)]/10 p-3"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                    style={{ borderColor: `${v.theme.accent}55`, backgroundColor: `${v.theme.accent}15` }}
                  >
                    <Building2 className="h-4 w-4" style={{ color: v.theme.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif-display text-sm text-[var(--venue-foreground)]">
                      {v.shortName}
                    </p>
                    <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
                      {v.location.floor} · {v.genres.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Switch location */}
          <button
            onClick={() => {
              const next = active === "shangrila" ? "habtoor" : "shangrila";
              setActive(next);
              track("click_map", { action: "switch", to: next, source: "interactive_map" });
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-2.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            <MapPin className="h-3 w-3" />
            View {active === "shangrila" ? "Hilton Dubai Al Habtoor City" : "Shangri La Dubai"}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * StylizedMap — an SVG representation of the Dubai area showing both hotels.
 * Not a real map — a stylized editorial diagram with the two pins.
 */
function StylizedMap({
  active,
  onSelect,
}: {
  active: "shangrila" | "habtoor";
  onSelect: (s: "shangrila" | "habtoor") => void;
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/30 lg:aspect-auto lg:h-full lg:min-h-[420px]">
      {/* Stylized map background */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {/* Water (Dubai Creek / coastline) */}
        <path
          d="M 0 220 Q 100 210 180 225 T 400 215 L 400 300 L 0 300 Z"
          fill="rgba(0, 107, 88, 0.08)"
        />
        <path
          d="M 0 220 Q 100 210 180 225 T 400 215"
          stroke="rgba(0, 107, 88, 0.25)"
          strokeWidth="1"
          fill="none"
        />

        {/* Grid lines (city streets) */}
        {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="rgba(245,239,230,0.04)" strokeWidth="0.5" />
        ))}
        {[40, 80, 120, 160, 200, 240, 280].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="rgba(245,239,230,0.04)" strokeWidth="0.5" />
        ))}

        {/* Sheikh Zayed Road (main highway) — diagonal */}
        <line x1="60" y1="40" x2="340" y2="250" stroke="rgba(200,185,142,0.15)" strokeWidth="3" />
        <line x1="60" y1="40" x2="340" y2="250" stroke="rgba(200,185,142,0.08)" strokeWidth="6" />

        {/* Business Bay area */}
        <rect x="220" y="170" width="120" height="60" fill="rgba(245,239,230,0.02)" stroke="rgba(245,239,230,0.06)" strokeWidth="0.5" />
        <text x="280" y="235" fill="rgba(173,165,154,0.4)" fontSize="7" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
          BUSINESS BAY
        </text>

        {/* Downtown / Burj Khalifa area */}
        <circle cx="200" cy="120" r="3" fill="rgba(200,185,142,0.3)" />
        <text x="200" y="110" fill="rgba(173,165,154,0.4)" fontSize="6" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">
          DOWNTOWN
        </text>

        {/* Shangri La Dubai pin (left, on SZR) */}
        <g
          onClick={() => onSelect("shangrila")}
          style={{ cursor: "pointer" }}
          role="button"
          aria-label="Shangri La Dubai location"
        >
          {/* Pulse ring when active */}
          {active === "shangrila" && (
            <circle cx="120" cy="170" r="14" fill="rgba(134,20,42,0.15)">
              <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            cx="120" cy="170" r={active === "shangrila" ? "8" : "6"}
            fill={active === "shangrila" ? "#86142A" : "rgba(134,20,42,0.6)"}
            stroke="#D2AF69" strokeWidth="1.5"
          />
          <text x="120" y="155" fill={active === "shangrila" ? "#F5EFE6" : "rgba(245,239,230,0.5)"} fontSize="7" fontFamily="serif" textAnchor="middle" fontWeight="500">
            Shangri La
          </text>
          <text x="120" y="188" fill="rgba(173,165,154,0.5)" fontSize="5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">
            SHEIKH ZAYED ROAD
          </text>
        </g>

        {/* Hilton Al Habtoor City pin (right, Business Bay) */}
        <g
          onClick={() => onSelect("habtoor")}
          style={{ cursor: "pointer" }}
          role="button"
          aria-label="Hilton Dubai Al Habtoor City location"
        >
          {active === "habtoor" && (
            <circle cx="270" cy="195" r="14" fill="rgba(0,107,88,0.15)">
              <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle
            cx="270" cy="195" r={active === "habtoor" ? "8" : "6"}
            fill={active === "habtoor" ? "#006B58" : "rgba(0,107,88,0.6)"}
            stroke="#C7A66A" strokeWidth="1.5"
          />
          <text x="270" y="180" fill={active === "habtoor" ? "#F5EFE6" : "rgba(245,239,230,0.5)"} fontSize="7" fontFamily="serif" textAnchor="middle" fontWeight="500">
            Hilton Al Habtoor
          </text>
          <text x="270" y="213" fill="rgba(173,165,154,0.5)" fontSize="5" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">
            BUSINESS BAY
          </text>
        </g>

        {/* Connection line between the two */}
        <line
          x1="120" y1="170" x2="270" y2="195"
          stroke="rgba(200,185,142,0.2)" strokeWidth="0.8" strokeDasharray="3 3"
        />
      </svg>

      {/* Compass / scale */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-sm border border-border/40 bg-background/60 px-2 py-1 backdrop-blur-sm">
        <span className="font-mono-tight text-[0.45rem] uppercase tracking-[0.15em] text-muted-foreground">
          Stylized · Not to scale
        </span>
      </div>
    </div>
  );
}
