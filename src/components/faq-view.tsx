"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { venues } from "@/lib/venue-data";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  // General
  { id: "g1", category: "General", question: "What is AFTER MIDNIGHT DXB?", answer: "AFTER MIDNIGHT DXB is the unified nightlife platform for three Dubai venues — Avenue Club, Ora Club, and Black Tape Club. All three share the same owner. The platform lets you see what's live tonight, compare venues, and reserve VIP tables through one direct nightlife concierge." },
  { id: "g2", category: "General", question: "Where are the three venues located?", answer: "Avenue Club is on level 42 of Shangri La Dubai on Sheikh Zayed Road. Ora Club and Black Tape Club are both on level 44 of Hilton Dubai Al Habtoor City in Business Bay. The two Al Habtoor venues share the same floor but are different rooms with different music identities." },
  { id: "g3", category: "General", question: "Do the three venues share the same owner?", answer: "Yes. All three venues — Avenue, Ora, and Black Tape — are owned by the same group. AFTER MIDNIGHT DXB is the working parent name until the permanent group identity is confirmed." },

  // Tonight & Service Date
  { id: "t1", category: "Tonight & Service Date", question: "What is a nightlife service date?", answer: "A nightlife service date does not reset at midnight. It resets at 6:00 AM Dubai time. An event that starts at 11:00 PM and finishes at 4:00 AM belongs to the same service date. This affects guest list cutoffs, table reservations, and event listings." },
  { id: "t2", category: "Tonight & Service Date", question: "How do I see what's happening tonight?", answer: "Click 'Tonight' in the navigation or scroll to the Tonight section. The Tonight at a Glance strip shows all three venues' live status. You can also use the 'See Tonight' button in the hero." },
  { id: "t3", category: "Tonight & Service Date", question: "What does 'Live Tonight' mean?", answer: "A venue shows 'Live Tonight' when there is a confirmed event on the current service date. If no event is confirmed, it shows 'No confirmed event tonight — Contact Concierge'." },

  // Booking & VIP
  { id: "b1", category: "VIP & Tables", question: "How do I book a VIP table?", answer: "Click 'Book VIP' anywhere on the site. The 3-step booking flow collects your night details, table preference, and contact information. The concierge confirms availability, minimum spend, and table location, then issues a booking reference. On the night, present your reference at the table host line." },
  { id: "b2", category: "VIP & Tables", question: "What table types are available?", answer: "Five types: Guest List (entry only, no seat), Standard Table (dedicated table in main room), Premium Table (better sightline, higher spend), Stage/DJ Area Table (closest to the action), and Private/Corporate (full or partial buyout)." },
  { id: "b3", category: "VIP & Tables", question: "What is the minimum spend?", answer: "Minimum spends are venue, night, and table specific. They are only published when verified. If a figure is not shown, contact the concierge for the current figure. We never invent or estimate minimum spends." },
  { id: "b4", category: "VIP & Tables", question: "Do you take deposits online?", answer: "No. Deposits are not processed until a verified payment workflow exists. The concierge handles all payment arrangements directly after confirming your booking." },
  { id: "b5", category: "VIP & Tables", question: "How fast will I get a response?", answer: "We do not promise a specific response time until the business has measured it. The concierge team responds as quickly as possible, typically within a few hours during operating hours." },

  // Dress Code & ID
  { id: "d1", category: "Dress Code & Door", question: "What is the dress code?", answer: "Dubai nightclubs enforce an elevated dress code. Sportswear, flip flops, shorts, and beachwear are not accepted. Smart shoes are safest. Each venue has its own specific guidance — check the venue page for details." },
  { id: "d2", category: "Dress Code & Door", question: "What ID do I need?", answer: "Original identification is required at the door for every guest. Accepted: original passport, original UAE driving licence, or original UAE national ID (residents only). Photocopies and digital IDs are not accepted." },
  { id: "d3", category: "Dress Code & Door", question: "What is the minimum age?", answer: "All three venues are 21+. Original ID is checked at the door for every guest, every night." },
  { id: "d4", category: "Dress Code & Door", question: "Can I walk in without a booking?", answer: "Walk-ins are subject to capacity. Guest list and table guests get priority. For a reliable night, book a table or join the guest list before the nightly cutoff." },

  // Getting There
  { id: "l1", category: "Getting There", question: "How do I get to Avenue?", answer: "Avenue is on level 42 of Shangri La Dubai on Sheikh Zayed Road. Enter through the main lobby and take the dedicated Avenue elevators. Hotel valet is available at the main entrance. Taxi is the most reliable arrival." },
  { id: "l2", category: "Getting There", question: "How do I get to Ora and Black Tape?", answer: "Ora and Black Tape are both on level 44 of Hilton Dubai Al Habtoor City in Business Bay. Enter through the main lobby and follow signage to the nightclub elevators. The door team directs you to the correct room." },
  { id: "l3", category: "Getting There", question: "Is there parking?", answer: "Yes. Both hotels offer valet parking at the main entrance. Self-parking is available in the hotel basements. Metro walking times are not published until verified — use taxi or hotel transfer for the most reliable arrival." },

  // English Nights
  { id: "e1", category: "English Nights", question: "What are English Nights?", answer: "English Nights are curated events imported automatically from Instagram. Venue teams post with #AMDXBENGLISHNIGHT and the platform parses the caption for venue, date, doors, music, DJs, entry, VIP, and guest list info. Only posts with the hashtag are imported — no general Instagram feed." },
  { id: "e2", category: "English Nights", question: "How does the Instagram import work?", answer: "Each tagged post is parsed, classified (READY TO PUBLISH, NEEDS REVIEW, or REJECTED), and auto-published only when venue, date, time, and event media are all validated. Posts that don't meet criteria are held for manual review." },
  { id: "e3", category: "English Nights", question: "Can I see all upcoming English Nights?", answer: "Yes. Click 'English Nights' in the navigation. The landing page shows all published English Nights with venue filters, music style, doors time, and VIP/guest list status." },

  // Celebrations
  { id: "c1", category: "Celebrations", question: "Can I book a birthday at a venue?", answer: "Yes. Submit a celebrations request with the venue, date, party size, and occasion. A dedicated table gives the group a home base, service, and a clear spot for any cake or celebration moment. Arrive early for the best experience." },
  { id: "c2", category: "Celebrations", question: "Do you handle bachelorette and corporate events?", answer: "Yes. We handle birthdays, bachelorette events, bachelor events, corporate hosting, client entertainment, brand activations, and private venue enquiries. Submit a VIP request with the occasion type selected." },
];

const CATEGORIES = ["All", "General", "Tonight & Service Date", "VIP & Tables", "Dress Code & Door", "Getting There", "English Nights", "Celebrations"];

export function FaqView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      if (category !== "All" && f.category !== category) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
      }
      return true;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to site
        </Link>

        {/* Header */}
        <div className="text-center">
          <span className="eyebrow text-accent">Frequently Asked</span>
          <h1 className="heading-editorial mt-3 text-4xl text-foreground md:text-6xl">
            Before you go.
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm text-muted-foreground md:text-base">
            Everything you need to know about Dubai nightlife, booking VIP tables, dress codes, ID,
            getting there, and English Nights.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 flex items-center gap-3 rounded-sm border border-border/60 bg-card p-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); track("filter_events", { source: "faq_category", value: c }); }}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
                category === c
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="mt-6 text-center font-mono-tight text-[0.6875rem] uppercase tracking-[0.15em] text-muted-foreground">
          {filtered.length} question{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* FAQ accordion */}
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-sm border border-dashed border-border/60 py-16 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-serif-display text-xl text-foreground">No questions match your search</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different keyword or contact the concierge.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="mt-8 space-y-2">
            {filtered.map((f) => (
              <AccordionItem
                key={f.id}
                value={f.id}
                className="rounded-sm border border-border/40 bg-card px-4"
              >
                <AccordionTrigger
                  className="text-left text-sm text-foreground hover:no-underline"
                  onClick={() => track("filter_events", { source: "faq_open", value: f.id })}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-accent">
                      {f.category}
                    </span>
                    <span className="flex-1">{f.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Still have questions CTA */}
        <div className="mt-12 rounded-sm border border-border/40 bg-secondary/20 p-6 text-center">
          <h2 className="font-serif-display text-2xl text-foreground">Still have questions?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The concierge team can answer anything specific to your night.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              onClick={() => track("click_whatsapp", { source: "faq_view" })}
              className="rounded-none bg-foreground px-5 text-background hover:bg-accent"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Concierge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
