"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

/**
 * ScrollToTopButton — appears after scrolling down, scrolls back to top.
 * Positioned to not overlap with the WhatsApp floating button (which is
 * bottom-right). This sits bottom-right but above the WhatsApp button.
 */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past 2x viewport height.
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    track("filter_events", { source: "scroll_to_top" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed right-4 z-[65] flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-card/90 text-muted-foreground shadow-lg backdrop-blur-sm transition-all hover:border-foreground/40 hover:text-foreground",
        // Position above the WhatsApp button on desktop, hidden on mobile (bottom bar conflicts).
        "bottom-36 lg:bottom-24 hidden lg:flex",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
