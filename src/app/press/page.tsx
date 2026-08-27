import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { VenueDrawer } from "@/components/drawers/venue-drawer";
import { EventDrawer } from "@/components/drawers/event-drawer";
import { ConciergeBottomSheet } from "@/components/concierge-bottom-sheet";
import { CookieConsent } from "@/components/cookie-consent";
import { CommandPalette } from "@/components/command-palette";
import { NightConciergeButton } from "@/components/night-concierge-button";
import { PromoterWelcomeBanner } from "@/components/promoter-welcome-banner";
import { ReadingProgress } from "@/components/reading-progress";
import { KeyboardShortcutHelp } from "@/components/keyboard-shortcut-help";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { PressView } from "@/components/press-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Press & Media",
  description:
    "Press and media information for ABOVE MIDNIGHT DXB — the unified nightlife platform for Avenue, Ora, and Black Tape in Dubai. Fact sheets, venue images, and press enquiry contacts.",
  robots: { index: false, follow: true }, // noindex until verified press content exists
  alternates: {
    canonical: "/press",
  },
  openGraph: {
    title: "Press & Media | ABOVE MIDNIGHT DXB",
    description:
      "Press and media information for ABOVE MIDNIGHT DXB — fact sheets, venue images, and press enquiry contacts.",
    type: "website",
  },
};

export default function PressPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main id="main-content" className="flex-1 pb-20 lg:pb-0">
        <PressView />
      </main>
      <SiteFooter />
      <MobileActionBar />
      <VenueDrawer />
      <EventDrawer />
      <ConciergeBottomSheet />
      <CookieConsent />
      <CommandPalette />
      <NightConciergeButton />
      <PromoterWelcomeBanner />
      <ReadingProgress />
      <KeyboardShortcutHelp />
      <ScrollToTopButton />
    </div>
  );
}
