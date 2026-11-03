import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { SocialProofStrip } from "@/components/sections/social-proof-strip";
import { TonightSection } from "@/components/sections/tonight-section";
import { VenuesSection } from "@/components/sections/venues-section";
import { MatcherSection } from "@/components/sections/matcher-section";
import { VipSection } from "@/components/sections/vip-section";
import { CelebrationsSection } from "@/components/sections/celebrations-section";
import { PlanYourNightSection } from "@/components/sections/plan-your-night-section";
import { EnglishNightsPromo } from "@/components/sections/english-nights-promo";
import { NightEditSection } from "@/components/sections/night-edit-section";
import { LocationsSection } from "@/components/sections/locations-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { AboutFaqSection } from "@/components/sections/about-faq-section";
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
import { PastEventsSection } from "@/components/sections/past-events-section";
import { AssetManifestView } from "@/components/asset-manifest-view";
import { EnglishNightsView } from "@/components/english-nights-view";
import { EnglishNightDetailView } from "@/components/english-night-detail-view";
import { EnglishNightsAdminView } from "@/components/english-nights-admin-view";
import { FaqView } from "@/components/faq-view";
import { venues } from "@/lib/venue-data";
import { eventOccurrences } from "@/lib/events-data";
import { guideArticles } from "@/lib/guide-data";
import { nightclubJsonLd, eventJsonLd, articleJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ view?: string; venue?: string; date?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { view } = await searchParams;
  if (view === "asset-manifest" || view === "english-nights-admin") {
    return {
      title: view === "asset-manifest" ? "Asset Manifest — Internal" : "English Nights Import Review — Internal",
      robots: { index: false, follow: false },
    };
  }
  if (view === "english-nights") {
    return {
      title: "English Nights in Dubai | ABOVE MIDNIGHT DXB",
      description:
        "Curated English Night events at Avenue, Ora, and Black Tape — imported exclusively from Instagram posts tagged #AMDXBENGLISHNIGHT. See upcoming English Nights, tonight status, and request VIP tables.",
      robots: { index: true, follow: true },
    };
  }
  if (view === "faq") {
    return {
      title: "FAQ — Dubai Nightlife Questions | ABOVE MIDNIGHT DXB",
      description:
        "Answers to common questions about Dubai nightlife, VIP table booking, dress codes, ID requirements, getting to the venues, and English Nights at Avenue, Ora, and Black Tape.",
      robots: { index: true, follow: true },
    };
  }
  if (view === "english-night") {
    return {
      title: "English Night | ABOVE MIDNIGHT DXB",
      description: "English Night event details — venue, doors, music, DJs, and VIP request.",
      robots: { index: true, follow: true },
    };
  }
  // Home: return only robots; title/description come from layout defaults.
  return {
    robots: { index: true, follow: true },
  };
}

export default async function Home({ searchParams }: PageProps) {
  const { view, venue, date } = await searchParams;

  // Internal views (noindex).
  if (view === "asset-manifest") {
    return <AssetManifestView />;
  }
  if (view === "english-nights-admin") {
    return <EnglishNightsAdminView />;
  }

  // English Nights landing.
  if (view === "english-nights") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          <EnglishNightsView />
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

  // FAQ view.
  if (view === "faq") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          <FaqView />
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

  // English Night event detail.
  if (view === "english-night" && venue && date) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main id="main-content" className="flex-1 pb-20 lg:pb-0">
          <EnglishNightDetailView venue={venue} date={date} />
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

  // Gather structured data.
  const nightclubLd = venues.map(nightclubJsonLd);
  const eventLd = eventOccurrences.slice(0, 20).map(eventJsonLd);
  const articleLd = guideArticles.slice(0, 6).map(articleJsonLd);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Structured data — visible, accurate JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(nightclubLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleLd),
        }}
      />

      <SiteHeader />

      <main id="main-content" className="flex-1 pb-20 lg:pb-0">
        <HeroSection />
        <TonightSection />
        <EnglishNightsPromo />
        <MatcherSection />
        <VenuesSection />
        <SocialProofStrip />
        <VipSection />
        <CelebrationsSection />
        <PlanYourNightSection />
        <NightEditSection />
        <PastEventsSection />
        <LocationsSection />
        <AboutFaqSection />
        <NewsletterSection />
      </main>

      <SiteFooter />
      <MobileActionBar />

      {/* Overlays */}
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
