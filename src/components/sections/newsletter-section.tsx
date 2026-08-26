"use client";

import { useState } from "react";
import { Mail, MessageCircle, Check, AlertCircle, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { siteConfig } from "@/lib/site-config";

const PREFERENCES = [
  { slug: "avenue_updates", label: "Avenue updates" },
  { slug: "ora_updates", label: "Ora updates" },
  { slug: "black_tape_updates", label: "Black Tape updates" },
  { slug: "arabic_nights", label: "Arabic nights" },
  { slug: "urban_nights", label: "Urban nights" },
  { slug: "vip_offers", label: "VIP offers" },
  { slug: "major_artist_announcements", label: "Major artist announcements" },
];

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSection() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const togglePref = (slug: string) => {
    setPreferences((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  const resetForm = () => {
    setEmail("");
    setPreferences([]);
    setConsent(false);
    setHoneypot("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    // Honeypot — silently succeed without storing.
    if (honeypot) {
      setStatus("success");
      resetForm();
      return;
    }

    if (!consent) {
      setStatus("error");
      setErrorMsg("Please accept the marketing consent to subscribe.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          preferences,
          consent: true,
          company_website: honeypot,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          fields?: Record<string, string>;
        };
        const msg =
          data.fields?.email ??
          data.fields?.consent ??
          data.error ??
          "Subscription failed. Please try again.";
        setStatus("error");
        setErrorMsg(msg);
        return;
      }

      setStatus("success");
      track("newsletter_signup", { preferences: preferences.join(",") });
      toast({
        title: "Subscribed",
        description: "You're on the list. Watch your inbox for the next update.",
      });
      resetForm();
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <section id="newsletter" className="relative border-t border-border/40 bg-background">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
        <div className="grid gap-0 overflow-hidden rounded-sm border border-border/60 md:grid-cols-12">
          {/* Left: copy + WhatsApp */}
          <div className="bg-card p-6 md:col-span-5 md:p-10">
            <span className="eyebrow text-accent">Newsletter & WhatsApp Updates</span>
            <h2 className="heading-editorial mt-3 text-4xl text-foreground md:text-5xl">
              Get the right updates. Not all of them.
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground md:text-base">
              Select the venues and nights you care about. We collect consent properly — no third-party list
              rentals, no surprise frequency.
            </p>

            {/* WhatsApp secondary CTA */}
            <div className="mt-8 border-t border-border/40 pt-6">
              <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.2em] text-muted-foreground">
                Prefer WhatsApp?
              </p>
              <Button
                onClick={() => {
                  track("click_whatsapp", { source: "newsletter" });
                  const text = encodeURIComponent(
                    `Hi ${siteConfig.parentName}, I'd like to receive nightlife updates on WhatsApp.`
                  );
                  window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
                }}
                variant="outline"
                className="mt-3 rounded-none border-foreground/30 bg-transparent px-6 py-3 font-mono-tight text-[0.6875rem] uppercase tracking-[0.18em] text-foreground hover:bg-foreground/10"
              >
                <MessageCircle className="mr-2 h-3.5 w-3.5" />
                Join WhatsApp Updates
              </Button>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-secondary/30 p-6 md:col-span-7 md:p-10">
            {status === "success" ? (
              <div className="flex h-full flex-col items-start justify-center gap-5">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent bg-accent/10">
                    <Check className="h-5 w-5 text-accent" />
                  </span>
                  <div>
                    <h3 className="font-serif-display text-2xl text-foreground md:text-3xl">
                      You&apos;re on the list.
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Watch your inbox for the next update. You can unsubscribe at any time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStatus("idle")}
                  className="font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-accent transition-colors hover:text-foreground"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6" noValidate>
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="newsletter-email"
                    className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="rounded-none border-border bg-background pl-10 text-foreground"
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-3">
                  <Label className="font-mono-tight text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
                    What should we send you?
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PREFERENCES.map((p) => {
                      const checked = preferences.includes(p.slug);
                      return (
                        <label
                          key={p.slug}
                          htmlFor={`pref-${p.slug}`}
                          className="flex cursor-pointer items-center gap-3 rounded-sm border border-border/60 bg-background px-3 py-2.5 transition-colors hover:border-foreground/30"
                        >
                          <Checkbox
                            id={`pref-${p.slug}`}
                            checked={checked}
                            onCheckedChange={(v) => {
                              if (v === "indeterminate") return;
                              togglePref(p.slug);
                            }}
                          />
                          <span className="text-sm text-foreground">{p.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Consent */}
                <label
                  htmlFor="newsletter-consent"
                  className="flex cursor-pointer items-start gap-3 rounded-sm border border-border/60 bg-background p-3"
                >
                  <Checkbox
                    id="newsletter-consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    I consent to receive marketing updates from {siteConfig.parentName} and accept the privacy
                    policy. I can unsubscribe at any time.
                  </span>
                </label>

                {/* Honeypot (hidden) */}
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  aria-hidden="true"
                />

                {/* Error */}
                {status === "error" && errorMsg && (
                  <div className="flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/10 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-xs text-foreground">{errorMsg}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-none bg-accent px-6 py-6 text-xs font-semibold uppercase tracking-[0.2em] text-background hover:opacity-90"
                >
                  {status === "loading" ? "Subscribing…" : "Subscribe"}
                  {status !== "loading" && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
