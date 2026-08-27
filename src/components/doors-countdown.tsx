"use client";

import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";
import { getTonightOccurrences } from "@/lib/events-data";
import { venues } from "@/lib/venue-data";

/**
 * DoorsCountdown — shows time until tonight's event doors open.
 *
 * Calculates the time remaining until the earliest tonight event's start time.
 * Displays as "Doors open in HH:MM:SS" with a live countdown.
 * If an event is live (current time is between start and end), shows "Live now".
 */

interface CountdownState {
  label: string;
  sublabel: string;
  isLive: boolean;
  venueSlug: string;
}

export function DoorsCountdown() {
  const [state, setState] = useState<CountdownState | null>(null);

  useEffect(() => {
    const update = () => {
      const tonight = getTonightOccurrences();
      if (tonight.length === 0) {
        setState(null);
        return;
      }

      // Find the earliest event tonight (by start time).
      const sorted = [...tonight].sort((a, b) =>
        toMinutes(a.startTime) - toMinutes(b.startTime)
      );
      const earliest = sorted[0];
      const venue = venues.find((v) => v.slug === earliest.venue);

      // Get current Dubai time in minutes from midnight.
      const now = new Date();
      const dubaiHour = parseInt(
        new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", hour12: false }).format(now),
        10
      );
      const dubaiMin = parseInt(
        new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", minute: "2-digit" }).format(now),
        10
      );
      const nowMin = dubaiHour * 60 + dubaiMin;

      const doorsMin = toMinutes(earliest.startTime);
      const endMin = toMinutes(earliest.endTime);

      // Handle nightlife service date boundary (events crossing midnight).
      // If end time is AM and < doors time, it's the next "day" in clock terms.
      const adjustedEnd = endMin < doorsMin ? endMin + 24 * 60 : endMin;

      if (nowMin >= doorsMin && nowMin < adjustedEnd) {
        // Event is live
        const remainingMin = adjustedEnd - nowMin;
        const h = Math.floor(remainingMin / 60);
        const m = remainingMin % 60;
        setState({
          label: "Live Now",
          sublabel: `${h}h ${m}m until close`,
          isLive: true,
          venueSlug: earliest.venue,
        });
      } else if (nowMin < doorsMin) {
        // Before doors
        const remainingMin = doorsMin - nowMin;
        const h = Math.floor(remainingMin / 60);
        const m = remainingMin % 60;
        const s = 60 - now.getSeconds();
        setState({
          label: `Doors in ${pad(h)}:${pad(m)}:${pad(s)}`,
          sublabel: `${venue?.shortName} · ${earliest.startTime}`,
          isLive: false,
          venueSlug: earliest.venue,
        });
      } else {
        // After close — no countdown
        setState(null);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!state) return null;

  const venue = venues.find((v) => v.slug === state.venueSlug);

  return (
    <div
      data-venue={state.venueSlug}
      className="venue-surface flex items-center gap-3 rounded-sm border border-[var(--venue-foreground)]/15 px-4 py-2.5"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--venue-accent)]/15">
        {state.isLive ? (
          <Flame className="h-4 w-4 text-green-400" />
        ) : (
          <Clock className="h-4 w-4" style={{ color: venue?.theme.accent }} />
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={`font-mono-tight tnum text-sm leading-none ${state.isLive ? "text-green-400" : "text-[var(--venue-foreground)]"}`}
        >
          {state.label}
        </span>
        <span className="mt-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
          {state.sublabel}
        </span>
      </div>
      {state.isLive && (
        <span className="relative ml-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
        </span>
      )}
    </div>
  );
}

function toMinutes(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
