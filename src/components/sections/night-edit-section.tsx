"use client";

import { useState } from "react";
import { ArrowUpRight, BookOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { guideArticles, guideCategories } from "@/lib/guide-data";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { Button } from "@/components/ui/button";

type CategoryFilter = "All" | (typeof guideCategories)[number];

function formatReviewedDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function NightEditSection() {
  const [filter, setFilter] = useState<CategoryFilter>("All");

  const featured = guideArticles[0];
  const rest = guideArticles.slice(1);
  const filteredRest =
    filter === "All" ? rest : rest.filter((a) => a.category === filter);

  return (
    <section id="night-edit" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">The Night Edit</span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              Dubai Nightlife Guide
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Practical, reviewed Dubai nightlife guidance.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 px-4 py-3">
            <Languages className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              Arabic versions available where marked.
            </p>
          </div>
        </div>

        {/* Featured article */}
        <article
          data-venue="night_edit"
          className="venue-surface mt-12 grid gap-0 overflow-hidden rounded-sm border border-border/40 md:grid-cols-2"
        >
          {/* Cover */}
          <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-[420px]">
            <AssetImage
              src={featured.coverImage}
              file={`article_${featured.slug}_cover.webp`}
              purpose={`Cover image for "${featured.title}".`}
              dimensions="1600 × 900"
              crop="wide"
              venue="night_edit"
              alt={featured.title}
              className="h-full w-full"
            />
            <div className="absolute left-5 top-5 rounded-sm border border-[var(--venue-foreground)]/20 bg-[var(--venue-bg)]/70 px-3 py-1.5 backdrop-blur-sm">
              <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-accent)]">
                Featured
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between p-6 md:p-10">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-[var(--venue-accent)]">
                  {featured.category}
                </span>
                {featured.hasArabicVersion && (
                  <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.18em] text-[var(--venue-muted)]">
                    · AR
                  </span>
                )}
              </div>
              <h3 className="heading-editorial mt-3 text-2xl leading-tight text-[var(--venue-foreground)] md:text-4xl">
                {featured.title}
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--venue-foreground)]/80 md:text-base">
                {featured.excerpt}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--venue-foreground)]/10 pt-5">
              <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-[var(--venue-muted)] tnum">
                Reviewed {formatReviewedDate(featured.reviewedDate)}
              </span>
              <Button
                asChild
                className="rounded-none bg-[var(--venue-accent)] px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--venue-bg)] hover:opacity-90"
              >
                <a
                  href="#night-edit-list"
                  onClick={() =>
                    track("view_event", {
                      article: featured.slug,
                      source: "night_edit_featured",
                    })
                  }
                >
                  <BookOpen className="mr-2 h-3.5 w-3.5" />
                  Read
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Category filter chips */}
        <div
          id="night-edit-list"
          className="mt-14 flex flex-wrap items-center gap-2 scroll-mt-24"
        >
          <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
            Filter:
          </span>
          {(["All", ...guideCategories] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                setFilter(c);
                track("filter_events", { filter: "night_edit_category", value: c });
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
                filter === c
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 md:grid-cols-2 lg:grid-cols-3">
          {filteredRest.map((a) => (
            <article
              key={a.slug}
              className="group flex cursor-pointer flex-col bg-card transition-colors hover:bg-secondary/40"
              onClick={() =>
                track("view_event", { article: a.slug, source: "night_edit" })
              }
            >
              {/* Cover */}
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <AssetImage
                  src={a.coverImage}
                  file={`article_${a.slug}_cover.webp`}
                  purpose={`Cover image for "${a.title}".`}
                  dimensions="1600 × 900"
                  crop="wide"
                  venue="night_edit"
                  alt={a.title}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute left-3 top-3 rounded-sm border border-foreground/20 bg-background/70 px-2.5 py-1 backdrop-blur-sm">
                  <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-accent">
                    {a.category}
                  </span>
                </div>
                {a.hasArabicVersion && (
                  <div className="absolute right-3 top-3 rounded-sm border border-foreground/20 bg-background/70 px-2 py-1 backdrop-blur-sm">
                    <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.12em] text-muted-foreground">
                      AR
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-serif-display text-lg leading-snug text-foreground transition-colors group-hover:text-accent">
                  {a.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
                  {a.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground tnum">
                    Reviewed {formatReviewedDate(a.reviewedDate)}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredRest.length === 0 && (
          <div className="mt-6 rounded-sm border border-border/40 bg-secondary/20 p-8 text-center">
            <p className="font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-muted-foreground">
              No articles in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
