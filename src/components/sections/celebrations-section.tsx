"use client";

import { Cake, Heart, Users, Briefcase, Building2, Sparkles, Lock, ArrowRight } from "lucide-react";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";

const CELEBRATIONS = [
  {
    slug: "birthday",
    Icon: Cake,
    name: "Birthdays",
    desc: "Dedicated table, arrival plan, and a clear spot for the celebration moment.",
  },
  {
    slug: "bachelorette",
    Icon: Heart,
    name: "Bachelorette",
    desc: "Premium table with a better sightline and an early arrival window.",
  },
  {
    slug: "bachelor",
    Icon: Users,
    name: "Bachelor",
    desc: "Group table booking with controlled service and a clear pickup point.",
  },
  {
    slug: "corporate_hosting",
    Icon: Briefcase,
    name: "Corporate hosting",
    desc: "Hospitality for teams, visiting executives, and internal celebrations.",
  },
  {
    slug: "client_entertainment",
    Icon: Building2,
    name: "Client entertainment",
    desc: "Discreet, reliable hosting for visiting clients and partners.",
  },
  {
    slug: "brand_activations",
    Icon: Sparkles,
    name: "Brand activations",
    desc: "Full or partial venue bookings for product and brand moments.",
  },
  {
    slug: "private_venue_enquiries",
    Icon: Lock,
    name: "Private venue enquiries",
    desc: "Buyouts, private sections, and full venue reservations.",
  },
];

export function CelebrationsSection() {
  const { openBooking } = useUi();

  return (
    <section id="celebrations" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Celebrations</span>
            <h2 className="heading-editorial mt-3 max-w-3xl text-4xl text-foreground md:text-6xl">
              Plan a night worth remembering.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              Tell us the occasion, the venue, and the date. The concierge confirms the table, any inclusions,
              and the arrival plan — without promising details that haven&apos;t been verified.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 px-4 py-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              One concierge across three venues.
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 md:grid-cols-2 lg:grid-cols-4">
          {CELEBRATIONS.map((c) => (
            <article
              key={c.slug}
              className="group flex flex-col bg-card p-6 transition-colors hover:bg-secondary/40"
            >
              <div className="flex items-start justify-between">
                <c.Icon className="h-6 w-6 text-accent" />
                <span className="font-mono-tight text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground">
                  {c.slug.replace(/_/g, " ")}
                </span>
              </div>
              <h3 className="mt-4 font-serif-display text-xl text-foreground">{c.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              <button
                onClick={() => {
                  track("start_vip_inquiry", { occasion: c.slug, source: "celebrations" });
                  openBooking({ venue: "any", eventOrDate: c.name });
                }}
                className="mt-5 flex items-center gap-1 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground"
              >
                Enquire
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </article>
          ))}
        </div>

        {/* Editorial image strip */}
        <div className="mt-12 overflow-hidden rounded-sm border border-border/40">
          <AssetImage
            src="/placeholders/home_celebrations_wide.webp"
            file="home_celebrations_wide.webp"
            purpose="Editorial celebrations image — table moment, group, lighting, and venue identity."
            dimensions="2000 × 1125"
            crop="wide"
            venue="global"
            alt="Celebrations at ABOVE MIDNIGHT DXB"
            className="aspect-[16/7] w-full md:aspect-[16/5]"
          />
        </div>

        {/* Verification note */}
        <p className="mt-6 font-mono-tight text-[0.6875rem] text-muted-foreground">
          We don&apos;t confirm specific inclusions or minimum spends until verified.
        </p>
      </div>
    </section>
  );
}
