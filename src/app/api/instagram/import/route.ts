/**
 * GET  /api/instagram/import       — list import stats + all imports
 * POST /api/instagram/import       — run one import pass (simulated polling)
 *
 * The Instagram import pipeline only ingests posts that contain the
 * #AMDXBENGLISHNIGHT hashtag from the three approved venue accounts.
 * No Instagram credentials are exposed. This is a typed mock adapter
 * with the same interface as the production Graph API adapter.
 *
 * GET returns:  { stats, imports: [...] }
 * POST returns: { ok: true, result: {imported, updated, skipped}, stats }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  ensureSeeded,
  runImport,
  getImportStats,
  getAllImports,
} from "@/lib/english-nights";
import type { InstagramImport } from "@/lib/english-nights";

export const dynamic = "force-dynamic";

export interface ImportStatsDTO {
  total: number;
  ready: number;
  needsReview: number;
  rejected: number;
  runs: number;
  lastImportAt: string | null;
}

export interface ImportListResponse {
  stats: ImportStatsDTO;
  imports: InstagramImport[];
}

export interface ImportRunResponse {
  ok: true;
  result: { imported: number; updated: number; skipped: number };
  stats: ImportStatsDTO;
}

export async function GET(): Promise<NextResponse<ImportListResponse>> {
  ensureSeeded();
  const stats = getImportStats();
  const imports = getAllImports();
  return NextResponse.json({ stats, imports });
}

export async function POST(
  _req: NextRequest
): Promise<NextResponse<ImportRunResponse>> {
  // Seed first so the store exists even on a fresh boot, then run a new
  // polling pass. runImport() is idempotent (media IDs are tracked), so
  // re-running with the same sample data simply returns skipped > 0.
  ensureSeeded();
  const result = runImport();
  const stats = getImportStats();
  return NextResponse.json({ ok: true, result, stats });
}
