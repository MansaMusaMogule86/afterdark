"use client";

import Link from "next/link";
import { Instagram, ArrowUpRight, Sparkles } from "lucide-react";
import { ENGLISH_NIGHT_HASHTAG } from "@/lib/english-nights";
import { AssetImage } from "@/components/asset-image";
import { track } from "@/lib/analytics";

export function EnglishNightsPromo() {
  return (
    <section className="relative border-t border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
        <div className="grid items-center gap-8 md:grid-cols-12">
          {/* Visual */}
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm border border-border/40">
              <AssetImage
                src="/placeholders/english_nights_promo.webp"
                file="english_nights_promo.webp"
                purpose="Editorial English Night image — crowd, lighting, and venue identity."
                dimensions="2000 × 1125"
                crop="wide"
                venue="global"
                alt="English Nights at After Midnight DXB"
                className="h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/30 to-transparent" />
              {/* Hashtag overlay */}
              <div className="absolute bottom-4 left-4 rounded-sm border border-accent/30 bg-background/70 px-3 py-2 backdrop-blur-sm">
                <span className="font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-accent">
                  {ENGLISH_NIGHT_HASHTAG}
                </span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="md:col-span-7">
            <span className="eyebrow text-accent">
              <Instagram className="mr-1 inline h-3 w-3" />
              Instagram Automation
            </span>
            <h2 className="heading-editorial mt-3 text-3xl text-foreground md:text-5xl">
              English Nights, direct from Instagram.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              We don't import the whole feed. English Night events appear here only when the venue
              teams tag a post with <code className="rounded bg-secondary px-1.5 py-0.5 text-accent">{ENGLISH_NIGHT_HASHTAG}</code>.
              Each post is parsed, classified, and auto-published only when venue, date, time, and
              media are all validated.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/?view=english-nights"
                onClick={() => track("view_event", { source: "en_promo" })}
                className="inline-flex items-center gap-2 rounded-none bg-foreground px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-background transition-colors hover:bg-accent"
              >
                <Sparkles className="h-4 w-4" />
                View English Nights
                <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link
                href="/?view=english-nights-admin"
                onClick={() => track("filter_events", { source: "en_promo_admin" })}
                className="inline-flex items-center gap-2 rounded-none border border-foreground/30 px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground/10"
              >
                Import Review
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40">
              <MiniStat label="Approved accounts" value="3" />
              <MiniStat label="Hashtag filter" value="1" />
              <MiniStat label="Auto-publish" value="Validated" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-3">
      <p className="font-mono-tight text-[0.5rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif-display text-lg text-foreground">{value}</p>
    </div>
  );
}
