"use client";

import { useEffect, useState } from "react";
import { Cookie, X, Check } from "lucide-react";
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
      className="fixed inset-x-0 bottom-0 z-[80] p-4 safe-pb"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl">
        {/* Compact bar */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:gap-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-accent/30 bg-accent/10">
              <Cookie className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-serif-display text-base text-foreground">
                We use cookies to improve your visit.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Necessary cookies are always on. You choose analytics and marketing. Read our{" "}
                <a href="/?view=privacy" className="underline hover:text-foreground">privacy policy</a>{" "}
                and{" "}
                <a href="/?view=cookies" className="underline hover:text-foreground">cookie policy</a>.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => accept({ analytics: true, marketing: false })}
              size="sm"
              className="rounded-none bg-foreground px-4 py-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-background hover:bg-accent"
            >
              <Check className="mr-1.5 h-3 w-3" />
              Accept
            </Button>
            <Button
              onClick={() => setExpanded(!expanded)}
              variant="outline"
              size="sm"
              className="rounded-none border-border px-4 py-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-foreground hover:bg-foreground/10"
            >
              Customize
            </Button>
            <Button
              onClick={reject}
              variant="ghost"
              size="sm"
              className="rounded-none px-3 py-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
            >
              Reject
            </Button>
          </div>
        </div>

        {/* Expanded preferences */}
        {expanded && (
          <div className="border-t border-border/40 bg-secondary/30 p-5">
            <div className="space-y-3">
              <PrefRow
                title="Necessary"
                desc="Required for the site to function. Cannot be disabled."
                checked
                disabled
              />
              <PrefRow
                title="Analytics"
                desc="Anonymous visit data to improve the site (GA4, GTM)."
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
              <PrefRow
                title="Marketing"
                desc="Meta Pixel, TikTok Pixel for personalized ads."
                checked={prefs.marketing}
                onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={() => accept(prefs)}
                size="sm"
                className="rounded-none bg-accent px-5 py-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-background hover:opacity-90"
              >
                Save Preferences
              </Button>
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
