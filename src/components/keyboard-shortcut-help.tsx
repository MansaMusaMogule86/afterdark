"use client";

import { useEffect, useState } from "react";
import { Keyboard, X, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface Shortcut {
  keys: string;
  label: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: "⌘ K", label: "Open command palette" },
  { keys: "Esc", label: "Close dialog / palette" },
  { keys: "↑ ↓", label: "Navigate palette results" },
  { keys: "↵", label: "Select palette result" },
  { keys: "?", label: "Show this shortcut help" },
  { keys: "Tab", label: "Move through interactive elements" },
];

/**
 * KeyboardShortcutHelp — press "?" to show available keyboard shortcuts.
 * Appears as an overlay with a list of all supported shortcuts.
 */
export function KeyboardShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // "?" requires Shift+/ on most keyboards; e.key === "?" catches it.
      // Avoid triggering when typing in inputs.
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        setOpen((o) => !o);
        track("filter_events", { source: "shortcut_help" });
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border/60 bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-accent" />
            <h2 className="font-serif-display text-lg text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-5">
          <ul className="space-y-3">
            {SHORTCUTS.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-foreground">{s.label}</span>
                <kbd className="rounded-sm border border-border bg-secondary/60 px-2.5 py-1 font-mono-tight text-[0.6875rem] text-foreground">
                  {s.keys}
                </kbd>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-sm border border-border/40 bg-secondary/20 p-3">
            <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">
              Tip
            </p>
            <p className="mt-1 text-xs text-foreground/80">
              Use <kbd className="rounded border border-border px-1 font-mono-tight text-[0.5625rem]">⌘ K</kbd> anywhere to
              quickly navigate to any section, venue, or English Night.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/40 px-5 py-3">
          <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-muted-foreground">
            Press ? anytime to open this
          </span>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center gap-1.5 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-accent hover:text-foreground"
          >
            <CornerDownLeft className="h-3 w-3" /> Close
          </button>
        </div>
      </div>
    </div>
  );
}
