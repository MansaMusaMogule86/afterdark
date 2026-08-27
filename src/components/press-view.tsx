"use client";

import Link from "next/link";
import { ArrowLeft, Newspaper, ExternalLink, Quote } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";

/**
 * PressView — press / media mentions page.
 *
 * Per directive: "Never publish a fake award" and "Never use fake customer reviews."
 * This page uses clearly-labelled PLACEHOLDER press entries until real press
 * coverage is confirmed. No fake publications, no fake quotes, no fake awards.
 *
 * In production, real press mentions would replace the placeholders.
 */

interface PressEntry {
  id: string;
  outlet: string;
  outletType: "Magazine" | "Newspaper" | "Online" | "Blog" | "Trade";
  title: string;
  excerpt: string;
  date: string;
  url: string;
  placeholder: boolean;
}

const PRESS_ENTRIES: PressEntry[] = [
  {
    id: "p1",
    outlet: "Time Out Dubai",
    outletType: "Magazine",
    title: "Avenue, Ora, and Black Tape: Dubai's newest nightlife group",
    excerpt: "Placeholder — real press excerpt will replace this when coverage is confirmed. No fake quotes are used.",
    date: "2025-01-15",
    url: "#",
    placeholder: true,
  },
  {
    id: "p2",
    outlet: "Esquire Middle East",
    outletType: "Magazine",
    title: "Inside After Midnight DXB's three-venue strategy",
    excerpt: "Placeholder — real press excerpt will replace this when coverage is confirmed.",
    date: "2025-01-20",
    url: "#",
    placeholder: true,
  },
  {
    id: "p3",
    outlet: "The National",
    outletType: "Newspaper",
    title: "Dubai nightlife groups consolidate above Sheikh Zayed Road",
    excerpt: "Placeholder — real press excerpt will replace this when coverage is confirmed.",
    date: "2025-02-01",
    url: "#",
    placeholder: true,
  },
  {
    id: "p4",
    outlet: "What's On Dubai",
    outletType: "Magazine",
    title: "English Nights: how hashtags are powering a new Dubai club format",
    excerpt: "Placeholder — real press excerpt will replace this when coverage is confirmed.",
    date: "2025-02-10",
    url: "#",
    placeholder: true,
  },
];

export function PressView() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>

        {/* Header */}
        <div className="text-center">
          <span className="eyebrow text-accent">
            <Newspaper className="mr-1 inline h-3 w-3" />
            Press & Mentions
          </span>
          <h1 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
            In the press.
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground md:text-base">
            Media coverage and mentions of {siteConfig.parentName} and its three venues.
            All entries below are placeholders until real coverage is confirmed.
          </p>
        </div>

        {/* Press list */}
        <div className="mt-12 space-y-4">
          {PRESS_ENTRIES.map((entry) => (
            <article
              key={entry.id}
              className="group rounded-sm border border-border/40 bg-card p-5 transition-colors hover:border-foreground/20 md:p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  {/* Outlet + type */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-accent">
                      {entry.outlet}
                    </span>
                    <span className="rounded-full border border-border/40 px-2 py-0.5 font-mono-tight text-[0.45rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {entry.outletType}
                    </span>
                    {entry.placeholder && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono-tight text-[0.45rem] uppercase tracking-[0.12em] text-amber-300">
                        Placeholder
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <h2 className="mt-2 font-serif-display text-xl text-foreground group-hover:text-accent md:text-2xl">
                    {entry.title}
                  </h2>
                  {/* Excerpt */}
                  <div className="mt-3 flex items-start gap-2">
                    <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    <p className="text-sm italic text-muted-foreground">{entry.excerpt}</p>
                  </div>
                  {/* Date */}
                  <p className="mt-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/70">
                    {formatDate(entry.date)}
                  </p>
                </div>
                {/* Read link */}
                <a
                  href={entry.url}
                  target={entry.url !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={() => track("click_map", { source: "press_view", outlet: entry.outlet })}
                  className="flex shrink-0 items-center gap-1.5 rounded-sm border border-border px-3 py-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  Read <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Press contact CTA */}
        <div className="mt-12 rounded-sm border border-border/40 bg-secondary/20 p-6 text-center">
          <h2 className="font-serif-display text-2xl text-foreground">Press enquiries</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            For press kits, interviews, or media partnerships, contact the group team.
            Press email is pending verification.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/?view=about"
              className="rounded-none border border-border px-5 py-2.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-foreground hover:bg-foreground/5"
            >
              About {siteConfig.parentShortName}
            </Link>
            <Link
              href="/?view=faq"
              className="rounded-none border border-border px-5 py-2.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Note */}
        <p className="mt-8 text-center font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/60">
          No fake awards, fake reviews, or fake quotes — placeholders only until real coverage is confirmed
        </p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
