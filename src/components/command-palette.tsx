"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Moon, Building2, CalendarDays, Sparkles, Crown, Cake, BookOpen,
  MapPin, Info, HelpCircle, Instagram, ArrowRight, CornerDownLeft, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  group: string;
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { openBooking, openVenueDrawer } = useUi();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const commands = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = [
      { id: "home", label: "Home", hint: "Homepage", icon: <Home className="h-4 w-4" />, group: "Navigation", action: () => router.push("/") },
      { id: "tonight", label: "Tonight", hint: "What's live tonight", icon: <Moon className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#tonight") },
      { id: "venues", label: "Venues", hint: "Compare all three", icon: <Building2 className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#venues") },
      { id: "events", label: "Events", hint: "Next 7 nights", icon: <CalendarDays className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#events") },
      { id: "matcher", label: "Find My Venue", hint: "Venue matcher quiz", icon: <Sparkles className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#find-my-venue") },
      { id: "vip", label: "VIP Tables", hint: "Table types & booking", icon: <Crown className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#vip") },
      { id: "celebrations", label: "Celebrations", hint: "Birthdays & events", icon: <Cake className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#celebrations") },
      { id: "night-edit", label: "The Night Edit", hint: "Dubai nightlife guide", icon: <BookOpen className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#night-edit") },
      { id: "locations", label: "Locations", hint: "Two skyline addresses", icon: <MapPin className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#locations") },
      { id: "about", label: "About + FAQ", hint: "About & frequently asked", icon: <Info className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#about") },
      { id: "faq", label: "FAQ", hint: "Frequently asked questions", icon: <HelpCircle className="h-4 w-4" />, group: "Navigation", action: () => router.push("/#faq") },
    ];

    const venueCmds: CommandItem[] = venues.map((v) => ({
      id: `venue-${v.slug}`,
      label: v.name,
      hint: `${v.location.hotelName} · ${v.location.floor}`,
      icon: (
        <div className="h-6 w-6 overflow-hidden rounded-sm">
          <AssetImage src={v.logoLight} file={`${v.slug}_logo_light.svg`} purpose={`${v.shortName} logo`} crop="svg" venue={v.slug} alt={v.name} variant="logo" className="h-full w-full" />
        </div>
      ),
      group: "Venues",
      action: () => openVenueDrawer(v.slug),
      keywords: v.genres.join(" "),
    }));

    const enCmds: CommandItem[] = [
      { id: "en-landing", label: "English Nights", hint: "#AMDXBENGLISHNIGHT events", icon: <Instagram className="h-4 w-4" />, group: "English Nights", action: () => router.push("/?view=english-nights") },
      { id: "en-admin", label: "Import Review", hint: "Admin panel", icon: <Search className="h-4 w-4" />, group: "English Nights", action: () => router.push("/?view=english-nights-admin") },
    ];

    const actionCmds: CommandItem[] = [
      { id: "book-vip", label: "Book VIP Table", hint: "Start a VIP request", icon: <Crown className="h-4 w-4" />, group: "Actions", action: () => openBooking() },
    ];

    return [...nav, ...venueCmds, ...enCmds, ...actionCmds];
  }, [router, openBooking, openVenueDrawer]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) =>
      c.label.toLowerCase().includes(q) ||
      c.hint?.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      c.keywords?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Group filtered results
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation
  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) {
        track("filter_events", { source: "command_palette", target: cmd.id });
        setOpen(false);
        setQuery("");
        cmd.action();
      }
    }
  };

  if (!open) return null;

  // Flatten for index tracking
  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-border/60 bg-card shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border/40 p-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search venues, events, sections…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No results for "{query}"</p>
            </div>
          ) : (
            grouped.map(([group, items]) => (
              <div key={group} className="mb-2">
                <p className="px-3 py-1.5 font-mono-tight text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {group}
                </p>
                {items.map((cmd) => {
                  flatIndex++;
                  const isActive = flatIndex === activeIndex;
                  const idx = flatIndex;
                  return (
                    <button
                      key={cmd.id}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        track("filter_events", { source: "command_palette", target: cmd.id });
                        setOpen(false);
                        setQuery("");
                        cmd.action();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-accent/10" : "hover:bg-secondary/40"
                      )}
                    >
                      <span className={cn("shrink-0", isActive ? "text-accent" : "text-muted-foreground")}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm truncate", isActive ? "text-accent" : "text-foreground")}>
                          {cmd.label}
                        </p>
                        {cmd.hint && (
                          <p className="text-xs text-muted-foreground truncate">{cmd.hint}</p>
                        )}
                      </div>
                      {isActive && (
                        <CornerDownLeft className="h-3 w-3 shrink-0 text-accent" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5">
          <div className="flex items-center gap-3 font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border px-1">↑</kbd>
              <kbd className="rounded border border-border px-1">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border px-1">↵</kbd>
              Select
            </span>
          </div>
          <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.1em] text-muted-foreground">
            After Midnight DXB
          </span>
        </div>
      </div>
    </div>
  );
}
