# Worklog — W W Nightlife Dubai Platform

---
Task ID: 12
Agent: full-stack-developer
Task: Build API routes for nightlife platform

Work Log:
- Read existing data layer (`events-data.ts`, `venue-data.ts`, `tonight.ts`, `matcher.ts`, `types.ts`, `site-config.ts`, `asset-manifest.ts`) and confirmed the exported functions/types available to the API layer.
- Created shared server-only helpers in `src/lib/api-utils.ts`:
  - `checkRateLimit(ip, max, windowMs)` — sliding 60s in-memory bucket.
  - `getClientIP(req)` — reads `x-forwarded-for` / `x-real-ip`.
  - `generateBookingReference(serviceDate)` — `WW-YYMMDD-XXXX` using crypto random.
  - `bookingDedupHash({fullName, whatsappNumber, venue, eventOrDate})` — FNV-1a 32-bit hash → base36.
  - `captureAttribution(req, body)` — merges client body + `referer` / `x-referrer` headers.
  - `isHoneypotTriggered(body)` — checks `company_website` field.
  - `parseJsonBody<T>(req)` — safe JSON parse.
  - `looksLikePII(value)` + `scrubPII(params)` — email/phone regex stripping for analytics.
- Created in-memory mock persistence in `src/lib/api-store.ts`: `bookingStore` (Map by reference), `newsletterStore` (Map by email), `bookingDedupStore` (hash → timestamp), `trackLog` ring buffer (capped at 500).
- Built `GET /api/tonight` (`force-dynamic`): returns `{ date, label, longLabel, events }` using `getServiceDateLabel()` + `getTonightOccurrences()`, stripped to a light DTO (id, title, venue, conceptSlug, serviceDate, startTime, endTime, status, music, artist, description).
- Built `GET /api/events` (`force-dynamic`): returns next N days (default 7, clamped 1..30 via `?days=`) with optional `?venue=`, `?music=`, `?status=` filters. Output: `{ events, count, range: { from, to } }`.
- Built `POST /api/bookings` (`force-dynamic`): zod-validated VIP booking lead. Honeypot `company_website` → silent success (not stored). Rate limit 10/min/IP → 429 with `Retry-After`. Dedup within 60s by hash of (name+whatsapp+venue+date) → returns original reference. Reference format `WW-YYMMDD-XXXX`. Captures first/last referrer + promoter/concierge/campaign. Stores in `bookingStore`. Returns `{ ok, reference, summary }` — summary explicitly states no payment is taken online and does not promise a response time. Validation errors → 400 with `fields` map.
- Built `POST /api/match-venue` (`force-dynamic`): loosely zod-validated `MatcherInput`, runs `runVenueMatcher`, returns `{ ok, results }`. Honeypot → empty results.
- Built `POST /api/newsletter` (`force-dynamic`): zod-validated `{ email, preferences[], consent }`. Requires `consent === true`. Honeypot + in-memory store. Returns `{ ok: true }`.
- Built `POST /api/track` (`force-dynamic`): accepts `{ name, params, ts }`, scrubs PII (email/phone) from params, logs to console + capped ring buffer, returns 204 No Content. Fire-and-forget semantics; validation failures fail closed (204).
- Built `GET /api/asset-manifest` (`force-dynamic`): returns `{ entries, missing, total }` from `assetManifest` + `getMissingAssetCount()`.
- Fixed a pre-existing parse error in `src/lib/events-data.ts:199` (`now: Date = new Date[]` → `new Date()`) that was a syntax error blocking `/api/tonight` and `/api/events` compilation. The function body already used `new Date()` internally and ignored the `now` param, so the fix is behavior-preserving and was required for the data-layer exports to be usable.
- Verified all routes end-to-end with curl against the running dev server: tonight (200, events + labels), events (200, filters work), match-venue (200, ranked results), newsletter (200 + 400 on missing consent), track (204, PII stripped from console log), bookings (200 + honeypot silent success + validation 400 + dedup returns same reference), asset-manifest (200).
- Ran `bun run lint`: zero errors and zero warnings in all API files (`src/app/api/**` + `src/lib/api-utils.ts` + `src/lib/api-store.ts`). The only remaining lint issues are pre-existing in `src/components/asset-image.tsx` and `src/components/sections/tonight-section.tsx` (built by other agents, outside this task's scope).

Stage Summary:
- Created 9 files: 7 API route handlers under `src/app/api/` (`tonight`, `events`, `bookings`, `match-venue`, `newsletter`, `track`, `asset-manifest`) plus 2 shared lib modules (`src/lib/api-utils.ts`, `src/lib/api-store.ts`).
- All handlers use `export async function GET/POST(req: NextRequest)` with `NextResponse`, `export const dynamic = "force-dynamic"` where data is live, zod server-side validation, honeypot spam traps, PII scrubbing for analytics, in-memory rate limiting, and attribution capture.
- No internal NightOps credentials exposed; no PII sent to analytics; no payments processed; no response-time promises.
- TypeScript strict, no `any`. Lint passes for all API files.
- Fixed one blocking parse error in the pre-existing `events-data.ts` data layer so the API routes could compile and serve.

---
Task ID: 11
Agent: frontend-styling-expert
Task: Build content sections (Celebrations, Night Edit, Locations, Newsletter, About/FAQ)

Work Log:
- Read worklog.md and the established design system: globals.css (venue theme tokens, eyebrow / heading-editorial / font-mono-tight / venue-surface / hairline / tnum / grain utilities), hero-section.tsx, tonight-section.tsx, venues-section.tsx (matched exact dark editorial style — near-black bg, warm ivory text, soft chrome accent).
- Read asset-image.tsx (AssetImage placeholder contract — required for every image), site-config.ts (parentName, promise, contact placeholders), venue-data.ts (venues + locationRecords), guide-data.ts (guideArticles + guideCategories), analytics.ts (track + TrackEventName union), ui-store.ts (useUi with openBooking / openVenueDrawer / openEventDrawer).
- Verified shadcn/ui components available: Button, Input, Checkbox, Label, Accordion, Card, and the useToast hook at @/hooks/use-toast. Read each to confirm prop signatures (Checkbox onCheckedChange gives boolean | "indeterminate").
- Verified POST /api/newsletter contract: accepts { email, preferences[], consent: true, company_website } — honeypot silently succeeds, validation returns { fields } map.
- Verified asset-manifest.ts naming for all images I reference: home_locations_wide (g7), shangri_la_arrival (l1), hilton_habtoor_arrival (l4) are in the manifest; home_celebrations_wide.webp and article_{slug}_cover.webp follow the existing naming convention and render through AssetImage designed placeholders when missing.
- Created /home/z/my-project/src/components/sections/celebrations-section.tsx (id="celebrations"): header (eyebrow + h2 + subtext + side info chip), 7 celebration cards in a 4-col grid (Cake, Heart, Users, Briefcase, Building2, Sparkles, Lock icons; each card tracks start_vip_inquiry {occasion, source:"celebrations"} then opens booking with venue:"any" + eventOrDate:occasion name), wide AssetImage editorial strip (home_celebrations_wide.webp, wide crop), verification note "We don't confirm specific inclusions or minimum spends until verified."
- Created /home/z/my-project/src/components/sections/night-edit-section.tsx (id="night-edit"): header (eyebrow "The Night Edit" + h2 "Dubai Nightlife Guide" + Arabic-versions note), featured article (first from guideArticles) as large editorial card with cover AssetImage (article_{slug}_cover.webp) + category tag + AR badge + reviewed date + Read button (asChild anchor to #night-edit-list, tracks view_event), category filter chips from guideCategories (All + 9 categories) with client state + filter_events tracking, 3-col grid of remaining articles (compact cards with cover, category, title, excerpt, reviewed date, AR badge) each tracking view_event {article, source:"night_edit"} on click, empty state for filtered-out categories.
- Created /home/z/my-project/src/components/sections/locations-section.tsx (id="locations"): header (eyebrow "Two Locations" + h2 + subtext), wide AssetImage (home_locations_wide.webp), two location blocks from locationRecords — each with arrival AssetImage (shangri_la_arrival.webp / hilton_habtoor_arrival.webp), hotel name h3 serif, area badge, venues-at-this-location list (shortName + floor pulled from venues), description, definition list of arrival instructions (Entrance/Floor/Valet-Parking/Taxi) with DoorOpen/Building2/Car/Navigation icons, "Open Map" Button (outline) that tracks click_map {location: slug} and opens https://www.google.com/maps?q=LAT,LNG, metro walking times disclaimer at bottom (does NOT claim metro walking times).
- Created /home/z/my-project/src/components/sections/newsletter-section.tsx (id="newsletter"): split card — left col (eyebrow "Newsletter & WhatsApp Updates" + h2 "Get the right updates. Not all of them." + consent-properly subtext + WhatsApp secondary CTA tracking click_whatsapp and opening wa.me link), right col form with email Input + Mail icon, 7 preference Checkboxes in a 2-col grid (Avenue/Ora/Black Tape updates, Arabic nights, Urban nights, VIP offers, Major artist announcements), required marketing-consent Checkbox, hidden honeypot input named company_website, inline error state with AlertCircle, Subscribe Button. On submit: validates consent client-side, POSTs to /api/newsletter with {email, preferences, consent:true, company_website}, on success shows toast + inline confirmation + clears form + tracks newsletter_signup {preferences: comma-joined}, on error shows inline error message from response.fields/error. Honeypot silently succeeds.
- Created /home/z/my-project/src/components/sections/about-faq-section.tsx (id="about", with nested id="faq"): About part — eyebrow "About" + h2 "One owner. Three venues. One Dubai after dark." + 3 paragraphs positioning W W Nightlife Dubai as "the most direct way to discover and reserve the right Dubai night across three distinct venues" (NOT "best nightclub in Dubai"), references parent promise, mentions facts pending verification, plus stats strip (3 Venues / 2 Skyline addresses / 1 Concierge / 21+ Age) with "Pending verification" small print. FAQ part — eyebrow "FAQ" + h2 "Before you go" + shadcn Accordion (type="single" collapsible) with 8 Q&As (ID requirements, dress code, age, how to book a table, guest list vs table, getting there, service date 6 AM logic, venue differences) — each answer practical and direct. Accordion onValueChange tracks filter_events {faq_open: slug}. Concierge CTA card on the right with "Contact Concierge" Button → start_vip_inquiry {source:"about_faq_cta"} → openBooking().
- Ran `bun run lint`: zero errors and zero warnings in any of the 5 new files. Remaining 3 issues (2 errors + 1 warning) are all pre-existing in asset-image.tsx and tonight-section.tsx, explicitly noted as out-of-scope by the previous agent's worklog entry.
- Ran `bunx tsc --noEmit`: zero TypeScript errors in any of the 5 new files. Pre-existing errors in vip-section.tsx (Lucide "Stage" import), site-header.tsx (Lucide "CalendarNights" import), api/track/route.ts, plus example/skill files — all outside this task's scope.

Stage Summary:
- Created 5 new section components under src/components/sections/:
  1. celebrations-section.tsx (id="celebrations")
  2. night-edit-section.tsx (id="night-edit", with internal #night-edit-list anchor)
  3. locations-section.tsx (id="locations")
  4. newsletter-section.tsx (id="newsletter")
  5. about-faq-section.tsx (id="about" with nested id="faq")
- All sections match the established dark editorial style: near-black bg, warm ivory text, soft chrome accent, Bodoni serif headings via heading-editorial/font-serif-display, Manrope mono labels via eyebrow/font-mono-tight, shadcn Button with rounded-none + uppercase tracking CTAs, hairline borders via border-border/40, section wrapper `<section className="relative border-t border-border/40 bg-background"><div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">`.
- Every image uses `<AssetImage>` with proper file/purpose/dimensions/crop/venue/alt — zero raw <img> tags.
- All CTAs track via `track()`: start_vip_inquiry (celebrations enquire, about CTA), view_event (night edit featured + grid cards), filter_events (night edit category chips, FAQ accordion opens), click_map (locations open map), click_whatsapp (newsletter WhatsApp CTA), newsletter_signup (form submit). All use valid TrackEventName values.
- Newsletter form wires to the existing POST /api/newsletter endpoint with the correct payload shape, honeypot, consent validation, toast feedback, and inline confirmation/error states.
- Locations section uses locationRecords + venues from venue-data.ts, opens Google Maps with lat/lng, and explicitly does NOT claim metro walking times (uses the metroNote disclaimer pattern).
- About section positioning avoids "best nightclub in Dubai" superlative; uses "the most direct way to discover and reserve the right Dubai night across three distinct venues" per directive. Mentions facts are pending verification.
- Lint passes clean for all 5 files. TypeScript passes clean for all 5 files.

---
Task ID: LEAD-FINAL
Agent: lead (Z.ai Code)
Task: Build complete W W Nightlife Dubai platform — architecture, design system, core sections, drawers, booking modal, page assembly, QA

Work Log:
- Read the full GO GOD MODE BUILD DIRECTIVE (1978 lines) covering W W Nightlife Dubai (parent), Avenue Club, Ora Club, Black Tape Club.
- Adapted the Astro-based directive to Next.js 16 App Router (non-negotiable stack constraint) and a single-route architecture (only `/` is user-visible; multi-route sitemap adapted into anchored sections + client-side drawers/modals).
- Built the central site configuration layer:
  - `src/lib/site-config.ts` — parent group name (W W Nightlife Dubai), brand promise, venueEntityMode (pending_verification), service day boundary (6 AM), SEO defaults, contact placeholders, assetStrictMode flag.
  - `src/lib/types.ts` — full domain model (VenueRecord, EventConcept, EventOccurrence, GuideArticle, VipBookingLead, TrackableEvent) mirroring NightOps OS.
  - `src/lib/venue-data.ts` — three venue records with distinct visual worlds (Avenue: crimson/burgundy/gold; Ora: emerald/teal/brass; Black Tape: ink/graphite/white/red), unique descriptions, location/dress/age/entry policies, opening hours (pending verification), signature concepts, gallery/floorplan/og asset paths. Plus locationRecords for the two hotels.
  - `src/lib/events-data.ts` — 7 event concepts + generated sample occurrences for the next 10 service days (clearly labelled sample:true). Availability intentionally NOT set so UI shows "Contact Concierge".
  - `src/lib/guide-data.ts` — 13 Night Edit articles across 9 categories (Dubai Nightlife Guide, Arabic/Khaleeji nights, Hip Hop/R&B, VIP tables, Dress/Door, Areas/Hotels, Celebrations, Venue Notes) with reviewed dates and Arabic-version flags.
  - `src/lib/asset-manifest.ts` — 90+ required asset entries (global, location, avenue, ora, blacktape, night_edit) with file/path/purpose/dimensions/crop/venue/usage.
  - `src/lib/tonight.ts` — nightlife service date engine (6 AM boundary, Asia/Dubai, getServiceDate/getServiceDateLabel/addDays/getNextServiceDates).
  - `src/lib/seo.ts` — JSON-LD generators (Organization, WebSite, NightClub, MusicEvent, Article, BreadcrumbList).
  - `src/lib/matcher.ts` — Find My Venue ranking engine (7 inputs → scored results with concise reasons, live-events-only).
- Built the design system in `src/app/globals.css`: parent visual world (near-black #07070A, warm ivory #F5EFE6, soft chrome #C8B98E), per-venue theme tokens via `[data-venue]` CSS variables, Manrope + Bodoni Moda fonts (self-hosted via next/font), cinematic utilities (grain, light-sweep, hairline, venue-surface), reduced-motion support, mobile safe areas, refined scrollbars. Fixed CSS layering so Tailwind color utilities override component-layer classes.
- Updated `src/app/layout.tsx`: Manrope + Bodoni Moda fonts, dark theme, comprehensive metadata (title template, hreflang en/ar/x-default, OpenGraph, Twitter card, robots), Organization + WebSite JSON-LD in <head>, favicon.svg.
- Created the `AssetImage` designed-placeholder component (`src/components/asset-image.tsx`): attempts real src, on error shows a DESIGNED placeholder with MISSING ASSET / FILE / PURPOSE / DIMENSIONS / CROP, corner brackets, diagonal hatch, venue-themed. Derived-state pattern to avoid setState-in-effect lint.
- Built the core layout shell:
  - `src/components/site-header.tsx` — fixed header, transparent→solid on scroll, desktop nav (Tonight/Venues/Events/VIP/Celebrations/The Night Edit/About/Book VIP), mobile sheet menu with staggered animation.
  - `src/components/mobile-action-bar.tsx` — persistent lower action bar (Tonight/Venues/Book) with safe-area padding, lg:hidden.
  - `src/components/site-footer.tsx` — sticky footer (mt-auto), brand promise, venue/guide/company columns, social icons, legal links, entity-resolution amber notice.
  - `src/lib/ui-store.ts` — Zustand store (venueDrawer, eventDrawer, bookingOpen/preset, mobileMenuOpen, heroVenue).
  - `src/lib/analytics.ts` — consent-aware track() pushing to dataLayer + POST /api/track with PII scrubbing.
- Built all 11 homepage sections:
  1. Hero — cinematic full-viewport, auto-cycling venue tabs (Avenue/Ora/Black Tape), per-venue color wash + radial glow + hero image placeholder + grain + vignette, eyebrow + live-tonight status, 3 CTAs (See Tonight / Find My Venue / Direct VIP), venue transition tabs.
  2. Tonight — nightlife service date label, 3 venue cards with event/status/music/doors/location, "Contact Concierge" availability (never fake), Event Details + Request VIP actions.
  3. Venues — 3 large editorial panels (alternating layout), venue hero image, logo placeholder, heading/supporting/description, next events list, Explore + Request VIP actions, entity notice.
  4. Events — 7-night grid with filters (Venue/Music/Status), event cards with poster/date badge/status/music/doors/artist, "Tables · Contact Concierge", View Event + Request VIP.
  5. Find My Venue — 7-step matcher (Date/Music/Mood/Location/Group/Occasion/Budget) with progress rail, ranked results with reason + live event, actions (View Event/Reserve VIP/WhatsApp/Share), alternative venues.
  6. VIP — 5 table types, 3-step how-it-works, no-response-time-promise notice, CTA.
  7. Celebrations — 7 occasion cards, editorial image, verification note.
  8. Night Edit — featured article + category filter chips + 3-col article grid, Arabic-version note.
  9. Locations — 2 hotel blocks with arrival images, entrance/floor/valet/taxi instructions, Open Map, metro disclaimer.
  10. About + FAQ — positioning copy (NOT "best nightclub"), stats strip, 8-Q&A accordion.
  11. Newsletter — email + 7 preferences + consent + honeypot, POST /api/newsletter, WhatsApp CTA.
- Built interactive overlays:
  - `src/components/drawers/venue-drawer.tsx` — full venue detail (hero, tonight status, description, music, signature concepts, upcoming events, gallery, VIP + floorplan, dress/age/entry/location/parking/hours, FAQ accordion, contact placeholders, related articles, other venues, sticky CTA).
  - `src/components/drawers/event-drawer.tsx` — event detail (poster hero, date badge, meta grid, description, entry/dress/age, table info "Contact Concierge", sample-data notice, actions: Request VIP/WhatsApp/Add to Calendar .ics/Share, location + map).
  - `src/components/booking-modal.tsx` — 3-step VIP booking (Night/Table/Contact) with validation, honeypot, referral attribution capture (promoter/concierge/campaign from URL), POST /api/bookings, confirmation with reference + WhatsApp prefilled + copy reference.
  - `src/components/asset-manifest-view.tsx` — internal /?view=asset-manifest page (noindex) with stats, venue/present filters, full table.
- Assembled `src/app/page.tsx` (server component): reads searchParams.view, renders AssetManifestView or the main page with all sections + JSON-LD (NightClub + MusicEvent + Article) + drawers + booking modal. `generateMetadata` handles noindex for asset-manifest.
- Created `src/app/sitemap.ts` (static + venue + guide routes) and updated `public/robots.txt` (disallow asset-manifest/thankyou, sitemap reference).
- Fixed Lucide icon imports (CalendarNights→CalendarClock, Stage→Disc3) and setState-in-effect lint errors (derived-state pattern in asset-image, useMemo in tonight-section).
- Delegated API routes (Task 12) and content sections (Task 11) to subagents in parallel.

QA / Verification (agent-browser):
- Page loads 200, title correct: "Dubai Nightlife Events and VIP Tables | W W Nightlife".
- All 11 sections render (top, tonight, venues, events, find-my-venue, vip, celebrations, night-edit, locations, about, newsletter).
- Hero: cinematic, editorial, venue tabs auto-cycle, Ora emerald theme active, 3 CTAs visible.
- Booking modal: opens, 3-step navigation works, date select + party size + table/budget/occasion + contact fields, validation works, submission returns reference "WW-260826-KP7B", confirmation view with WhatsApp/copy.
- Venue drawer: opens with "Ora Club Dubai", shows all detail sections.
- Matcher: 7-step flow works, returns "Black Tape" for Hip Hop + Al Habtoor City input.
- Mobile (iPhone 14): responsive, no horizontal overflow, bottom action bar (Tonight/Venues/Book) visible, venue cards readable.
- Footer: sticky at bottom, complete with all columns + entity notice.
- VLM analysis: "highly polished and cohesive", "cinematic and editorial", "sophisticated dark mode aesthetic", "luxury".
- Dev log: zero runtime errors during full interaction testing.
- Lint: zero errors, zero warnings.

Stage Summary:
- Complete production-ready nightlife platform built on Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui.
- 3 distinct venue visual worlds (Avenue crimson, Ora emerald, Black Tape ink) with per-venue CSS theme tokens.
- Tonight engine with 6 AM service-date boundary.
- Event system with 7 concepts, sample occurrences, 7 statuses, never-fake availability.
- Find My Venue matcher (7-input ranking, structured-data-only, no chatbot).
- 3-step VIP booking flow with server validation, honeypot, rate-limit, dedup, attribution, booking reference.
- Designed MissingAsset placeholder system for all 90+ required assets.
- Full SEO: JSON-LD (Organization/WebSite/NightClub/MusicEvent/Article/Breadcrumb), sitemap, robots, hreflang, OpenGraph.
- Analytics tracking (12 event types) with PII scrubbing.
- Internal asset manifest page (noindex).
- All venue facts clearly labelled pending verification; entity-resolution notice for Ora/Black Tape.
- Mobile-first responsive with sticky footer + persistent bottom action bar.

Unresolved issues / risks / next-phase priorities:
- All venue imagery uses designed placeholders (per directive) — real venue photos/logos/floorplans required before production launch.
- Phone/email/opening hours/minimum spends pending owner verification.
- venueEntityMode for Ora/Black Tape is pending_verification — confirm separate_rooms vs shared_room_event_brands.
- NightOps OS adapter is a typed mock — swap to production adapter when API is ready.
- No real payment workflow — deposits not processed (per directive).
- Arabic (/ar) route architecture defined in hreflang but not yet built — next phase should add RTL Arabic versions.
- Newsletter/booking storage is in-memory — migrate to persistent DB (Prisma) when approved.
- Consent/cookie banner not yet implemented — needed for GA4/GTM/Meta Pixel consent-aware loading.
- Performance: should add next/image optimization once real assets exist; currently using AssetImage with lazy loading.

---
Task ID: en-2
Agent: full-stack-developer
Task: Build English Nights API routes

Work Log:
- Read `/home/z/my-project/worklog.md` to confirm prior agents' work (Task 12 = base API routes; Task 11 = content sections; LEAD-FINAL = platform shell). The English Nights data layer (`src/lib/english-nights.ts`) was already in place — confirmed exported symbols: `ENGLISH_NIGHT_HASHTAG`, `approvedAccounts`, `parseCaption`, `classifyImport`, `importToOccurrence`, `runImport`, `getImportStats`, `getAllImports`, `getPublishedEnglishNights`, `getAllEnglishNights`, `getEnglishNight`, `getTonightEnglishNights`, `publishImport`, `rejectImport`, `ensureSeeded`. Types: `InstagramImport`, `EnglishNightEvent`, `ImportStatus`, `ParsedCaption`.
- Reviewed the established API conventions by reading `src/app/api/events/route.ts` and `src/app/api/tonight/route.ts` — both use `export const dynamic = "force-dynamic"`, `NextRequest`/`NextResponse`, named DTO interfaces, type guards for query validation, and 400 responses with `{ error }` body on bad query. Mirrored this exact style for the new English Nights routes.
- Created `src/app/api/english-nights/route.ts` (`force-dynamic`):
  - `GET` with `?status=published|all|tonight` (default `published`) and optional `?venue=avenue|ora|blacktape`.
  - Calls `ensureSeeded()` first, then dispatches to `getPublishedEnglishNights()`, `getAllEnglishNights()`, or `getTonightEnglishNights()`, applies the venue filter, and returns `{ events: [...light DTO], count, stats }`.
  - Light DTO exposes: `id, title, venue, serviceDate, startTime, endTime, status, music, artist, importStatus, mediaId, permalink, accountHandle, poster, sample`.
  - Returns 400 on bad `?status=` or `?venue=` values with a descriptive `{ error }` body.
- Created `src/app/api/english-night/route.ts` (`force-dynamic`):
  - `GET` with required `?venue=` and `?date=YYYY-MM-DD`.
  - Validates venue slug and ISO date format (`/^\d{4}-\d{2}-\d{2}$/`) — 400 on missing/invalid.
  - Calls `ensureSeeded()` + `getEnglishNight(venue, date)`, returns the full `EnglishNightEvent` wrapped as `{ event }`, or 404 with `{ error }` if no occurrence exists for that venue+date.
  - Chose flat `/api/english-night?venue=&date=` route (per task spec) because event ids are `en-{venue}-{date}` and the date segment is dynamic, so a query-string lookup is cleaner than a `[id]` dynamic segment with embedded parsing.
- Created `src/app/api/instagram/import/route.ts` (`force-dynamic`):
  - `GET`: returns `{ stats, imports }` — `stats` from `getImportStats()`, `imports` from `getAllImports()` (full objects including `parsed` caption + `statusReason`). Calls `ensureSeeded()` first.
  - `POST`: triggers one import pass. Calls `ensureSeeded()` then `runImport()`, returns `{ ok: true, result: {imported, updated, skipped}, stats }`. Idempotent — re-running returns `skipped > 0` because the data layer tracks seen media IDs.
  - `POST` accepts a `_req: NextRequest` arg (unused body) for signature stability; no request body required.
- Created `src/app/api/instagram/import/[id]/route.ts` (`force-dynamic`):
  - `GET`: fetches a single import by id (`params: Promise<{ id: string }>`, awaited per Next 16 convention), returns `{ import }` or 404.
  - `POST`: body `{ action: "publish" | "reject", reason?: string }`. Validates `action` against a string-literal union (400 on invalid), parses `reason` only if it's a non-empty string.
  - Publish path: verifies import exists (404 if not) → calls `publishImport(id)` → on `ok: true` returns `{ ok: true, occurrenceId }` (200); on `ok: false` returns `{ ok: false, error }` (409, e.g. when the import is missing required fields like `doors`).
  - Reject path: verifies import exists (404 if not) → calls `rejectImport(id, reason)` → returns `{ ok: true }` (200) or 409 on failure.
  - Bad JSON body → 400. Bad `action` value → 400.
- Input validation summary across all routes:
  - `?status=` and `?venue=` validated against string-literal unions; 400 with descriptive error on mismatch.
  - `?date=` validated with strict ISO regex `/^\d{4}-\d{2}-\d{2}$/`; rejects `MM-DD-YYYY` and other formats.
  - `action` body field validated against `["publish","reject"]` union.
  - `reason` only accepted if `string`; otherwise ignored.
- No PII is processed by these routes. No Instagram credentials are exposed (the data layer is a typed mock adapter; only media IDs + permalinks + public handles surface in responses).
- TypeScript strict throughout, no `any`. All handlers use `NextRequest`/`NextResponse` and `export async function GET/POST`. `params` is typed as `Promise<{ id: string }>` and awaited (Next 16 requirement).
- Ran `bun run lint`: zero errors, zero warnings in all 4 new files (and globally).
- Ran `bunx tsc --noEmit` and grep-filtered for `english-night`/`instagram`: zero TypeScript errors in the new files.
- Curl-tested every route against `http://localhost:3000`:
  - `GET /api/english-nights` (200), `?status=all` (200), `?status=tonight` (200), `?status=bogus` (400), `?venue=avenue` (200), `?venue=bogus` (400). Default `published` returns 3 events; `all` returns 3 published + 2 needs-review = 5 total. Stats correctly reflect `{total:5, ready:3, needsReview:2, rejected:0, runs:1, lastImportAt}` after the seed run.
  - `GET /api/english-night?venue=blacktape&date=2026-08-27` (200, full event JSON with conceptSlug, dressCode, agePolicy, location, etc.); `?venue=avenue&date=1999-01-01` (404); `?venue=bogus` (400); missing `?venue=` (400); missing `?date=` (400); `?date=08-28-2026` (400 — non-ISO).
  - `GET /api/instagram/import` (200, returns stats + 5 imports with full parsed captions + statusReason). `POST /api/instagram/import` (200, returns `{ ok:true, result:{imported:0, updated:0, skipped:5}, stats }` on a re-run — idempotency confirmed).
  - `GET /api/instagram/import/imp_ig_avenue_2026-08-25` (200, returns single import). `GET /api/instagram/import/imp_does_not_exist` (404).
  - `POST /api/instagram/import/<needs_review_id>` with `{action:"publish"}` on the doors-missing sample → 409 `{ ok:false, error:"Cannot build occurrence — missing required fields." }` (correct: data layer refuses to publish without `doors`).
  - `POST /api/instagram/import/<needs_review_id_missing_only_title>` with `{action:"publish"}` → 200 `{ ok:true, occurrenceId:"en-ora-2026-09-02" }` (correct: manual publish promotes a needs-review import whose required fields are actually present).
  - `POST {action:"reject",reason:"..."}` → 200 `{ ok:true }`.
  - `POST {action:"delete"}` → 400 (invalid action). Malformed JSON body → 400. Publish on non-existent import id → 404.
- Verified in `dev.log`: all 4 routes compiled and served correctly with expected HTTP status codes (200/400/404/409) — no runtime errors, no warnings.

Stage Summary:
- Created 4 new API route files (5 endpoints total — `/api/english-nights` has GET, `/api/english-night` has GET, `/api/instagram/import` has GET+POST, `/api/instagram/import/[id]` has GET+POST):
  1. `src/app/api/english-nights/route.ts`
  2. `src/app/api/english-night/route.ts`
  3. `src/app/api/instagram/import/route.ts`
  4. `src/app/api/instagram/import/[id]/route.ts`
- All routes use `force-dynamic`, `NextRequest`/`NextResponse`, Next 16 async `params: Promise<{ id: string }>` pattern, strict TypeScript with no `any`, and 400/404/409 error responses with descriptive `{ error }` bodies.
- End-to-end curl tests pass for all happy paths and all validation error paths. Lint passes clean (0 errors, 0 warnings). `tsc --noEmit` passes clean for all new files.
- No Instagram credentials or PII exposed. The Instagram import pipeline only ingests `#AMDXBENGLISHNIGHT` posts from the three approved venue accounts (avenue / ora / blacktape) via the existing typed-mock data layer; auto-publish happens only when venue ✓ + date ✓ + time ✓ + media ✓ per the directive.

---
Task ID: EN-FEATURE
Agent: lead (Z.ai Code)
Task: Rename parent to AFTER MIDNIGHT DXB + build English Night Instagram Automation feature

Work Log:
- Renamed parent group from "W W Nightlife Dubai" to "AFTER MIDNIGHT DXB" centrally in site-config.ts (parentName, parentShortName, seo.siteName, seo.defaultTitle, siteUrl). The rename propagates everywhere via siteConfig references. Updated: header logo monogram (W→AM), footer logo, favicon.svg, booking-modal consent text, hero aria-label, celebrations alt text, matcher WhatsApp text, event-drawer calendar PRODID/UID, booking reference prefix (WW-→AMD-), robots.txt sitemap URL, layout metadata. Code comments retained as historical notes.
- Scheduled 15-minute webDevReview cron job (job ID 339173, `0 */15 * * * ?`, Asia/Dubai, kind=webDevReview).
- Built English Night Instagram Automation feature:
  - `src/lib/english-nights.ts` — full data layer: ENGLISH_NIGHT_HASHTAG (#AMDXBENGLISHNIGHT), approvedAccounts (3 venue IG handles), parseCaption() (extracts venue/title/date/doors/close/music/DJs/entry/VIP/guestList from structured key:value or natural language), classifyImport() (READY_TO_PUBLISH / NEEDS_REVIEW / REJECTED), importToOccurrence(), runImport() (mock import pass, idempotent via mediaId tracking), getImportStats/getAllImports/getPublishedEnglishNights/getEnglishNight/getTonightEnglishNights, publishImport/rejectImport (manual review actions), ensureSeeded(). 5 sample captions covering ready/needs-review/duplicate scenarios.
  - API routes (delegated to subagent Task en-2): GET /api/english-nights (?status=published|all|tonight, ?venue=), GET /api/english-night (?venue=&date=), GET+POST /api/instagram/import (trigger run + list all), GET+POST /api/instagram/import/[id] (publish/reject). All force-dynamic, validated, no PII/credentials.
  - `src/components/english-nights-view.tsx` — public landing (?view=english-nights): tonight status band, venue/music/status filters, event grid with Instagram-source badges, how-it-works, admin link. noindex=false.
  - `src/components/english-night-detail-view.tsx` — event detail (?view=english-night&venue=&date=): hero, breadcrumb, meta grid, description, entry/dress/age, Contact Concierge table info, Request VIP / WhatsApp / Add to Calendar / Share actions, location + map, Instagram source post link + media ID, JSON-LD MusicEvent structured data.
  - `src/components/english-nights-admin-view.tsx` — import review (?view=english-nights-admin, noindex): stats (total/ready/needsReview/rejected/runs), status tabs, import rows with parsed-field grid + caption preview + publish/reject actions, Run Import button. Full review workflow.
  - `src/components/sections/english-nights-promo.tsx` — homepage promo section explaining the hashtag-only import system with CTA to landing + admin.
  - Wired all views into page.tsx view router with proper metadata (english-nights = indexable, english-nights-admin = noindex). Added "English Nights" to header nav.
- Fixed Next.js scroll-behavior warning (added data-scroll-behavior="smooth" to <html>).

QA / Verification (agent-browser):
- English Nights landing (?view=english-nights): title "English Nights in Dubai | AFTER MIDNIGHT DXB", 3 event cards render, tonight status band, filters work.
- English Night detail (?view=english-night&venue=blacktape&date=2026-08-27): title "English Night — Thursday", breadcrumb "Home / English Nights / Black Tape · 27 Aug", JSON-LD structured data present, Instagram permalink + media ID shown, all actions present.
- Admin review (?view=english-nights-admin): title "English Nights Import Review — Internal" (noindex), stats render (5 total, 4 ready, 1 rejected), Run Import button works (runs 2→3, idempotent), Reject action works (ready 4→3, rejected 1→2), rejected event removed from public landing (3→2 cards).
- Homepage: nav link "English Nights" present, promo section "English Nights, direct from Instagram." renders.
- Lint: 0 errors, 0 warnings. No console errors. No runtime errors.

Stage Summary:
- Parent renamed to AFTER MIDNIGHT DXB across the entire platform (central config + all user-facing strings + favicon + booking prefix AMD-).
- English Night Instagram Automation feature complete: hashtag-only import (#AMDXBENGLISHNIGHT), caption parser, 3-status classification (READY/NEEDS REVIEW/REJECTED), auto-publish when validated, manual review panel, public landing + detail pages with SEO + structured data.
- 15-minute webDevReview cron job scheduled.
- All flows verified end-to-end with agent-browser.

Unresolved / next-phase:
- Instagram adapter is a typed mock — swap to real Instagram Graph API adapter when credentials are available.
- English Night event media uses designed placeholders — real Instagram media URLs would replace them in production.
- The /events/english-night/[venue]/[date] route is adapted to ?view=english-night&venue=&date= due to the single-route environment constraint.
