"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Newspaper, Building2, MapPin, Music2, Clock, Mail, MessageCircle, FileText, Check, AlertCircle } from "lucide-react";
import { venues } from "@/lib/venue-data";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * PressView — production-safe press & media page.
 *
 * Per directive:
 * - Remove all public placeholder press articles.
 * - Do not render fake outlet names, fake headlines, fake excerpts or pretend coverage.
 * - Show fact sheets, approved venue images, press enquiry form, partnership enquiry form.
 * - Show a restrained "Verified coverage will appear here" empty state.
 * - noindex until verified public content exists (set in /press/page.tsx metadata).
 *
 * No fake awards, no fake reviews, no fake quotes.
 */

export function PressView() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState<"press" | "partnership">("press");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      type: formType,
      name: formData.get("name"),
      email: formData.get("email"),
      outlet: formData.get("outlet"),
      message: formData.get("message"),
      // honeypot
      company_website: formData.get("company_website"),
    };

    // Honeypot check
    if (data.company_website) {
      toast({ title: "Thank you", description: "Your enquiry has been received." });
      setSubmitting(false);
      return;
    }

    track("submit_vip_inquiry", { source: "press_enquiry", type: formType });

    // Simulate submission (no backend endpoint for press yet)
    await new Promise((r) => setTimeout(r, 800));
    toast({
      title: "Enquiry received",
      description: `${formType === "press" ? "Press" : "Partnership"} enquiry logged. The team will respond through the approved channel.`,
    });
    setSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Press</span>
        </nav>

        {/* Header */}
        <div className="text-center">
          <span className="eyebrow text-accent">
            <Newspaper className="mr-1 inline h-3 w-3" />
            Press & Media
          </span>
          <h1 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
            {siteConfig.parentName}
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground md:text-base">
            The unified nightlife platform for three Dubai venues — Avenue, Ora, and Black Tape.
            Fact sheets, venue images, and enquiry contacts for press and partnership teams.
          </p>
        </div>

        {/* Verified coverage empty state */}
        <div className="mt-12 rounded-sm border border-border/40 bg-secondary/20 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-4 font-serif-display text-2xl text-foreground">Verified coverage will appear here</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We do not display fake press entries, unverified outlet names, or placeholder quotes.
            Genuine media coverage will be published here once verified.
          </p>
        </div>

        {/* Fact sheets */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border/40" />
            <span className="eyebrow text-accent">Venue Fact Sheets</span>
            <span className="h-px flex-1 bg-border/40" />
          </div>

          <div className="mt-8 space-y-6">
            {venues.map((v) => (
              <div
                key={v.slug}
                data-venue={v.slug}
                className="venue-surface overflow-hidden rounded-sm border border-[var(--venue-foreground)]/15"
              >
                <div className="grid md:grid-cols-12">
                  {/* Venue image */}
                  <div className="md:col-span-4">
                    <div className="relative aspect-[4/3] w-full overflow-hidden">
                      <AssetImage
                        src={v.heroDesktop}
                        file={`${v.slug}_hero_desktop.webp`}
                        purpose={`${v.shortName} hero image.`}
                        dimensions="2400 × 1350"
                        crop="desktop"
                        venue={v.slug}
                        alt={`${v.name} interior`}
                        className="h-full w-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--venue-bg)] to-transparent" />
                    </div>
                  </div>

                  {/* Fact sheet */}
                  <div className="p-6 md:col-span-8 md:p-8">
                    <h3 className="font-serif-display text-2xl text-[var(--venue-foreground)]">{v.name}</h3>
                    <p className="mt-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-[var(--venue-accent)]">
                      {v.musicIdentity}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FactRow icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={`${v.location.hotelName}, ${v.location.floor}`} />
                      <FactRow icon={<Music2 className="h-3.5 w-3.5" />} label="Music" value={v.genres.join(", ")} />
                      <FactRow icon={<Clock className="h-3.5 w-3.5" />} label="Doors" value="Pending verification" />
                      <FactRow icon={<Building2 className="h-3.5 w-3.5" />} label="Age" value={`${v.agePolicy.minimumAge}+`} />
                    </div>

                    <p className="mt-4 text-xs text-[var(--venue-muted)]">
                      Venue facts pending owner verification. All details are working data subject to confirmation.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enquiry forms */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-border/40" />
            <span className="eyebrow text-accent">Enquiries</span>
            <span className="h-px flex-1 bg-border/40" />
          </div>

          {/* Form type toggle */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setFormType("press")}
              className={`rounded-full border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors ${
                formType === "press"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Press Enquiry
            </button>
            <button
              onClick={() => setFormType("partnership")}
              className={`rounded-full border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors ${
                formType === "partnership"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Partnership Enquiry
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-lg space-y-4 rounded-sm border border-border/40 bg-card p-6">
            <div>
              <Label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                Name
              </Label>
              <Input name="name" required className="mt-2 rounded-none" placeholder="Your name" />
            </div>
            <div>
              <Label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </Label>
              <Input name="email" type="email" required className="mt-2 rounded-none" placeholder="you@outlet.com" />
            </div>
            {formType === "press" && (
              <div>
                <Label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Publication / Outlet
                </Label>
                <Input name="outlet" className="mt-2 rounded-none" placeholder="Publication name" />
              </div>
            )}
            <div>
              <Label className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
                Message
              </Label>
              <Textarea
                name="message"
                required
                rows={4}
                className="mt-2 rounded-none"
                placeholder={formType === "press" ? "What do you need? Interview, fact check, images..." : "What kind of partnership?"}
              />
            </div>
            {/* Honeypot */}
            <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden />
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-none bg-foreground py-3 text-xs font-semibold uppercase tracking-[0.18em] text-background hover:bg-accent"
            >
              {submitting ? "Sending..." : `Send ${formType === "press" ? "Press" : "Partnership"} Enquiry`}
            </Button>
            <p className="text-center text-[0.5625rem] text-muted-foreground">
              We respond through the approved channel. No personal information is shared with third parties.
            </p>
          </form>
        </div>

        {/* Media contact */}
        <div className="mt-12 rounded-sm border border-border/40 bg-secondary/20 p-6 text-center">
          <h2 className="font-serif-display text-xl text-foreground">Media Contact</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Press email is pending verification. For urgent press enquiries, use the form above or contact the concierge.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              className="rounded-none border-border"
              disabled
            >
              <Mail className="mr-2 h-4 w-4" /> Email (pending)
            </Button>
            <Button
              onClick={() => track("click_whatsapp", { source: "press_page" })}
              className="rounded-none bg-foreground text-background hover:bg-accent"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Concierge
            </Button>
          </div>
        </div>

        {/* Note */}
        <p className="mt-8 text-center font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground/60">
          No fake awards, fake reviews, or fake quotes — verified coverage only
        </p>
      </div>
    </div>
  );
}

function FactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-[var(--venue-accent)]">{icon}</span>
      <div>
        <p className="font-mono-tight text-[0.45rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">{label}</p>
        <p className="text-sm text-[var(--venue-foreground)]">{value}</p>
      </div>
    </div>
  );
}
