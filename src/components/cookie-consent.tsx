"use client";

import { useEffect, useState } from "react";
import { Cookie, X, Check, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "amd_cookie_consent_v1";
const CONSENT_EXPIRY_DAYS = 180;

interface ConsentState {
  status: "accepted" | "rejected" | null;
  timestamp: number;
  preferences: {
    necessary: boolean; // always true
    analytics: boolean;
    marketing: boolean;
  };
}

function getStoredConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    // Check expiry
    const ageMs = Date.now() - parsed.timestamp;
    if (ageMs > CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function storeConsent(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Delay slightly to avoid layout shift during initial render.
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
    // If we have stored consent, set the dataLayer consent mode.
    updateConsentMode(stored);
  }, []);

  const accept = (preferences: { analytics: boolean; marketing: boolean }) => {
    const state: ConsentState = {
      status: "accepted",
      timestamp: Date.now(),
      preferences: { necessary: true, ...preferences },
    };
    storeConsent(state);
    updateConsentMode(state);
    setVisible(false);
    track("newsletter_signup", { consent: "accepted", ...preferences });
  };

  const reject = () => {
    const state: ConsentState = {
      status: "rejected",
      timestamp: Date.now(),
      preferences: { necessary: true, analytics: false, marketing: false },
    };
    storeConsent(state);
    updateConsentMode(state);
    setVisible(false);
    track("newsletter_signup", { consent: "rejected" });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 above-mobile-bar z-[80] p-3 lg:left-4 lg:max-w-sm lg:inset-x-auto"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="overflow-hidden rounded-lg border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl">
        {/* Compact slim bar */}
        {!expanded ? (
          <div className="flex items-center gap-3 p-3">
            <Cookie className="h-4 w-4 shrink-0 text-accent" />
            <p className="flex-1 text-xs text-foreground/90">
              We use cookies.{" "}
              <a href="/?view=privacy" className="underline text-accent hover:text-foreground">Privacy</a>{" "}
              ·{" "}
              <a href="/?view=cookies" className="underline text-accent hover:text-foreground">Cookies</a>
            </p>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => accept({ analytics: true, marketing: false })}
                className="rounded-sm bg-foreground px-3 py-1.5 font-mono-tight text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-background transition-colors hover:bg-accent"
              >
                Accept
              </button>
              <button
                onClick={() => setExpanded(true)}
                className="rounded-sm border border-border px-2 py-1.5 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                aria-label="Customize preferences"
              >
                <Settings className="h-3 w-3" />
              </button>
              <button
                onClick={reject}
                className="rounded-sm px-2 py-1.5 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                aria-label="Reject all"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cookie className="h-4 w-4 text-accent" />
                <p className="font-serif-display text-sm text-foreground">Cookie Preferences</p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Necessary cookies are always on. Choose your preferences below.
            </p>

            {/* Preferences */}
            <div className="mt-3 space-y-2.5">
              <PrefRow
                title="Necessary"
                desc="Required for the site to function."
                checked
                disabled
              />
              <PrefRow
                title="Analytics"
                desc="Anonymous visit data (GA4, GTM)."
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <PrefRow
                title="Marketing"
                desc="Meta Pixel, TikTok Pixel for ads."
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => accept(prefs)}
                className="flex-1 rounded-sm bg-accent px-3 py-2 font-mono-tight text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-background hover:opacity-90"
              >
                Save Preferences
              </button>
              <button
                onClick={reject}
                className="rounded-sm border border-border px-3 py-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
              >
                Reject All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PrefRow({
  title, desc, checked, disabled, onChange,
}: {
  title: string; desc: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <label className={cn("flex items-start gap-3", disabled ? "cursor-default" : "cursor-pointer")}>
      <div className="mt-0.5">
        <div
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border transition-colors",
            checked ? "border-accent bg-accent text-background" : "border-border",
            disabled && "opacity-60"
          )}
        >
          {checked && <Check className="h-3 w-3" />}
        </div>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </label>
  );
}

function updateConsentMode(state: ConsentState) {
  // Push consent mode to dataLayer for GTM/GA4.
  try {
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    if (w.dataLayer) {
      w.dataLayer.push({
        event: "cookie_consent_update",
        consent: state.status,
        analytics: state.preferences.analytics,
        marketing: state.preferences.marketing,
      });
    }
    if (w.gtag) {
      w.gtag("consent", "update", {
        analytics_storage: state.preferences.analytics ? "granted" : "denied",
        ad_storage: state.preferences.marketing ? "granted" : "denied",
        ad_user_data: state.preferences.marketing ? "granted" : "denied",
        ad_personalization: state.preferences.marketing ? "granted" : "denied",
      });
    }
  } catch {
    /* no-op */
  }
}
