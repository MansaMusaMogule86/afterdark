"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, CalendarClock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/ui-store";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { LiveDubaiClock } from "@/components/live-dubai-clock";

const NAV = [
  { label: "Tonight", href: "#tonight" },
  { label: "Venues", href: "#venues" },
  { label: "Events", href: "#events" },
  { label: "English Nights", href: "/?view=english-nights" },
  { label: "VIP", href: "#vip" },
  { label: "Celebrations", href: "#celebrations" },
  { label: "The Night Edit", href: "#night-edit" },
  { label: "About", href: "#about" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { mobileMenuOpen, setMobileMenu, openBooking } = useUi();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMobileMenu(false);
    track("filter_events", { nav: href });
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 safe-pt transition-all duration-500",
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:h-20 md:px-8">
          {/* Logo */}
          <Link
            href="#top"
            onClick={() => go("#top")}
            className="group flex items-center gap-3"
            aria-label={`${siteConfig.parentName} home`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-accent/40 font-serif-display text-accent text-lg">
              AM
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-serif-display text-sm text-foreground">
                {siteConfig.parentShortName}
              </span>
              <span className="eyebrow mt-0.5 text-[0.5rem]">DXB · After Dark</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => go(item.href)}
                className="group relative font-mono-tight text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <LiveDubaiClock />
            </div>
            <button
              onClick={() => {
                // Dispatch Cmd+K programmatically by toggling a custom event
                window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
              }}
              className="hidden items-center gap-2 rounded-sm border border-border/40 bg-secondary/30 px-3 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground lg:flex"
              aria-label="Open command palette"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd className="rounded border border-border px-1 text-[0.5rem]">⌘K</kbd>
            </button>
            <Button
              size="sm"
              onClick={() => {
                track("start_vip_inquiry", { source: "header" });
                openBooking();
              }}
              className="hidden rounded-none bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:bg-accent hover:text-background md:inline-flex"
            >
              Book VIP
            </Button>
            <button
              onClick={() => setMobileMenu(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center text-foreground lg:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu sheet */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-background/90 backdrop-blur-xl"
          onClick={() => setMobileMenu(false)}
        />
        <nav className="relative flex h-full flex-col justify-center px-8" aria-label="Mobile">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => go(item.href)}
              className={cn(
                "border-b border-border/40 py-5 font-serif-display text-3xl text-foreground transition-all",
                mobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}
              style={{ transitionDelay: mobileMenuOpen ? `${i * 60}ms` : "0ms" }}
            >
              <span className="font-mono-tight mr-4 text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          ))}
          <Button
            onClick={() => {
              track("start_vip_inquiry", { source: "mobile_menu" });
              openBooking();
            }}
            className="mt-8 rounded-none bg-accent py-4 text-sm font-semibold uppercase tracking-[0.18em] text-background"
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Book VIP
          </Button>
        </nav>
      </div>
    </>
  );
}
