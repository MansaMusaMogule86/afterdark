"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  X, Crown, ListChecks, Cake, Building2, HelpCircle,
  ChevronLeft, ChevronRight, Check, MessageCircle, Phone, Copy, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { eventOccurrences, getOccurrence } from "@/lib/events-data";
import { matcherDateOptions } from "@/lib/matcher";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type RequestType = "vip_table" | "guest_list" | "celebration" | "private_event" | "general";

interface RequestTypeOption {
  value: RequestType;
  label: string;
  desc: string;
  icon: typeof Crown;
}

const REQUEST_TYPES: RequestTypeOption[] = [
  { value: "vip_table", label: "VIP Table", desc: "Dedicated table with service", icon: Crown },
  { value: "guest_list", label: "Guest List", desc: "Entry access, no table", icon: ListChecks },
  { value: "celebration", label: "Birthday or Celebration", desc: "Birthday, bachelorette, anniversary", icon: Cake },
  { value: "private_event", label: "Private Event", desc: "Buyout, corporate, brand activation", icon: Building2 },
  { value: "general", label: "General Event Question", desc: "Anything else", icon: HelpCircle },
];

const VENUE_OPTIONS = [
  { value: "avenue", label: "Avenue" },
  { value: "ora", label: "Ora" },
  { value: "blacktape", label: "Black Tape" },
  { value: "help_choose", label: "Help Me Choose" },
];

const ARRIVAL_TIMES = ["10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "Flexible"];

const BUDGET_RANGES = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "stage", label: "Stage / DJ Area" },
  { value: "unsure", label: "Not sure yet" },
];

const OCCASIONS = [
  { value: "night_out", label: "Night out" },
  { value: "birthday", label: "Birthday" },
  { value: "bachelorette", label: "Bachelorette" },
  { value: "bachelor", label: "Bachelor" },
  { value: "corporate", label: "Corporate" },
  { value: "date", label: "Date night" },
  { value: "other", label: "Other" },
];

interface ConciergeForm {
  requestType: RequestType | null;
  venue: string;
  eventOrDate: string;
  eventId?: string;
  eventDate?: string;
  partySize: number;
  arrivalTime: string;
  budgetRange: string;
  occasion: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  marketingConsent: boolean;
  // honeypot
  company_website: string;
}

const EMPTY_FORM: ConciergeForm = {
  requestType: null,
  venue: "",
  eventOrDate: "",
  partySize: 4,
  arrivalTime: "11:00 PM",
  budgetRange: "standard",
  occasion: "night_out",
  fullName: "",
  mobileNumber: "",
  email: "",
  marketingConsent: false,
  company_website: "",
};

const STEPS = ["Request Type", "Night Details", "Contact"] as const;

export function ConciergeBottomSheet() {
  const { conciergeOpen, conciergePreset, closeConcierge } = useUi();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ConciergeForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState<{ reference: string; whatsappUrl: string } | null>(null);
  const [attribution, setAttribution] = useState<{ firstReferrer?: string; lastReferrer?: string; campaign?: string; promoter?: string; concierge?: string }>({});
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const dates = matcherDateOptions();

  // Apply preset when opened.
  useEffect(() => {
    if (conciergeOpen && conciergePreset) {
      setForm((f) => ({
        ...f,
        venue: conciergePreset.venue ?? f.venue,
        eventOrDate: conciergePreset.eventOrDate ?? f.eventOrDate,
        eventId: conciergePreset.eventId ?? f.eventId,
        eventDate: conciergePreset.eventDate ?? f.eventDate,
        occasion: conciergePreset.occasion ?? f.occasion,
      }));
    }
  }, [conciergeOpen, conciergePreset]);

  // Capture attribution from URL on open.
  useEffect(() => {
    if (!conciergeOpen) return;
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const promoter = params.get("promoter") || params.get("p");
    const concierge = params.get("concierge") || params.get("c");
    const campaign = params.get("campaign") || params.get("utm_campaign");
    const ref = params.get("ref") || params.get("utm_source") || document.referrer || undefined;
    setAttribution({
      firstReferrer: ref,
      lastReferrer: ref,
      campaign: campaign || undefined,
      promoter: promoter || undefined,
      concierge: concierge || undefined,
    });
    if (promoter) setForm((f) => ({ ...f, promoterCode: promoter } as ConciergeForm));
    // Store trigger element for focus restoration.
    triggerRef.current = document.activeElement as HTMLElement;
    // Track open.
    track("concierge_open", { source: conciergePreset?.source || "unknown" });
  }, [conciergeOpen]);

  // Lock body scroll when open.
  useEffect(() => {
    if (!conciergeOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [conciergeOpen]);

  // Close on Escape, restore focus.
  useEffect(() => {
    if (!conciergeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [conciergeOpen]);

  const handleClose = () => {
    closeConcierge();
    // Restore focus to trigger.
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 100);
  };

  // Focus trap.
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const focusable = sheet.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const set = <K extends keyof ConciergeForm>(k: K, v: ConciergeForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (s: number): string | null => {
    if (s === 0 && !form.requestType) return "Please select a request type.";
    if (s === 1) {
      if (!form.venue) return "Please select a venue.";
      if (!form.eventOrDate) return "Please choose an event or date.";
      if (form.partySize < 1 || form.partySize > 50) return "Party size must be 1–50.";
    }
    if (s === 2) {
      if (!form.fullName.trim()) return "Full name is required.";
      if (!form.mobileNumber.trim()) return "Mobile number is required.";
      if (!/^[+\d][\d\s-]{6,}$/.test(form.mobileNumber)) return "Enter a valid mobile number.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      toast({ title: "Check your details", description: err, variant: "destructive" });
      return;
    }
    if (step === 0 && form.requestType) {
      track("concierge_request_type_selected", { request_type: form.requestType });
    }
    if (step === 1) {
      track("concierge_venue_selected", { venue: form.venue });
      track("concierge_details_completed", { has_event: !!form.eventId });
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const err = validateStep(2);
    if (err) {
      toast({ title: "Check your details", description: err, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // Create NightOps lead via API.
      // Map concierge form to the bookings API schema.
      const payload = {
        venue: form.venue === "help_choose" ? "any" : form.venue,
        eventOrDate: form.eventOrDate,
        partySize: form.partySize,
        arrivalTime: form.arrivalTime,
        tablePreference: form.requestType === "vip_table" ? "standard_table" : "guest_list",
        budgetRange: form.budgetRange,
        occasion: form.occasion,
        fullName: form.fullName,
        whatsappNumber: form.mobileNumber,
        email: form.email || "no-email@provided.com", // API requires email; use placeholder if not provided
        marketingConsent: form.marketingConsent,
        hotelGuest: false,
        company_website: form.company_website,
        ...attribution,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      track("concierge_lead_created", { request_type: form.requestType || undefined, venue: form.venue });

      // Generate WhatsApp prefilled message.
      const venueName = form.venue === "help_choose"
        ? "Help me choose"
        : venues.find((v) => v.slug === form.venue)?.name ?? form.venue;
      const whatsappText = `Hi ABOVE MIDNIGHT DXB,

I would like to enquire about a ${REQUEST_TYPES.find((r) => r.value === form.requestType)?.label || "request"}.

Venue: ${venueName}
${form.eventOrDate ? `Event: ${form.eventOrDate}\n` : ""}Guests: ${form.partySize}
Arrival: ${form.arrivalTime}
Reference: ${data.reference}`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
      setLead({ reference: data.reference, whatsappUrl });
    } catch (e) {
      toast({
        title: "Submission failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    if (!lead) return;
    track("concierge_whatsapp_opened", { has_lead: true });
    window.open(lead.whatsappUrl, "_blank");
  };

  const copyReference = () => {
    if (!lead) return;
    navigator.clipboard?.writeText(lead.reference);
    toast({ title: "Reference copied", description: lead.reference });
  };

  const submitWithoutWhatsApp = () => {
    track("concierge_fallback_selected", { fallback: "submit_without_whatsapp" });
    toast({
      title: "Request submitted",
      description: `Reference ${lead?.reference}. The concierge team will contact you.`,
    });
    handleClose();
    setTimeout(() => {
      setStep(0);
      setForm(EMPTY_FORM);
      setLead(null);
    }, 300);
  };

  if (!conciergeOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center md:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Night Concierge"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative z-10 flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-lg border border-border/60 bg-card shadow-2xl md:max-w-lg md:rounded-lg"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="border-b border-border/40 p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="eyebrow text-accent">Plan Your Night</span>
              <h2 className="mt-1 font-serif-display text-xl text-foreground">
                {lead ? "Request received" : "Night Concierge"}
              </h2>
              {!lead && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Tell us what you need and we will route your request to the correct venue team.
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Close concierge"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {!lead && (
            <div className="mt-4 flex gap-1">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-accent" : "bg-border"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {lead ? (
            <ConfirmationView
              lead={lead}
              form={form}
              onWhatsApp={openWhatsApp}
              onCopy={copyReference}
              onWithoutWhatsApp={submitWithoutWhatsApp}
            />
          ) : (
            <>
              {step === 0 && (
                <Step title="What do you need?">
                  <div className="space-y-2">
                    {REQUEST_TYPES.map((opt) => {
                      const Icon = opt.icon;
                      const active = form.requestType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => set("requestType", opt.value)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-sm border p-3 text-left transition-colors",
                            active
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-foreground/30"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-muted-foreground")} />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium", active ? "text-accent" : "text-foreground")}>
                              {opt.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                          {active && <Check className="h-4 w-4 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                </Step>
              )}

              {step === 1 && (
                <Step title="Night details">
                  <Field label="Preferred venue">
                    <div className="grid grid-cols-2 gap-2">
                      {VENUE_OPTIONS.map((v) => (
                        <button
                          key={v.value}
                          onClick={() => set("venue", v.value)}
                          className={cn(
                            "rounded-sm border px-3 py-2 text-xs font-medium transition-colors",
                            form.venue === v.value
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-foreground hover:border-foreground/30"
                          )}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Event or date">
                    <select
                      value={form.eventOrDate}
                      onChange={(e) => set("eventOrDate", e.target.value)}
                      className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-base md:text-sm text-foreground"
                    >
                      <option value="">Select a date…</option>
                      {dates.map((d) => (
                        <option key={d.value} value={d.label}>{d.label}</option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Number of guests">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={form.partySize}
                        onChange={(e) => set("partySize", parseInt(e.target.value) || 1)}
                      />
                    </Field>
                    <Field label="Arrival time">
                      <select
                        value={form.arrivalTime}
                        onChange={(e) => set("arrivalTime", e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-base md:text-sm text-foreground"
                      >
                        {ARRIVAL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Budget only for VIP or private event */}
                  {(form.requestType === "vip_table" || form.requestType === "private_event") && (
                    <Field label="Budget range">
                      <div className="flex flex-wrap gap-2">
                        {BUDGET_RANGES.map((b) => (
                          <button
                            key={b.value}
                            onClick={() => set("budgetRange", b.value)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs transition-colors",
                              form.budgetRange === b.value
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-foreground"
                            )}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}

                  {/* Occasion for celebrations */}
                  {(form.requestType === "celebration" || form.requestType === "private_event") && (
                    <Field label="Occasion">
                      <select
                        value={form.occasion}
                        onChange={(e) => set("occasion", e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-base md:text-sm text-foreground"
                      >
                        {OCCASIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </Field>
                  )}
                </Step>
              )}

              {step === 2 && (
                <Step title="Contact details">
                  <Field label="Full name">
                    <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Your name" />
                  </Field>
                  <Field label="Mobile number">
                    <Input
                      value={form.mobileNumber}
                      onChange={(e) => set("mobileNumber", e.target.value)}
                      placeholder="+971…"
                      inputMode="tel"
                    />
                  </Field>
                  <Field label="Email (optional)">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Marketing consent (optional)">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.marketingConsent}
                        onCheckedChange={(v) => set("marketingConsent", v === true)}
                        className="mt-0.5"
                      />
                      <span className="text-xs text-muted-foreground">
                        I agree to receive marketing updates about events and offers. I can withdraw consent at any time.
                        This is separate from being contacted about my request.
                      </span>
                    </label>
                  </Field>
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="company_website"
                    value={form.company_website}
                    onChange={(e) => set("company_website", e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    aria-hidden
                  />
                </Step>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!lead && (
          <div className="flex items-center justify-between border-t border-border/40 p-4 safe-pb">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className="rounded-none text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} className="rounded-none bg-foreground px-6 text-background hover:bg-accent">
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={submitting}
                className="rounded-none bg-accent px-6 text-background hover:opacity-90"
              >
                {submitting ? "Creating lead…" : "Continue to Concierge"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="slideUp"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function ConfirmationView({
  lead, form, onWhatsApp, onCopy, onWithoutWhatsApp,
}: {
  lead: { reference: string; whatsappUrl: string };
  form: ConciergeForm;
  onWhatsApp: () => void;
  onCopy: () => void;
  onWithoutWhatsApp: () => void;
}) {
  const venueName = form.venue === "help_choose"
    ? "Help me choose"
    : venues.find((v) => v.slug === form.venue)?.name ?? form.venue;
  const requestLabel = REQUEST_TYPES.find((r) => r.value === form.requestType)?.label;

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
        <Check className="h-6 w-6 text-accent" />
      </div>
      <h3 className="mt-4 font-serif-display text-xl text-foreground">Lead created</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Your request has been routed to the correct venue team. Continue to WhatsApp to complete the handoff.
      </p>

      <div className="mt-5 rounded-sm border border-border/40 bg-secondary/20 p-4 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
            Lead reference
          </span>
          <button
            onClick={onCopy}
            className="flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-accent hover:text-foreground"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
        </div>
        <p className="mt-1 font-serif-display text-xl text-foreground tnum">{lead.reference}</p>
        <div className="hairline my-3" />
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Request</dt><dd className="text-foreground">{requestLabel}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Venue</dt><dd className="text-foreground">{venueName}</dd></div>
          {form.eventOrDate && <div className="flex justify-between"><dt className="text-muted-foreground">Event/Date</dt><dd className="text-foreground">{form.eventOrDate}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted-foreground">Guests</dt><dd className="text-foreground">{form.partySize}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Arrival</dt><dd className="text-foreground">{form.arrivalTime}</dd></div>
        </dl>
      </div>

      <div className="mt-5 space-y-2">
        <Button onClick={onWhatsApp} className="w-full rounded-none bg-foreground py-3 text-background hover:bg-accent">
          <MessageCircle className="mr-2 h-4 w-4" /> Continue to WhatsApp
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-none border-border" disabled>
            <Phone className="mr-1 h-3.5 w-3.5" /> Call venue
          </Button>
          <Button onClick={onWithoutWhatsApp} variant="outline" className="flex-1 rounded-none border-border">
            Submit without WhatsApp
          </Button>
        </div>
      </div>
      <p className="mt-3 text-[0.5625rem] text-muted-foreground">
        Call venue pending verification. WhatsApp is the final handoff channel, not the booking interface.
      </p>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif-display text-lg text-foreground">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
