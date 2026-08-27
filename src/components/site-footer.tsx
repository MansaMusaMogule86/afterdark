"use client";

import Link from "next/link";
import { Instagram, Facebook, Youtube, Music2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { venues } from "@/lib/venue-data";
import { guideArticles } from "@/lib/guide-data";
import { track } from "@/lib/analytics";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      {/* Top band — promise + nav columns */}
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-accent/40 font-serif-display text-accent text-xl">
                AM
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-serif-display text-base">
                  {siteConfig.parentName}
                </span>
                <span className="eyebrow mt-1">Dubai · After Dark</span>
              </div>
            </div>
            <p className="mt-6 max-w-xs font-serif-display text-xl leading-tight text-foreground">
              {siteConfig.promise}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <SocialIcon href={siteConfig.social.instagram} label="Instagram">
                <Instagram className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.tiktok} label="TikTok">
                <Music2 className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.facebook} label="Facebook">
                <Facebook className="h-4 w-4" />
              </SocialIcon>
              <SocialIcon href={siteConfig.social.youtube} label="YouTube">
                <Youtube className="h-4 w-4" />
              </SocialIcon>
            </div>
          </div>

          {/* Venues column */}
          <div className="md:col-span-2">
            <h3 className="eyebrow mb-4">Venues</h3>
            <ul className="space-y-3">
              {venues.map((v) => (
                <li key={v.slug}>
                  <a
                    href="#venues"
                    onClick={() => track("view_venue", { source: "footer", venue: v.slug })}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {v.shortName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Night Edit column */}
          <div className="md:col-span-3">
            <h3 className="eyebrow mb-4">The Night Edit</h3>
            <ul className="space-y-3">
              {guideArticles.slice(0, 4).map((a) => (
                <li key={a.slug}>
                  <a
                    href="#night-edit"
                    className="line-clamp-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {a.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div className="md:col-span-3">
            <h3 className="eyebrow mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="text-sm text-muted-foreground hover:text-foreground">About</a></li>
              <li><a href="#celebrations" className="text-sm text-muted-foreground hover:text-foreground">Celebrations</a></li>
              <li><a href="#vip" className="text-sm text-muted-foreground hover:text-foreground">VIP Tables</a></li>
              <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a></li>
              <li><Link href="/?view=press" className="text-sm text-muted-foreground hover:text-foreground">Press</Link></li>
              <li><Link href="/?view=asset-manifest" className="text-sm text-muted-foreground hover:text-foreground">Asset Manifest</Link></li>
            </ul>
          </div>
        </div>

        <div className="hairline my-12" />

        {/* Legal + entity notice */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-mono-tight text-[0.6875rem] text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.parentName}. All rights reserved.
            <span className="mx-2 text-accent/40">·</span>
            Working name — permanent group identity to be confirmed.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/?view=privacy" className="font-mono-tight text-[0.6875rem] text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="/?view=cookies" className="font-mono-tight text-[0.6875rem] text-muted-foreground hover:text-foreground">Cookies</Link>
            <Link href="/?view=terms" className="font-mono-tight text-[0.6875rem] text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
        </div>

        {/* Entity resolution internal notice */}
        <div className="mt-8 rounded-sm border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="font-mono-tight text-[0.6875rem] text-amber-200/80">
            <strong className="text-amber-200">Entity notice:</strong> Ora and Black Tape
            currently appear online as separate clubs using the same floor and hotel.
            Entity mode is <code className="text-amber-300">{siteConfig.venueEntityMode}</code> until verified.
            Separate local business structured data, map claims, and conflicting opening hours
            are not published until the correct entity mode is confirmed.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      onClick={() => track("click_whatsapp", { social: label })}
      className="flex h-9 w-9 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  );
}
