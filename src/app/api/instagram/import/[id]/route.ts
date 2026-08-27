/**
 * GET  /api/instagram/import/[id]                          — fetch one import
 * POST /api/instagram/import/[id]  { action, reason? }     — publish | reject
 *
 * Publish: mark a NEEDS_REVIEW / READY_TO_PUBLISH import as published and
 *          materialise its English Night occurrence.
 * Reject:  remove the import's occurrence (if any) and mark it REJECTED.
 *
 * Returns:
 *   GET  → { import: InstagramImport }     (404 if not found)
 *   POST → { ok: true, occurrenceId? } | { ok: false, error }
 *
 * No Instagram credentials are exposed.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  ensureSeeded,
  getAllImports,
  publishImport,
  rejectImport,
} from "@/lib/english-nights";
import type { InstagramImport } from "@/lib/english-nights";

export const dynamic = "force-dynamic";

const ACTIONS = ["publish", "reject"] as const;
type ImportAction = (typeof ACTIONS)[number];

function isAction(s: string): s is ImportAction {
  return (ACTIONS as readonly string[]).includes(s);
}

interface ActionBody {
  action?: unknown;
  reason?: unknown;
}

function readBody(body: unknown): ActionBody {
  if (body && typeof body === "object") return body as ActionBody;
  return {};
}

export interface ImportDetailResponse {
  import: InstagramImport;
}

export interface ImportActionResponse {
  ok: boolean;
  occurrenceId?: string;
  error?: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ImportDetailResponse | { error: string }>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing import id." },
      { status: 400 }
    );
  }

  ensureSeeded();

  const imp = getAllImports().find((i) => i.id === id);
  if (!imp) {
    return NextResponse.json(
      { error: `Import '${id}' not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ import: imp });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ImportActionResponse | { error: string }>> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing import id." },
      { status: 400 }
    );
  }

  let body: ActionBody;
  try {
    body = readBody(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const actionRaw = typeof body.action === "string" ? body.action.trim() : "";
  if (!actionRaw || !isAction(actionRaw)) {
    return NextResponse.json(
      { error: `Invalid action. Expected one of: ${ACTIONS.join(", ")}.` },
      { status: 400 }
    );
  }

  const reasonRaw = typeof body.reason === "string" ? body.reason.trim() : undefined;

  ensureSeeded();

  // Verify the import exists before mutating, so we can return a clean 404.
  const exists = getAllImports().some((i) => i.id === id);
  if (!exists) {
    return NextResponse.json(
      { error: `Import '${id}' not found.` },
      { status: 404 }
    );
  }

  if (actionRaw === "publish") {
    const res = publishImport(id);
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: res.error ?? "Publish failed." },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true, occurrenceId: res.occurrenceId });
  }

  // actionRaw === "reject"
  const res = rejectImport(id, reasonRaw);
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: res.error ?? "Reject failed." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}
