/**
 * GET /api/asset-manifest
 * -----------------------
 * Returns the full asset manifest (required assets for production launch),
 * the number of missing assets, and the total entry count.
 *
 * Used by the internal Night Edit / launch-readiness view.
 */

import { NextResponse } from "next/server";
import {
  assetManifest,
  getMissingAssetCount,
} from "@/lib/asset-manifest";

export const dynamic = "force-dynamic";

export interface AssetManifestResponse {
  entries: typeof assetManifest;
  missing: number;
  total: number;
}

export async function GET(): Promise<NextResponse<AssetManifestResponse>> {
  const missing = getMissingAssetCount();
  return NextResponse.json({
    entries: assetManifest,
    missing,
    total: assetManifest.length,
  });
}
