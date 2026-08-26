"use client";

import { Moon, Building2, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";

/**
 * Mobile persistent lower action bar.
 * Contains: Tonight, Venues, Book.
 * Respects safe areas. Does not overlap forms or content (page has bottom padding).
 */
export function MobileActionBar() {
  const { openBooking } = useUi();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden safe-pb">
      <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-3">
          <a
            href="#tonight"
            onClick={() => track("filter_events", { nav: "tonight_mobile_bar" })}
            className="flex flex-col items-center gap-1 py-3 text-muted-foreground transition-colors active:bg-secondary"
          >
            <Moon className="h-5 w-5" />
            <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]">
              Tonight
            </span>
          </a>
          <a
            href="#venues"
            onClick={() => track("view_venue", { nav: "venues_mobile_bar" })}
            className="flex flex-col items-center gap-1 border-x border-border/40 py-3 text-muted-foreground transition-colors active:bg-secondary"
          >
            <Building2 className="h-5 w-5" />
            <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]">
              Venues
            </span>
          </a>
          <button
            onClick={() => {
              track("start_vip_inquiry", { source: "mobile_action_bar" });
              openBooking();
            }}
            className={cn(
              "flex flex-col items-center gap-1 py-3 text-foreground transition-colors active:bg-secondary"
            )}
          >
            <CalendarCheck className="h-5 w-5 text-accent" />
            <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em]">
              Book
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
