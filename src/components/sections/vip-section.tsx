"use client";

import { Users, Crown, Disc3, Building, ListChecks, ArrowRight } from "lucide-react";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { Button } from "@/components/ui/button";

const TABLE_TYPES = [
  { slug: "guest_list", icon: ListChecks, name: "Guest List", desc: "Entry access only — no seat. Arrive before the cutoff." },
  { slug: "standard_table", icon: Users, name: "Standard Table", desc: "A dedicated table in the main room with full service." },
  { slug: "premium_table", icon: Crown, name: "Premium Table", desc: "Better sightline, closer to the DJ or stage." },
  { slug: "stage_dj_table", icon: Disc3, name: "Stage / DJ Area", desc: "The closest table to the action. Limited availability." },
  { slug: "private_corporate", icon: Building, name: "Private / Corporate", desc: "Full or partial buyout enquiries for celebrations and brand events." },
] as const;

export function VipSection() {
  const { openConcierge } = useUi();

  return (
    <section id="vip" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <span className="eyebrow text-accent">VIP Experience</span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              Tables, not queues.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              Five booking types across three venues. Capacities, minimum spends, and inclusions are
              only shown when verified — everything else goes through the concierge so you get the
              current figure, not a guess.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-sm border border-border/40">
              <AssetImage
                src="/placeholders/home_vip_experience.webp"
                file="home_vip_experience.webp"
                purpose="Real premium table experience from one of the venues."
                dimensions="2000 × 1125"
                crop="wide"
                venue="global"
                alt="VIP table experience"
                className="aspect-[16/9] w-full"
              />
            </div>
          </div>
        </div>

        {/* Table types */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 md:grid-cols-2 lg:grid-cols-3">
          {TABLE_TYPES.map((t) => (
            <div key={t.slug} className="group bg-card p-6 transition-colors hover:bg-secondary/40">
              <div className="flex items-start justify-between">
                <t.icon className="h-6 w-6 text-accent" />
                <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {t.slug.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="mt-4 font-serif-display text-xl text-foreground">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <button
                onClick={() => {
                  track("start_vip_inquiry", { table_type: t.slug, source: "vip_section" });
                  openConcierge({});
                }}
                className="mt-4 flex items-center gap-1 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground"
              >
                Request this <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {[
            { n: "01", t: "Submit a request", d: "Venue, date, party size, and arrival time. Takes under two minutes." },
            { n: "02", t: "Concierge confirms", d: "We confirm availability, minimum spend, and table location. You get a booking reference." },
            { n: "03", t: "Arrive via table host", d: "Present your reference at the table host line on the night for fast entry." },
          ].map((s) => (
            <div key={s.n} className="border-l border-accent/30 pl-5">
              <span className="font-mono-tight text-[0.625rem] uppercase tracking-[0.2em] text-accent">{s.n}</span>
              <h3 className="mt-2 font-serif-display text-xl text-foreground">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-sm border border-border/60 bg-secondary/30 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h3 className="font-serif-display text-2xl text-foreground md:text-3xl">Ready to book?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We don't promise a response time until the business has measured it. Deposits are not processed
              until a verified payment workflow exists.
            </p>
          </div>
          <Button
            onClick={() => { track("start_vip_inquiry", { source: "vip_cta" }); openConcierge(); }}
            className="rounded-none bg-accent px-8 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-background hover:opacity-90"
          >
            Start VIP Request <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
