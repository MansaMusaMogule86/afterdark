"use client";

import { ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";

const STATS = [
  { value: "3", label: "Venues" },
  { value: "2", label: "Skyline addresses" },
  { value: "1", label: "Concierge" },
  { value: "21+", label: "Age" },
];

const FAQS: { slug: string; q: string; a: string }[] = [
  {
    slug: "id-requirements",
    q: "What ID do I need at the door?",
    a: "Original passport, original UAE driving licence, or original UAE national ID (residents only). Photocopies, photos, and digital IDs are not accepted. The door team checks ID for every guest, every night.",
  },
  {
    slug: "dress-code",
    q: "What's the dress code?",
    a: "Elevated. Sportswear, flip flops, shorts, and beachwear are not accepted. Smart shoes are safest; clean sneakers are accepted on selected nights only. When in doubt, dress up rather than down — the door team's decision is final.",
  },
  {
    slug: "age",
    q: "How old do I need to be?",
    a: "21 and over, with original ID. No exceptions, including for hotel guests and table bookings.",
  },
  {
    slug: "how-to-book-a-table",
    q: "How do I book a table?",
    a: "Submit a VIP request through the booking form with your venue, date, party size, arrival time, and occasion. The concierge confirms availability, minimum spend, and table location. You receive a booking reference — present it at the table host line on the night for fast entry.",
  },
  {
    slug: "guest-list-vs-table",
    q: "Guest list or table — what's the difference?",
    a: "A guest list request gives you entry access only — no seat, no table. A table reservation gives you a dedicated table, full service, and a clear spot in the room. For groups, birthdays, and celebrations, a table is the more reliable path. For a quick night out, the guest list can work if you arrive before the cutoff.",
  },
  {
    slug: "getting-there",
    q: "How do I get to the venues?",
    a: "Taxi and hotel transfer are the most reliable arrivals, especially after midnight. Both Shangri La Dubai (Avenue) and Hilton Dubai Al Habtoor City (Ora and Black Tape) have hotel valet and dedicated nightclub entrances. Metro walking times are not published until verified.",
  },
  {
    slug: "service-date-logic",
    q: "Why does the night reset at 6 AM?",
    a: "Dubai nightlife runs on service days that reset at 6 AM local time, not midnight. A night that starts at 11 PM and finishes at 4 AM belongs to the same service date. This matters for guest list cutoffs, table reservations, and event listings — always confirm which service date your booking is attached to.",
  },
  {
    slug: "venue-differences",
    q: "What's the difference between Avenue, Ora, and Black Tape?",
    a: "Avenue leads with Arabic and Khaleeji nights above Sheikh Zayed Road (Shangri La Dubai, level forty two). Ora runs Arabic, Khaleeji, international, and house with an immersive visual system (Hilton Dubai Al Habtoor City, level forty four). Black Tape is hip hop, R&B, Afro, and Dancehall — sharp urban identity on the same floor as Ora, different room. Use the venue matcher if you're unsure which fits your night.",
  },
];

export function AboutFaqSection() {
  const { openConcierge } = useUi();

  return (
    <section id="about" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* About */}
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <span className="eyebrow text-accent">About</span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
              One owner. Three venues. One Dubai after dark.
            </h2>
            <div className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                {siteConfig.parentName} is the most direct way to discover and reserve the right Dubai night
                across three distinct venues — Avenue, Ora, and Black Tape. One concierge, three rooms, two
                skyline addresses.
              </p>
              <p>
                {siteConfig.promise} We show what is live tonight, compare the venues side by side, and route
                every booking through a single nightlife concierge — so you never need to message three
                different promoters to find out where to go.
              </p>
              <p>
                Operational facts — minimum spends, opening hours, schedules, and contact details — are shown
                as pending verification until the owner confirms them. We publish verified figures only. We do
                not promise response times or take payments until verified workflows are in place.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="md:col-span-5">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40">
              {STATS.map((s) => (
                <div key={s.label} className="bg-card p-6">
                  <p className="heading-editorial tnum text-4xl text-foreground md:text-5xl">
                    {s.value}
                  </p>
                  <p className="mt-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">
              Pending verification
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="mt-20 scroll-mt-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow text-accent">FAQ</span>
              <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
                Before you go
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                Practical answers to the questions guests ask before arriving. No filler — the short answer
                comes first.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-12">
            {/* Accordion */}
            <div className="md:col-span-8">
              <Accordion
                type="single"
                collapsible
                onValueChange={(value) => {
                  if (value) track("filter_events", { faq_open: value });
                }}
                className="rounded-sm border border-border/40 bg-card px-6"
              >
                {FAQS.map((f) => (
                  <AccordionItem key={f.slug} value={f.slug} className="border-border/40">
                    <AccordionTrigger className="text-left font-serif-display text-base text-foreground hover:no-underline md:text-lg">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Concierge CTA */}
            <div className="md:col-span-4">
              <div className="rounded-sm border border-border/40 bg-secondary/30 p-6">
                <span className="eyebrow text-accent">Still unsure?</span>
                <h3 className="font-serif-display mt-3 text-2xl text-foreground md:text-3xl">
                  Talk to the concierge.
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  One team across Avenue, Ora, and Black Tape. Submit a request and the right venue team
                  responds.
                </p>
                <Button
                  onClick={() => {
                    track("start_vip_inquiry", { source: "about_faq_cta" });
                    openConcierge();
                  }}
                  className="mt-5 w-full rounded-none bg-accent px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-background hover:opacity-90"
                >
                  Contact Concierge
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
