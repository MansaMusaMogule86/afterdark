"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Flame, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemandInfo {
  level: "NEW" | "LOW" | "TRENDING" | "HIGH";
  label: string;
  description: string;
  inquiryCount: number;
}

/**
 * DemandIndicator — shows honest demand based on real booking inquiry volume.
 *
 * Per directive: "Never display fake availability or a fake sold-out state."
 * This component fetches REAL inquiry counts from /api/demand and displays
 * an honest label. It never shows fake "selling fast" or "sold out" states.
 */
export function DemandIndicator({
  event,
  venue,
  variant = "pill",
}: {
  event?: string;
  venue?: string;
  variant?: "pill" | "full";
}) {
  const [demand, setDemand] = useState<DemandInfo | null>(null);
  const [prevKey, setPrevKey] = useState("");
  const key = `${event ?? ""}-${venue ?? ""}`;

  // Reset demand when the key changes (derived-state pattern).
  if (prevKey !== key) {
    setPrevKey(key);
    setDemand(null);
  }

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (event) params.set("event", event);
    if (venue) params.set("venue", venue);
    fetch(`/api/demand?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setDemand(d.demand || null); })
      .catch(() => { if (!cancelled) setDemand(null); });
    return () => { cancelled = true; };
  }, [event, venue]);

  if (!demand) return null;

  const config = {
    NEW: { icon: Sparkles, color: "text-muted-foreground", bg: "bg-secondary/40", border: "border-border" },
    LOW: { icon: Users, color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    TRENDING: { icon: TrendingUp, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    HIGH: { icon: Flame, color: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/20" },
  }[demand.level];

  const Icon = config.icon;

  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-2.5 rounded-sm border px-3 py-2", config.border, config.bg)}>
        <Icon className={cn("h-4 w-4 shrink-0", config.color)} />
        <div>
          <p className={cn("font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em]", config.color)}>
            {demand.label}
          </p>
          <p className="text-xs text-muted-foreground">{demand.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        config.border,
        config.bg
      )}
      title={demand.description}
    >
      <Icon className={cn("h-2.5 w-2.5", config.color)} />
      <span className={cn("font-mono-tight text-[0.5rem] uppercase tracking-[0.1em]", config.color)}>
        {demand.label}
      </span>
    </div>
  );
}
