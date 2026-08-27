"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

/**
 * LiveDubaiClock — shows current Asia/Dubai time.
 * Reinforces the "Above Midnight" brand identity.
 * Updates every second. Respects reduced motion (updates but doesn't animate).
 */
export function LiveDubaiClock() {
  const [time, setTime] = useState<string>("");
  const [isNight, setIsNight] = useState(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const t = fmt.format(now);
      setTime(t);
      // "After midnight" = between 6 PM and 6 AM Dubai time.
      const hourFmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        hour: "2-digit",
        hour12: false,
      });
      const h = parseInt(hourFmt.format(now), 10);
      setIsNight(h >= 18 || h < 6);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-sm border border-border/40 bg-secondary/30 px-3 py-1.5"
      title="Current time in Dubai"
    >
      <Moon
        className={`h-3 w-3 transition-colors ${isNight ? "text-accent" : "text-muted-foreground"}`}
      />
      <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground">
        DXB
      </span>
      <span className="font-mono-tight tnum text-[0.6875rem] text-foreground tabular-nums">
        {time}
      </span>
      {isNight && (
        <span className="ml-1 rounded-full bg-accent/15 px-1.5 py-0.5 font-mono-tight text-[0.45rem] uppercase tracking-[0.15em] text-accent">
          After Dark
        </span>
      )}
    </div>
  );
}
