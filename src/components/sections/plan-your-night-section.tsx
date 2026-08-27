"use client";

import { useState } from "react";
import { Clock, MapPin, Users, Shirt, IdCard, Car, CalendarCheck, Check, ChevronRight, PartyPopper, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

interface PlanStep {
  id: string;
  time: string;
  title: string;
  desc: string;
  icon: typeof Clock;
  category: "prep" | "travel" | "arrival" | "night";
}

const TIMELINE: PlanStep[] = [
  {
    id: "s1",
    time: "Before 9 PM",
    title: "Choose your venue",
    desc: "Use Find My Venue or browse Tonight to pick the right sound for your night.",
    icon: CalendarCheck,
    category: "prep",
  },
  {
    id: "s2",
    time: "Before 9 PM",
    title: "Request a VIP table",
    desc: "Submit a booking request early. The concierge confirms availability, minimum spend, and table location.",
    icon: Users,
    category: "prep",
  },
  {
    id: "s3",
    time: "Before 10 PM",
    title: "Check dress code & ID",
    desc: "Elevated nightlife attire. Bring original ID (passport, UAE driving licence, or UAE national ID). No copies accepted.",
    icon: Shirt,
    category: "prep",
  },
  {
    id: "s4",
    time: "10:30 PM",
    title: "Arrange transport",
    desc: "Taxi or hotel valet is the most reliable arrival. Both hotels have dedicated nightclub entrances.",
    icon: Car,
    category: "travel",
  },
  {
    id: "s5",
    time: "11:00 PM",
    title: "Arrive at the hotel",
    desc: "Enter through the main lobby. Follow signage to the dedicated nightclub elevators.",
    icon: MapPin,
    category: "arrival",
  },
  {
    id: "s6",
    time: "11:00 PM",
    title: "Present your booking reference",
    desc: "If you have a table booking, use the table host line for fast entry. Present your reference.",
    icon: IdCard,
    category: "arrival",
  },
  {
    id: "s7",
    time: "11:30 PM",
    title: "Doors open",
    desc: "Music starts. Your table team will guide you to your table and confirm service.",
    icon: Clock,
    category: "night",
  },
  {
    id: "s8",
    time: "Until 4 AM",
    title: "Enjoy the night",
    desc: "The room peaks between midnight and 2 AM. Service continues until close. Tip your host for great service.",
    icon: PartyPopper,
    category: "night",
  },
];

const CATEGORY_COLORS = {
  prep: { label: "Preparation", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  travel: { label: "Travel", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  arrival: { label: "Arrival", color: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  night: { label: "The Night", color: "text-green-300", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const STORAGE_KEY = "amd_plan_your_night";

/** Lazy init: read saved progress from localStorage on first client render. */
function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((x) => typeof x === "string"));
  } catch {
    /* no-op */
  }
  return new Set();
}

export function PlanYourNightSection() {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(loadChecked);

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Persist to localStorage.
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* no-op */
      }
      return next;
    });
    track("filter_events", { source: "plan_your_night", action: "toggle", step: id });
  };

  const resetProgress = () => {
    setCheckedSteps(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* no-op */
    }
    track("filter_events", { source: "plan_your_night", action: "reset" });
  };

  const progress = Math.round((checkedSteps.size / TIMELINE.length) * 100);

  return (
    <section id="plan-your-night" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Plan Your Night</span>
            <h2 className="heading-editorial mt-3 max-w-3xl text-4xl text-foreground md:text-6xl">
              Your night, step by step.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              A practical timeline from choosing your venue to doors opening. Check off each step as you go.
            </p>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3 rounded-sm border border-border/60 bg-secondary/40 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
              <span className="font-mono-tight tnum text-sm text-accent">{progress}%</span>
            </div>
            <div>
              <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                {checkedSteps.size} / {TIMELINE.length} steps
              </p>
              <p className="font-mono-tight text-[0.5625rem] text-foreground">
                {progress === 100 ? "You're ready!" : "Keep planning"}
              </p>
            </div>
            {checkedSteps.size > 0 && (
              <button
                onClick={resetProgress}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Reset progress"
                title="Reset progress"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TIMELINE.map((step, i) => {
            const checked = checkedSteps.has(step.id);
            const cat = CATEGORY_COLORS[step.category];
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={cn(
                  "group flex items-start gap-4 rounded-sm border p-5 text-left transition-all",
                  checked
                    ? "border-accent/40 bg-accent/5"
                    : "border-border/40 bg-card hover:border-foreground/20"
                )}
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      checked
                        ? "border-accent bg-accent text-background"
                        : cn("border-current", cat.color, cat.bg)
                    )}
                  >
                    {checked ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  {/* Connector line */}
                  {i < TIMELINE.length - 1 && (
                    <div className="hidden h-12 w-px bg-border/40 md:block" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em]", cat.color)}>
                      {step.time}
                    </span>
                    <span className={cn("rounded-full border px-1.5 py-0.5 font-mono-tight text-[0.45rem] uppercase tracking-[0.12em]", cat.border, cat.bg, cat.color)}>
                      {cat.label}
                    </span>
                  </div>
                  <h3 className={cn(
                    "mt-1 font-serif-display text-lg transition-colors",
                    checked ? "text-accent" : "text-foreground"
                  )}>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                </div>

                {/* Chevron */}
                <ChevronRight className={cn(
                  "mt-2 h-4 w-4 shrink-0 transition-colors",
                  checked ? "text-accent" : "text-muted-foreground/40"
                )} />
              </button>
            );
          })}
        </div>

        {/* Completion note */}
        {progress === 100 && (
          <div className="mt-8 flex items-center gap-3 rounded-sm border border-green-500/30 bg-green-500/5 p-4">
            <PartyPopper className="h-5 w-5 text-green-400" />
            <p className="text-sm text-foreground">
              You're all set. Have a great night at AFTER MIDNIGHT DXB. Present your booking reference at the table host line.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
