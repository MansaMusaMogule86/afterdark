import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { TonightSection } from "@/components/sections/tonight-section";
import { VenuesSection } from "@/components/sections/venues-section";
import { EventsSection } from "@/components/sections/events-section";
import { MatcherSection } from "@/components/sections/matcher-section";
import { VipSection } from "@/components/sections/vip-section";
import { CelebrationsSection } from "@/components/sections/celebrations-section";
import { NightEditSection } from "@/components/sections/night-edit-section";
import { LocationsSection } from "@/components/sections/locations-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { AboutFaqSection } from "@/components/sections/about-faq-section";
import { VenueDrawer } from "@/components/drawers/venue-drawer";
import { EventDrawer } from "@/components/drawers/event-drawer";
import { BookingModal } from "@/components/booking-modal";
import { AssetManifestView } from "@/components/asset-manifest-view";
import { venues } from "@/lib/venue-data";
import { eventOccurrences } from "@/lib/events-data";
import { guideArticles } from "@/lib/guide-data";
import { nightclubJsonLd, eventJsonLd, articleJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { view } = await searchParams;
  if (view === "asset-manifest") {
    return {
      title: "Asset Manifest — Internal",
      robots: { index: false, follow: false },
    };
  }
  // Home: return only robots; title/description come from layout defaults.
  return {
    robots: { index: true, follow: true },
  };
}

export default async function Home({ searchParams }: PageProps) {
  const { view } = await searchParams;

  if (view === "asset-manifest") {
    return <AssetManifestView />;
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

      <main className="flex-1 pb-20 lg:pb-0">
        <HeroSection />
        <TonightSection />
        <VenuesSection />
        <EventsSection />
        <MatcherSection />
        <VipSection />
        <CelebrationsSection />
        <NightEditSection />
        <LocationsSection />
        <AboutFaqSection />
        <NewsletterSection />
      </main>

      <SiteFooter />
      <MobileActionBar />

      {/* Overlays */}
      <VenueDrawer />
      <EventDrawer />
      <BookingModal />
    </div>
  );
}
