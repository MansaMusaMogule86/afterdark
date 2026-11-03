"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Check, CalendarCheck, Share2, MessageCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { runVenueMatcher, matcherDateOptions, type MatcherInput } from "@/lib/matcher";
import { getVenue } from "@/lib/venue-data";
import { getOccurrence } from "@/lib/events-data";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { VenueVideo } from "@/components/venue-video";
import type { MusicGenre } from "@/lib/types";

type Mood = MatcherInput["mood"];
type Occasion = MatcherInput["occasion"];
type Budget = MatcherInput["budget"];

const STEPS = ["Date", "Music", "Mood", "Location", "Group", "Occasion", "Budget"] as const;

const MUSIC_OPTIONS: { value: MusicGenre | "any"; label: string; desc: string }[] = [
  { value: "arabic", label: "Arabic & Khaleeji", desc: "Resident Arabic sets, live percussion." },
  { value: "hiphop", label: "Hip Hop", desc: "Sharp urban energy." },
  { value: "rnb", label: "R&B", desc: "Smooth late-night R&B." },
  { value: "afro", label: "Afro & Dancehall", desc: "Afrobeats, dancehall, movement." },
  { value: "international", label: "International & House", desc: "Open-format crossover." },
  { value: "any", label: "No preference", desc: "Show me everything." },
];

const MOOD_OPTIONS: { value: Mood; label: string; desc: string }[] = [
  { value: "energy", label: "High energy", desc: "Peak crowd, peak sound." },
  { value: "immersive", label: "Immersive", desc: "Visuals and light as part of the night." },
  { value: "social", label: "Social", desc: "Table culture, conversation, control." },
  { value: "late", label: "Late", desc: "After midnight, until close." },
  { value: "any", label: "No preference", desc: "Any mood works." },
];

const LOCATION_OPTIONS: { value: MatcherInput["location"]; label: string; desc: string }[] = [
  { value: "shangrila", label: "Sheikh Zayed Road", desc: "Shangri La Dubai — Avenue." },
  { value: "habtoor", label: "Al Habtoor City", desc: "Hilton Dubai — Ora & Black Tape." },
  { value: "any", label: "No preference", desc: "Either location." },
];

const OCCASION_OPTIONS: { value: Occasion; label: string }[] = [
  { value: "night_out", label: "Night out" },
  { value: "birthday", label: "Birthday" },
  { value: "bachelorette", label: "Bachelorette" },
  { value: "corporate", label: "Corporate" },
  { value: "date", label: "Date night" },
  { value: "any", label: "Any occasion" },
];

const BUDGET_OPTIONS: { value: Budget; label: string; desc: string }[] = [
  { value: "standard", label: "Standard table", desc: "Main room, full service." },
  { value: "premium", label: "Premium table", desc: "Better sightline, higher spend." },
  { value: "stage", label: "Stage / DJ area", desc: "Closest to the action." },
  { value: "any", label: "Not sure yet", desc: "Concierge can advise." },
];

export function MatcherSection() {
  const { openConcierge, openEventDrawer } = useUi();
  const dates = matcherDateOptions();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<MatcherInput>({
    preferredDate: dates[0].value,
    music: "any",
    mood: "any",
    location: "any",
    groupSize: 4,
    occasion: "any",
    budget: "any",
  });
  const [submitted, setSubmitted] = useState(false);

  const results = submitted ? runVenueMatcher(input) : [];
  const top = results[0];
  const topVenue = top ? getVenue(top.venue) : null;
  const topEvent = top?.event ? getOccurrence(top.event.id) : null;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    track("complete_venue_matcher", {
      music: input.music, mood: input.mood, location: input.location,
      occasion: input.occasion, budget: input.budget, groupSize: input.groupSize,
    });
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setStep(0);
  };

  return (
    <section id="find-my-venue" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-accent">Find My Venue</span>
            <h2 className="heading-editorial mt-3 max-w-3xl text-4xl text-foreground md:text-6xl">
              Answer seven questions. Get the right room.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              The matcher ranks live events and venues using structured data only — no open-ended chatbot,
              no hallucinated schedules or pricing. Your recommendation explains itself in one sentence.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-secondary/40 px-4 py-3">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
              Uses live venue + event records only.
            </p>
          </div>
        </div>

        {/* Matcher card */}
        <div className="mt-12 overflow-hidden rounded-sm border border-border/60 bg-card">
          {!submitted ? (
            <div className="grid md:grid-cols-12">
              {/* Progress rail */}
              <div className="border-b border-border/40 p-4 md:col-span-4 md:border-b-0 md:border-r md:p-8">
                {/* Mobile progress summary */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-accent">
                      Step {step + 1} of {STEPS.length}
                    </span>
                    <span className="font-mono-tight text-xs text-muted-foreground">
                      {STEPS[step]}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2.5 flex gap-1">
                    {STEPS.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => setStep(i)}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          i <= step ? "bg-accent" : "bg-border/60"
                        )}
                        aria-label={`Go to step ${i + 1}: ${s}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Desktop progress rail */}
                <div className="hidden md:block">
                  <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
                    Step {step + 1} / {STEPS.length}
                  </p>
                  <h3 className="mt-2 font-serif-display text-2xl text-foreground">
                    {STEPS[step]}
                  </h3>
                  <div className="mt-6 space-y-1.5">
                    {STEPS.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => setStep(i)}
                        className={cn(
                          "flex w-full items-center gap-3 py-1 text-left font-mono-tight text-[0.6875rem] uppercase tracking-[0.12em] transition-colors",
                          i === step ? "text-accent" : i < step ? "text-foreground/70" : "text-muted-foreground/50"
                        )}
                      >
                        <span className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[0.5rem]",
                          i < step ? "border-accent bg-accent text-background" : i === step ? "border-accent text-accent" : "border-border"
                        )}>
                          {i < step ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step content */}
              <div className="p-6 md:col-span-8 md:p-8">
                {step === 0 && (
                  <StepWrap title="Which night?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dates.map((d) => (
                        <OptionCard
                          key={d.value}
                          active={input.preferredDate === d.value}
                          onClick={() => setInput({ ...input, preferredDate: d.value })}
                          label={d.label}
                        />
                      ))}
                    </div>
                  </StepWrap>
                )}
                {step === 1 && (
                  <StepWrap title="What sound fits you?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MUSIC_OPTIONS.map((o) => (
                        <OptionCard
                          key={o.value}
                          active={input.music === o.value}
                          onClick={() => setInput({ ...input, music: o.value })}
                          label={o.label}
                          desc={o.desc}
                        />
                      ))}
                    </div>
                  </StepWrap>
                )}
                {step === 2 && (
                  <StepWrap title="What mood?">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {MOOD_OPTIONS.map((o) => (
                        <OptionCard
                          key={o.value}
                          active={input.mood === o.value}
                          onClick={() => setInput({ ...input, mood: o.value })}
                          label={o.label}
                          desc={o.desc}
                        />
                      ))}
                    </div>
                  </StepWrap>
                )}
                {step === 3 && (
                  <StepWrap title="Preferred location?">
                    <div className="grid gap-2">
                      {LOCATION_OPTIONS.map((o) => (
                        <OptionCard
                          key={o.value}
                          active={input.location === o.value}
                          onClick={() => setInput({ ...input, location: o.value })}
                          label={o.label}
                          desc={o.desc}
                        />
                      ))}
                    </div>
                  </StepWrap>
                )}
                {step === 4 && (
                  <StepWrap title="How many in your group?">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      {[2, 3, 4, 6, 8, 10, 12].map((n) => (
                        <button
                          key={n}
                          onClick={() => setInput({ ...input, groupSize: n })}
                          className={cn(
                            "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-sm border font-serif-display text-lg sm:text-xl transition-colors",
                            input.groupSize === n ? "border-accent bg-accent text-background" : "border-border text-foreground hover:border-foreground/50"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                      <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-2">
                        <label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">Or enter</label>
                        <input
                          type="number" min={1} max={50}
                          value={input.groupSize}
                          onChange={(e) => setInput({ ...input, groupSize: parseInt(e.target.value) || 1 })}
                          className="w-20 rounded-sm border border-border bg-background px-3 py-2 text-base md:text-sm text-foreground"
                        />
                      </div>
                    </div>
                  </StepWrap>
                )}
                {step === 5 && (
                  <StepWrap title="What's the occasion?">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {OCCASION_OPTIONS.map((o) => (
                        <OptionCard
                          key={o.value}
                          active={input.occasion === o.value}
                          onClick={() => setInput({ ...input, occasion: o.value })}
                          label={o.label}
                        />
                      ))}
                    </div>
                  </StepWrap>
                )}
                {step === 6 && (
                  <StepWrap title="Table budget range?">
                    <div className="grid gap-2">
                      {BUDGET_OPTIONS.map((o) => (
                        <OptionCard
                          key={o.value}
                          active={input.budget === o.value}
                          onClick={() => setInput({ ...input, budget: o.value })}
                          label={o.label}
                          desc={o.desc}
                        />
                      ))}
                    </div>
                  </StepWrap>
                )}

                {/* Nav */}
                <div className="mt-8 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={prev}
                    disabled={step === 0}
                    className="rounded-none text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button onClick={next} className="rounded-none bg-foreground px-6 text-background hover:bg-accent">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={submit} className="rounded-none bg-accent px-6 text-background hover:opacity-90">
                      <Sparkles className="mr-2 h-4 w-4" /> Show Recommendation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="p-6 md:p-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow text-accent">Your match</span>
                  <h3 className="heading-editorial mt-2 text-3xl text-foreground md:text-5xl">
                    {topVenue?.shortName}
                  </h3>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Restart
                </button>
              </div>

              {/* Top recommendation reason */}
              <div data-venue={top?.venue} className="venue-surface mt-6 rounded-sm p-6">
                <p className="text-sm leading-relaxed text-[var(--venue-foreground)] md:text-base">
                  {top?.reason}
                </p>
                {topEvent && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--venue-foreground)]/10 pt-4">
                    <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-accent)]">
                      Live event
                    </span>
                    <span className="text-sm text-[var(--venue-foreground)]">{topEvent.title}</span>
                    <span className="font-mono-tight text-[0.625rem] text-[var(--venue-muted)]">
                      Doors {topEvent.startTime}
                    </span>
                  </div>
                )}
                {top?.venue === "blacktape" && topVenue?.heroVideo && (
                  <div className="mt-4 overflow-hidden rounded-sm border border-[var(--venue-foreground)]/15 aspect-[16/9] max-h-56">
                    <VenueVideo
                      src={topVenue.heroVideo}
                      alt="Black Tape recommendation preview"
                      className="h-full w-full"
                      allowSound={false}
                      showPlayPause={false}
                      overlay={false}
                    />
                  </div>
                )}
              </div>

              {/* Result actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                {topEvent && (
                  <Button
                    onClick={() => { track("view_event", { id: topEvent.id, source: "matcher_result" }); openEventDrawer(topEvent.id); }}
                    className="rounded-none bg-foreground px-6 text-background hover:bg-accent"
                  >
                    View Recommended Event <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={() => { track("start_vip_inquiry", { venue: top?.venue, source: "matcher_result" }); openConcierge({ venue: top?.venue, eventOrDate: topEvent?.title }); }}
                  className="rounded-none bg-accent px-6 text-background hover:opacity-90"
                >
                  <CalendarCheck className="mr-2 h-4 w-4" /> Reserve VIP
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    track("click_whatsapp", { venue: top?.venue, source: "matcher_result" });
                    const text = encodeURIComponent(`Hi, I used the venue matcher on ABOVE MIDNIGHT DXB and it recommended ${topVenue?.name}${topEvent ? ` for ${topEvent.title}` : ""}. I'd like to discuss a table.`);
                    window.open(`https://wa.me/?text=${text}`, "_blank");
                  }}
                  className="rounded-none border-foreground/30"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    track("click_map", { source: "matcher_share" });
                    if (navigator.share && topVenue) {
                      navigator.share({ title: "My venue match", text: `The venue matcher recommended ${topVenue.name}.`, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href);
                    }
                  }}
                  className="rounded-none"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>

              {/* Other ranked venues */}
              <div className="mt-10">
                <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Also considered
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {results.slice(1).map((r) => {
                    const v = getVenue(r.venue)!;
                    return (
                      <button
                        key={r.venue}
                        data-venue={r.venue}
                        onClick={() => { track("view_venue", { venue: r.venue, source: "matcher_alt" }); useUi.getState().openVenueDrawer(r.venue); }}
                        className="venue-surface flex items-center justify-between rounded-sm border border-[var(--venue-foreground)]/10 p-4 text-left transition-colors hover:border-[var(--venue-accent)]/40"
                      >
                        <div>
                          <p className="font-serif-display text-base text-[var(--venue-foreground)]">{v.shortName}</p>
                          <p className="mt-1 line-clamp-1 text-xs text-[var(--venue-muted)]">{r.reason}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[var(--venue-muted)]" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StepWrap({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif-display text-2xl text-foreground md:text-3xl">{title}</h3>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function OptionCard({
  active, onClick, label, desc,
}: { active: boolean; onClick: () => void; label: string; desc?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative rounded-sm border p-4 text-left transition-all",
        active ? "border-accent bg-accent/10" : "border-border hover:border-foreground/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-sm font-medium", active ? "text-accent" : "text-foreground")}>{label}</span>
        <span className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
          active ? "border-accent bg-accent text-background" : "border-border"
        )}>
          {active && <Check className="h-2.5 w-2.5" />}
        </span>
      </div>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
    </button>
  );
}
