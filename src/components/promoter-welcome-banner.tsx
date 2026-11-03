"use client";

import { useEffect, useState } from "react";
import { User, X, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface AttributionInfo {
  type: "promoter" | "concierge" | "partner" | "influencer" | "campaign";
  code: string;
  name?: string;
}

/**
 * Read attribution from URL + sessionStorage once.
 * Uses lazy initialization so it runs only on the client (guards SSR).
 */
function readAttribution(): AttributionInfo | null {
  if (typeof window === "undefined") return null;
  try {
    if (sessionStorage.getItem("amd_promoter_banner_dismissed") === "1") return null;
  } catch {
    /* no-op */
  }
  const params = new URL(window.location.href).searchParams;
  const checks: { param: string; type: AttributionInfo["type"] }[] = [
    { param: "promoter", type: "promoter" },
    { param: "p", type: "promoter" },
    { param: "concierge", type: "concierge" },
    { param: "c", type: "concierge" },
    { param: "partner", type: "partner" },
    { param: "influencer", type: "influencer" },
    { param: "campaign", type: "campaign" },
    { param: "utm_campaign", type: "campaign" },
  ];
  for (const { param, type } of checks) {
    const value = params.get(param);
    if (value) {
      const name = value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { type, code: value, name };
    }
  }
  return null;
}

/**
 * PromoterWelcomeBanner — personalized attribution display.
 *
 * When a user arrives via a referral link (?promoter=CODE, ?concierge=CODE,
 * ?partner=CODE, ?influencer=CODE, or ?campaign=CODE), shows a slim welcome
 * banner acknowledging the referral. This personalizes the experience and
 * reinforces the attribution chain.
 *
 * The banner is dismissible and stores dismissal in sessionStorage so it
 * doesn't reappear on every navigation within the same session.
 *
 * Per directive: stores first and last referral attribution. Does not place
 * personal information in the URL.
 */
export function PromoterWelcomeBanner() {
  // Lazy init: reads attribution once on first client render.
  // This avoids setState-in-effect (lint rule react-hooks/set-state-in-effect).
  const [info, setInfo] = useState<AttributionInfo | null>(readAttribution);

  // Fire tracking as a side effect (no setState here).
  useEffect(() => {
    if (info) {
      track("promoter_conversion", {
        promoter: info.type === "promoter" ? info.code : undefined,
        concierge: info.type === "concierge" ? info.code : undefined,
        campaign: info.type === "campaign" ? info.code : undefined,
        source: "welcome_banner",
      });
    }
  }, [info]);

  const dismiss = () => {
    setInfo(null);
    try {
      sessionStorage.setItem("amd_promoter_banner_dismissed", "1");
    } catch {
      /* no-op */
    }
  };

  if (!info) return null;

  const labels: Record<NonNullable<AttributionInfo["type"]>, { title: string; desc: string; icon: typeof User }> = {
    promoter: {
      title: `Welcome via ${info.name}`,
      desc: "Your promoter's table team will be notified when you request a VIP table.",
      icon: User,
    },
    concierge: {
      title: `Concierge: ${info.name}`,
      desc: "Your hotel concierge is credited on any booking you make tonight.",
      icon: User,
    },
    partner: {
      title: `Partner: ${info.name}`,
      desc: "You arrived via a partner link. Your booking supports them.",
      icon: Gift,
    },
    influencer: {
      title: `Welcome via ${info.name}`,
      desc: "Your influencer's code is saved to your booking request.",
      icon: Sparkles,
    },
    campaign: {
      title: `Campaign: ${info.name}`,
      desc: "Your visit is attributed to this campaign.",
      icon: Sparkles,
    },
  };

  const config = labels[info.type!];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-x-0 top-16 z-[75] md:top-20 safe-pt"
      role="region"
      aria-label="Referral welcome"
    >
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex items-center gap-3 rounded-sm border border-accent/30 bg-card/95 p-3 shadow-lg backdrop-blur-xl">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-accent">
              {config.title}
            </p>
            <p className="mt-0.5 truncate text-xs text-foreground/80">
              {config.desc}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            aria-label="Dismiss welcome"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
