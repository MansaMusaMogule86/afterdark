"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { assetManifest, getMissingAssetCount, type AssetManifestEntry } from "@/lib/asset-manifest";
import { siteConfig } from "@/lib/site-config";

export function AssetManifestView() {
  const [filter, setFilter] = useState<string>("all");
  const [present, setPresent] = useState<"all" | "missing" | "present">("all");

  const venues = ["all", "global", "avenue", "ora", "blacktape", "night_edit"];
  const total = assetManifest.length;
  const missing = getMissingAssetCount();

  const filtered = assetManifest.filter((a) => {
    if (filter !== "all" && a.venue !== filter) return false;
    if (present === "missing" && a.present) return false;
    if (present === "present" && !a.present) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow text-accent">Internal · Asset Manifest</span>
            <h1 className="heading-editorial mt-2 text-3xl md:text-4xl">Required Assets</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every missing image renders a designed placeholder. ASSET_STRICT_MODE is{" "}
              <code className={cn("rounded px-1.5 py-0.5", siteConfig.assetStrictMode ? "bg-red-500/15 text-red-300" : "bg-secondary text-muted-foreground")}>
                {siteConfig.assetStrictMode ? "true" : "false"}
              </code>
              . In production validation, required hero and logo assets must fail the launch check.
            </p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to site
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40">
          <Stat label="Total assets" value={total} />
          <Stat label="Missing" value={missing} tone="warn" />
          <Stat label="Present" value={total - missing} tone="ok" />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {venues.map((vv) => (
              <button
                key={vv}
                onClick={() => setFilter(vv)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
                  filter === vv ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {vv === "all" ? "All" : vv}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1.5">
            {(["all", "missing", "present"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPresent(p)}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
                  present === p ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-sm border border-border/40">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/40 bg-secondary/40">
              <tr>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">File</th>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">Venue</th>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">Purpose</th>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">Dimensions</th>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">Crop</th>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">Usage</th>
                <th className="p-3 font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <Row key={a.id} a={a} />
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-mono-tight text-[0.625rem] text-muted-foreground">
          This page is excluded from search indexing and the sitemap. Do not link to it from public navigation.
        </p>
      </div>
    </div>
  );
}

function Row({ a }: { a: AssetManifestEntry }) {
  return (
    <tr className="border-b border-border/30 last:border-0">
      <td className="p-3">
        <code className="break-all text-xs text-foreground">{a.file}</code>
        <div className="mt-1 text-[0.625rem] text-muted-foreground">{a.path}</div>
      </td>
      <td className="p-3">
        <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-accent">{a.venue}</span>
      </td>
      <td className="p-3 max-w-xs">
        <p className="line-clamp-2 text-xs text-muted-foreground">{a.purpose}</p>
      </td>
      <td className="p-3">
        <span className="font-mono-tight text-xs text-muted-foreground">{a.dimensions}</span>
      </td>
      <td className="p-3">
        <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-muted-foreground">{a.crop}</span>
      </td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {a.pageUsage.map((u) => (
            <span key={u} className="rounded-sm border border-border/60 px-1.5 py-0.5 font-mono-tight text-[0.5rem] text-muted-foreground">{u}</span>
          ))}
        </div>
      </td>
      <td className="p-3">
        {a.present ? (
          <span className="inline-flex items-center gap-1 text-green-400">
            <Check className="h-3.5 w-3.5" /> Present
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-400">
            <X className="h-3.5 w-3.5" /> Missing
          </span>
        )}
      </td>
    </tr>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" | "ok" }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-1 font-serif-display text-3xl tnum",
        tone === "warn" && "text-amber-400",
        tone === "ok" && "text-green-400",
        !tone && "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}
