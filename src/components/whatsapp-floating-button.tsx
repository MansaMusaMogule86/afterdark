"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";

/**
 * WhatsAppFloatingButton — persistent quick-contact for the concierge.
 *
 * Appears after the user scrolls past the hero (so it doesn't clutter the
 * initial view). Respects the mobile bottom action bar (positioned above it
 * on mobile). Expandable to show a quick message + concierge CTA.
 */
export function WhatsAppFloatingButton() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past ~50% of viewport height (below the hero).
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openWhatsApp = () => {
    track("click_whatsapp", { source: "floating_button" });
    const text = encodeURIComponent(
      `Hi ${siteConfig.parentName}, I'd like to speak with the concierge about tonight.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div
      className={cn(
        "fixed right-4 z-[70] transition-all duration-500 lg:bottom-6",
        // Position above the mobile bottom action bar (which is ~64px tall).
        "bottom-20 lg:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      {expanded ? (
        <div className="flex w-72 flex-col overflow-hidden rounded-lg border border-border/60 bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-secondary/40 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15">
                <MessageCircle className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="font-serif-display text-sm text-foreground">Nightlife Concierge</p>
                <p className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-green-400">
                  ● Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Body */}
          <div className="p-4">
            <p className="text-sm text-foreground">
              Need a table tonight? Planning a celebration? The concierge can confirm
              availability, minimum spend, and the right venue for your group.
            </p>
            <button
              onClick={openWhatsApp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-green-500 px-4 py-3 font-mono-tight text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              Start WhatsApp Chat
            </button>
            <p className="mt-2 text-center text-[0.5625rem] text-muted-foreground">
              Opens WhatsApp in a new tab. No phone number required.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setExpanded(true);
            track("click_whatsapp", { source: "floating_expand" });
          }}
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/20 transition-all hover:scale-105 hover:bg-green-600"
          aria-label="Contact concierge on WhatsApp"
        >
          {/* Pulse ring */}
          <span className="absolute inline-flex h-14 w-14 animate-ping rounded-full bg-green-500/40" />
          <MessageCircle className="relative h-6 w-6 text-white" />
          {/* Notification dot */}
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent" />
          </span>
        </button>
      )}
    </div>
  );
}
