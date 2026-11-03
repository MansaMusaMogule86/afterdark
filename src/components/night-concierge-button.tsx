"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";

/**
 * NightConciergeButton — restrained desktop concierge entry point.
 *
 * Per directive:
 * - Near black background, thin champagne border, warm ivory text
 * - Small Above Midnight DXB monogram
 * - Max height 52px
 * - No WhatsApp green, no pulsing, no auto-expansion
 * - Opens only after intentional click
 * - Respects cookie banner position (moves above it)
 * - Respects browser safe areas
 * - Never covers important page controls
 *
 * Desktop only (lg+). Mobile uses the BOOK button in the bottom action bar.
 */
export function NightConciergeButton() {
  const { openConcierge } = useUi();
  const [cookieVisible, setCookieVisible] = useState(false);

  // Detect if the cookie consent banner is visible to position above it.
  useEffect(() => {
    const check = () => {
      const banner = document.querySelector('[aria-label="Cookie consent"]');
      setCookieVisible(!!banner);
    };
    check();
    // Re-check periodically (banner appears after 1.2s delay).
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    track("concierge_open", { source: "desktop_button" });
    openConcierge({ source: "desktop_concierge_button" });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed right-4 z-[60] hidden items-center gap-2.5 rounded-sm border border-accent/40 bg-background/95 px-4 backdrop-blur-md transition-all duration-300 hover:border-accent/70 lg:flex",
        "h-[44px] safe-pb", // Max 52px per directive, 44px for elegant restraint
        // Position above cookie banner when visible, otherwise bottom-6.
        cookieVisible ? "bottom-20" : "bottom-6"
      )}
      aria-label="Open Night Concierge"
    >
      {/* Above Midnight DXB monogram */}
      <span className="flex h-6 w-6 items-center justify-center rounded-sm border border-accent/30 font-serif-display text-[0.625rem] text-accent">
        AM
      </span>
      {/* Label */}
      <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em] text-foreground">
        Night Concierge
      </span>
    </button>
  );
}
