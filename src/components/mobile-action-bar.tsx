"use client";

import { Moon, Building2, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";

/**
 * Mobile persistent lower action bar.
 * Contains: Tonight, Venues, Book.
 * Book opens the Night Concierge bottom sheet (not the old booking modal).
 * Respects safe areas.
 */
export function MobileActionBar() {
  const { openConcierge } = useUi();

  return (
    <nav
      aria-label="Mobile quick actions"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl safe-pb shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 touch-manipulation">
        <a
          href="#tonight"
          onClick={() => track("filter_events", { nav: "tonight_mobile_bar" })}
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors active:bg-secondary/60 hover:text-foreground"
        >
          <Moon className="h-5 w-5" />
          <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]">
            Tonight
          </span>
        </a>
        <a
          href="#venues"
          onClick={() => track("view_venue", { nav: "venues_mobile_bar" })}
          className="flex min-h-[52px] flex-col items-center justify-center gap-1 border-x border-border/40 py-2 text-muted-foreground transition-colors active:bg-secondary/60 hover:text-foreground"
        >
          <Building2 className="h-5 w-5" />
          <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]">
            Venues
          </span>
        </a>
        <button
          onClick={() => {
            track("concierge_open", { source: "mobile_book_bar" });
            openConcierge({ source: "mobile_book_bar" });
          }}
          className={cn(
            "flex min-h-[52px] flex-col items-center justify-center gap-1 py-2 text-foreground transition-colors active:bg-secondary/60"
          )}
        >
          <CalendarCheck className="h-5 w-5 text-accent" />
          <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]">
            Book
          </span>
        </button>
      </div>
    </nav>
  );
}
