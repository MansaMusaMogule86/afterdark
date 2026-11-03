"use client";

import { useState } from "react";
import { Palette, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { track } from "@/lib/analytics";

type ThemeKey = "parent" | "avenue" | "ora" | "blacktape";

const THEME_STORAGE_KEY = "amd_theme_preference";

const THEMES: { key: ThemeKey; label: string; colors: { bg: string; primary: string; accent: string } }[] = [
  { key: "parent", label: "Above Midnight", colors: { bg: "#07070A", primary: "#C8B98E", accent: "#C8B98E" } },
  ...venues.map((v) => ({
    key: v.slug as ThemeKey,
    label: v.shortName,
    colors: { bg: v.theme.bg, primary: v.theme.primary, accent: v.theme.accent },
  })),
];

/**
 * ThemeSwitcher — lets users preview the site in any of the 4 themes.
 *
 * Applies a `[data-venue]` attribute to the <html> element, which activates
 * the venue-specific CSS theme tokens. This is a visual preview only —
 * it doesn't change content, just colors.
 *
 * Persists preference in localStorage.
 */
function applyTheme(key: ThemeKey) {
  const root = document.documentElement;
  if (key === "parent") {
    root.removeAttribute("data-venue");
  } else {
    root.setAttribute("data-venue", key);
  }
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeKey>(() => {
    // Lazy init: read saved preference once on first client render.
    if (typeof window === "undefined") return "parent";
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeKey | null;
      if (saved && THEMES.some((t) => t.key === saved)) {
        applyTheme(saved);
        return saved;
      }
    } catch {
      /* no-op */
    }
    return "parent";
  });

  const select = (key: ThemeKey) => {
    setActive(key);
    applyTheme(key);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, key);
    } catch {
      /* no-op */
    }
    track("filter_events", { source: "theme_switch", value: key });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-sm border border-border/40 bg-secondary/30 px-3 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Switch theme"
        title="Preview site theme"
      >
        <Palette className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Theme switcher"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border/60 bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 p-5">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-accent" />
                <h2 className="font-serif-display text-lg text-foreground">Theme Preview</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-sm text-muted-foreground">
                Preview the site in any venue's visual world. This changes colors only — content stays the same.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => select(t.key)}
                    className={cn(
                      "group relative flex flex-col items-start gap-2 rounded-sm border p-3 text-left transition-colors",
                      active === t.key
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-foreground/40"
                    )}
                    style={{ backgroundColor: active === t.key ? `${t.colors.accent}10` : undefined }}
                  >
                    {/* Color swatches */}
                    <div className="flex gap-1">
                      <span
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: t.colors.bg }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: t.colors.primary }}
                      />
                      <span
                        className="h-5 w-5 rounded-full border border-border"
                        style={{ backgroundColor: t.colors.accent }}
                      />
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <span className={cn("text-sm font-medium", active === t.key ? "text-accent" : "text-foreground")}>
                        {t.label}
                      </span>
                      {active === t.key && <Check className="h-4 w-4 text-accent" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Reset */}
              <button
                onClick={() => select("parent")}
                className="mt-4 w-full rounded-sm border border-border py-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
              >
                Reset to Above Midnight (default)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
