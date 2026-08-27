"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight, ArrowLeft, MessageCircle, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUi } from "@/lib/ui-store";
import { track } from "@/lib/analytics";
import { venues } from "@/lib/venue-data";
import { matcherDateOptions } from "@/lib/matcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { TableTypeSlug } from "@/lib/types";

const STEPS = ["Night", "Table", "Contact"] as const;

const TABLE_TYPES: { value: TableTypeSlug; label: string; desc: string }[] = [
  { value: "guest_list", label: "Guest List", desc: "Entry access only." },
  { value: "standard_table", label: "Standard Table", desc: "Dedicated table, full service." },
  { value: "premium_table", label: "Premium Table", desc: "Better sightline, higher spend." },
  { value: "stage_dj_table", label: "Stage / DJ Area", desc: "Closest to the action." },
  { value: "private_corporate", label: "Private / Corporate", desc: "Buyout or brand event." },
];

const BUDGETS = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "stage", label: "Stage / DJ" },
  { value: "unsure", label: "Not sure yet" },
];

const OCCASIONS = [
  { value: "night_out", label: "Night out" },
  { value: "birthday", label: "Birthday" },
  { value: "bachelorette", label: "Bachelorette" },
  { value: "bachelor", label: "Bachelor" },
  { value: "corporate", label: "Corporate" },
  { value: "client", label: "Client entertainment" },
  { value: "brand", label: "Brand activation" },
  { value: "private", label: "Private venue" },
];

const ARRIVAL_TIMES = ["10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "12:30 AM", "1:00 AM", "Flexible"];

interface FormState {
  venue: string;
  eventOrDate: string;
  partySize: number;
  arrivalTime: string;
  tablePreference: TableTypeSlug;
  budgetRange: string;
  occasion: string;
  specialRequirements: string;
  hotelGuest: boolean;
  transportRequest: string;
  fullName: string;
  whatsappNumber: string;
  email: string;
  promoterCode: string;
  conciergeCode: string;
  marketingConsent: boolean;
  // honeypot
  company_website: string;
}

const EMPTY: FormState = {
  venue: "any",
  eventOrDate: "",
  partySize: 4,
  arrivalTime: "11:00 PM",
  tablePreference: "standard_table",
  budgetRange: "standard",
  occasion: "night_out",
  specialRequirements: "",
  hotelGuest: false,
  transportRequest: "",
  fullName: "",
  whatsappNumber: "",
  email: "",
  promoterCode: "",
  conciergeCode: "",
  marketingConsent: false,
  company_website: "",
};

export function BookingModal() {
  const { bookingOpen, bookingPreset, closeBooking } = useUi();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference: string; summary: string } | null>(null);
  const [attribution, setAttribution] = useState<{ first?: string; last?: string; campaign?: string }>({});
  const dates = matcherDateOptions();

  // Capture referral attribution from URL once.
  useEffect(() => {
    if (!bookingOpen) return;
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const promoter = params.get("promoter") || params.get("p");
    const concierge = params.get("concierge") || params.get("c");
    const campaign = params.get("campaign") || params.get("utm_campaign");
    const ref = params.get("ref") || params.get("utm_source");
    const referrer = document.referrer || undefined;
    setAttribution({
      first: ref || referrer,
      last: ref || referrer,
      campaign: campaign || undefined,
    });
    if (promoter) setForm((f) => ({ ...f, promoterCode: promoter }));
    if (concierge) setForm((f) => ({ ...f, conciergeCode: concierge }));
    track("start_vip_inquiry", { source: "modal_open", promoter: !!promoter, concierge: !!concierge });
  }, [bookingOpen]);

  // Apply preset when opening.
  useEffect(() => {
    if (bookingOpen && bookingPreset) {
      setForm((f) => ({
        ...f,
        venue: bookingPreset.venue ?? f.venue,
        eventOrDate: bookingPreset.eventOrDate ?? f.eventOrDate,
      }));
    }
  }, [bookingOpen, bookingPreset]);

  // Reset on close.
  useEffect(() => {
    if (!bookingOpen) {
      const t = setTimeout(() => {
        setStep(0);
        setForm(EMPTY);
        setResult(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [bookingOpen]);

  if (!bookingOpen) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!form.venue) return "Please select a venue.";
      if (!form.eventOrDate) return "Please choose an event or date.";
      if (form.partySize < 1 || form.partySize > 50) return "Party size must be 1–50.";
    }
    if (s === 2) {
      if (!form.fullName.trim()) return "Full name is required.";
      if (!form.whatsappNumber.trim()) return "WhatsApp number is required.";
      if (!/^[+\d][\d\s-]{6,}$/.test(form.whatsappNumber)) return "Enter a valid WhatsApp number.";
      if (!form.email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email.";
      if (!form.marketingConsent) return "Marketing consent is required to process your request.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      toast({ title: "Check your details", description: err, variant: "destructive" });
      return;
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
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...attribution }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }
      setResult({ reference: data.reference, summary: data.summary });
      track("submit_vip_inquiry", {
        venue: form.venue, table_type: form.tablePreference, occasion: form.occasion,
        party_size: form.partySize, source: "modal",
      });
      if (attribution.campaign || form.promoterCode) {
        track("promoter_conversion", {
          campaign: attribution.campaign, promoter: form.promoterCode, concierge: form.conciergeCode,
        });
      }
    } catch (e) {
      toast({
        title: "Submission failed",
        description: e instanceof Error ? e.message : "Please try again or contact the concierge.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const venueName = form.venue === "any" ? "any venue" : venues.find((v) => v.slug === form.venue)?.name ?? form.venue;
    const text = encodeURIComponent(
      `Hi, I just submitted a VIP request.\nReference: ${result?.reference}\nVenue: ${venueName}\nDate/Event: ${form.eventOrDate}\nParty size: ${form.partySize}\nName: ${form.fullName}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    track("click_whatsapp", { source: "booking_confirmation", reference: result?.reference });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label="VIP booking request">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={closeBooking} />
      <div className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-lg border border-border/60 bg-card md:rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 p-5">
          <div>
            <span className="eyebrow text-accent">VIP Request</span>
            <h2 className="mt-1 font-serif-display text-xl text-foreground">
              {result ? "Request received" : `Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
            </h2>
          </div>
          <button onClick={closeBooking} className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        {!result && (
          <div className="flex gap-1 px-5 pt-4">
            {STEPS.map((s, i) => (
              <div key={s} className={cn("h-0.5 flex-1 rounded-full transition-colors", i <= step ? "bg-accent" : "bg-border")} />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7">
          {result ? (
            <ConfirmationView result={result} form={form} onWhatsApp={openWhatsApp} onClose={closeBooking} />
          ) : (
            <>
              {step === 0 && (
                <Step title="Tell us about your night">
                  <Field label="Venue">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <Choice active={form.venue === "any"} onClick={() => set("venue", "any")} label="Any" />
                      {venues.map((v) => (
                        <Choice key={v.slug} active={form.venue === v.slug} onClick={() => set("venue", v.slug)} label={v.shortName} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Event or preferred date">
                    <select
                      value={form.eventOrDate}
                      onChange={(e) => set("eventOrDate", e.target.value)}
                      className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                    >
                      <option value="">Select a date…</option>
                      {dates.map((d) => (
                        <option key={d.value} value={d.label}>{d.label}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Party size">
                      <Input type="number" min={1} max={50} value={form.partySize} onChange={(e) => set("partySize", parseInt(e.target.value) || 1)} />
                    </Field>
                    <Field label="Expected arrival time">
                      <select
                        value={form.arrivalTime}
                        onChange={(e) => set("arrivalTime", e.target.value)}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                      >
                        {ARRIVAL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </Field>
                  </div>
                </Step>
              )}

              {step === 1 && (
                <Step title="Choose your table">
                  <Field label="Table preference">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {TABLE_TYPES.map((t) => (
                        <ChoiceCard key={t.value} active={form.tablePreference === t.value} onClick={() => set("tablePreference", t.value)} label={t.label} desc={t.desc} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Budget range">
                    <div className="flex flex-wrap gap-2">
                      {BUDGETS.map((b) => (
                        <Choice key={b.value} active={form.budgetRange === b.value} onClick={() => set("budgetRange", b.value)} label={b.label} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Occasion">
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => (
                        <Choice key={o.value} active={form.occasion === o.value} onClick={() => set("occasion", o.value)} label={o.label} />
                      ))}
                    </div>
                  </Field>
                  <Field label="Special requirements (optional)">
                    <Textarea value={form.specialRequirements} onChange={(e) => set("specialRequirements", e.target.value)} placeholder="Birthday cake, decoration, accessibility, VIP host…" rows={2} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Hotel guest?">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={form.hotelGuest} onCheckedChange={(v) => set("hotelGuest", v === true)} />
                        <span className="text-sm text-foreground">Staying at the hotel</span>
                      </label>
                    </Field>
                    <Field label="Transport request (optional)">
                      <Input value={form.transportRequest} onChange={(e) => set("transportRequest", e.target.value)} placeholder="Hotel transfer, valet…" />
                    </Field>
                  </div>
                </Step>
              )}

              {step === 2 && (
                <Step title="Your contact details">
                  <Field label="Full name">
                    <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Your name" />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="WhatsApp number">
                      <Input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="+971…" inputMode="tel" />
                    </Field>
                    <Field label="Email">
                      <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Promoter code (optional)">
                      <Input value={form.promoterCode} onChange={(e) => set("promoterCode", e.target.value)} placeholder="If you have one" />
                    </Field>
                    <Field label="Concierge code (optional)">
                      <Input value={form.conciergeCode} onChange={(e) => set("conciergeCode", e.target.value)} placeholder="If you have one" />
                    </Field>
                  </div>
                  <Field label="Marketing consent">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <Checkbox checked={form.marketingConsent} onCheckedChange={(v) => set("marketingConsent", v === true)} className="mt-0.5" />
                      <span className="text-xs text-muted-foreground">
                        I agree to be contacted about my request and to receive marketing updates about ABOVE MIDNIGHT DXB events and offers. I can withdraw consent at any time.
                      </span>
                    </label>
                  </Field>
                  {/* Honeypot */}
                  <input type="text" name="company_website" value={form.company_website} onChange={(e) => set("company_website", e.target.value)} tabIndex={-1} autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden />
                  <p className="text-xs text-muted-foreground">
                    We validate all requests on the server, rate-limit submissions, and use a honeypot to filter spam. We do not process deposits until a verified payment workflow exists, and we don't promise a response time until the business has measured it.
                  </p>
                </Step>
              )}
            </>
          )}
        </div>

        {/* Footer nav */}
        {!result && (
          <div className="flex items-center justify-between border-t border-border/40 p-5">
            <Button variant="ghost" onClick={prev} disabled={step === 0} className="rounded-none text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} className="rounded-none bg-foreground px-6 text-background hover:bg-accent">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="rounded-none bg-accent px-6 text-background hover:opacity-90">
                {submitting ? "Submitting…" : "Submit Request"} <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmationView({
  result, form, onWhatsApp, onClose,
}: {
  result: { reference: string; summary: string };
  form: FormState;
  onWhatsApp: () => void;
  onClose: () => void;
}) {
  const venueName = form.venue === "any" ? "Any venue" : venues.find((v) => v.slug === form.venue)?.name ?? form.venue;
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent/10">
        <Check className="h-7 w-7 text-accent" />
      </div>
      <h3 className="mt-5 font-serif-display text-2xl text-foreground">Request received</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Your VIP request has been logged. The concierge team will confirm availability, minimum spend, and table location.
      </p>

      <div className="mt-6 rounded-sm border border-border/60 bg-secondary/30 p-5 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">Booking reference</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(result.reference); }}
            className="flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-accent hover:text-foreground"
          >
            <Copy className="h-3 w-3" /> Copy
          </button>
        </div>
        <p className="mt-1 font-serif-display text-2xl text-foreground tnum">{result.reference}</p>
        <div className="hairline my-4" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-muted-foreground text-xs">Venue</dt><dd className="text-foreground">{venueName}</dd></div>
          <div><dt className="text-muted-foreground text-xs">Date/Event</dt><dd className="text-foreground">{form.eventOrDate}</dd></div>
          <div><dt className="text-muted-foreground text-xs">Party size</dt><dd className="text-foreground">{form.partySize}</dd></div>
          <div><dt className="text-muted-foreground text-xs">Arrival</dt><dd className="text-foreground">{form.arrivalTime}</dd></div>
          <div><dt className="text-muted-foreground text-xs">Table</dt><dd className="text-foreground">{TABLE_TYPES.find(t => t.value === form.tablePreference)?.label}</dd></div>
          <div><dt className="text-muted-foreground text-xs">Occasion</dt><dd className="text-foreground">{OCCASIONS.find(o => o.value === form.occasion)?.label}</dd></div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onWhatsApp} className="flex-1 rounded-none bg-foreground text-background hover:bg-accent">
          <MessageCircle className="mr-2 h-4 w-4" /> Open WhatsApp
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-none border-foreground/30">
          Done
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        A confirmation will be sent through the approved channel. Present your reference at the table host line on the night.
      </p>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif-display text-xl text-foreground">{title}</h3>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border px-3 py-2 text-xs font-medium transition-colors",
        active ? "border-accent bg-accent/10 text-accent" : "border-border text-foreground hover:border-foreground/40"
      )}
    >
      {label}
    </button>
  );
}

function ChoiceCard({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-sm border p-3 text-left transition-colors",
        active ? "border-accent bg-accent/10" : "border-border hover:border-foreground/40"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium", active ? "text-accent" : "text-foreground")}>{label}</span>
        {active && <Check className="h-4 w-4 text-accent" />}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}
