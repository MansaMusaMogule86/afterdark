# Task 12 — full-stack-developer — API Routes

## Scope
Build backend API route handlers (Next.js 16 App Router `route.ts`) for the
W W Nightlife Dubai platform, consuming the existing typed data layer in
`src/lib/`.

## Files Created
- `src/lib/api-utils.ts` — server-only helpers (rate limit, IP, reference gen, dedup hash, attribution capture, honeypot check, JSON parse, PII scrub).
- `src/lib/api-store.ts` — in-memory mock persistence (bookingStore, newsletterStore, bookingDedupStore, trackLog ring buffer).
- `src/app/api/tonight/route.ts` — `GET` tonight's service date + events (light DTO).
- `src/app/api/events/route.ts` — `GET` upcoming events with `?days=`, `?venue=`, `?music=`, `?status=` filters.
- `src/app/api/bookings/route.ts` — `POST` VIP booking lead (zod, honeypot, rate limit, dedup, reference gen, attribution).
- `src/app/api/match-venue/route.ts` — `POST` matcher input → ranked venue results.
- `src/app/api/newsletter/route.ts` — `POST` newsletter subscription (consent required, honeypot).
- `src/app/api/track/route.ts` — `POST` analytics event log (PII scrub, fire-and-forget, 204).
- `src/app/api/asset-manifest/route.ts` — `GET` full asset manifest + missing count.

## File Modified
- `src/lib/events-data.ts:199` — fixed parse error `new Date[]` → `new Date()` (blocked all routes importing the data layer). Behavior-preserving; the `now` param was unused in the body.

## Verification
- `bun run lint`: zero issues in all API files. Remaining lint issues are pre-existing in `src/components/asset-image.tsx` and `src/components/sections/tonight-section.tsx` (other agents' files).
- Curl-tested all 7 routes against the running dev server, including edge cases (honeypot, validation errors, dedup, missing consent, filters, PII scrubbing).

## Notes for Downstream Agents
- All API routes are under `/api/*` (relative paths only, no absolute URLs).
- In-memory stores reset on dev HMR / server restart — swap for the NightOps OS adapter + Prisma when ready.
- Booking reference format: `WW-YYMMDD-XXXX` (crypto-sourced suffix from a no-confusable-char alphabet).
- Rate limit: 10 submissions/min/IP (bookings). Naive single-instance counter.
- Track endpoint strips email-like and phone-like (8+ digit) values from params before logging.
