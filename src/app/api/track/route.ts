/**
 * POST /api/track
 * ---------------
 * Server-side analytics event log (fire-and-forget).
 *
 * Accepts { name: string, params: Record<string, primitive>, ts: number }.
 *
 *  - Strips any param value that looks like an email or phone (PII scrub).
 *  - Logs to console (server-side only). No PII is logged.
 *  - Keeps a capped in-memory ring buffer (trackLog) for inspection.
 *  - Returns 204 No Content (fast fire-and-forget semantics).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  parseJsonBody,
  scrubPII,
  type Primitive,
} from "@/lib/api-utils";
import { trackLog, TRACK_LOG_MAX, type TrackLogEntry } from "@/lib/api-store";

export const dynamic = "force-dynamic";

const TrackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name required")
    .max(80)
    .regex(/^[a-z0-9_]+$/, "name must be snake_case"),
  params: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]))
    .default({}),
  ts: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
});

export async function POST(
  req: NextRequest
): Promise<NextResponse> {
  const parsed = await parseJsonBody<Record<string, unknown>>(req);
  if (!parsed.ok) {
    return new NextResponse(null, { status: 204 });
  }

  const result = TrackSchema.safeParse(parsed.data);
  if (!result.success) {
    // Fail closed: don't surface validation details to the client; just 204.
    return new NextResponse(null, { status: 204 });
  }

  const { name, params, ts } = result.data;
  const safeParams = scrubPII(params as Record<string, Primitive>);

  const entry: TrackLogEntry = {
    receivedAt: ts,
    name,
    params: safeParams,
  };

  // Append to ring buffer (cap).
  trackLog.push(entry);
  if (trackLog.length > TRACK_LOG_MAX) {
    trackLog.splice(0, trackLog.length - TRACK_LOG_MAX);
  }

  // Console log (server-side only, fire-and-forget).
  // Keep it compact and PII-free.
  console.log("[track]", name, JSON.stringify(safeParams));

  return new NextResponse(null, { status: 204 });
}
