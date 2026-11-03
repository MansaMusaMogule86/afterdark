"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Instagram, RefreshCw, Check, X, AlertCircle, Clock, Calendar,
  Music2, MapPin, ExternalLink, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getVenue } from "@/lib/venue-data";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ENGLISH_NIGHT_HASHTAG, type ImportStatus } from "@/lib/english-nights";

interface ImportItem {
  id: string;
  mediaId: string;
  permalink: string;
  accountHandle: string;
  venue: string | null;
  caption: string;
  postedAt: string;
  mediaType: string;
  thumbnailUrl: string;
  parsed: {
    venue: string | null;
    title: string | null;
    date: string | null;
    doors: string | null;
    close: string | null;
    music: string[];
    djs: string[];
    entry: string | null;
    vip: string | null;
    guestList: string | null;
  };
  status: ImportStatus;
  statusReason: string;
  occurrenceId: string | null;
  sample: boolean;
  importedAt: string;
}

interface Stats {
  total: number;
  ready: number;
  needsReview: number;
  rejected: number;
  runs: number;
  lastImportAt: string | null;
}

type StatusTab = "all" | ImportStatus;

export function EnglishNightsAdminView() {
  const { toast } = useToast();
  const [imports, setImports] = useState<ImportItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<StatusTab>("all");
  const [running, setRunning] = useState(false);

  const load = useCallback(() => {
    fetch("/api/instagram/import")
      .then((r) => r.json())
      .then((d) => {
        setImports(d.imports || []);
        setStats(d.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runImport = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/instagram/import", { method: "POST" });
      const d = await res.json();
      toast({
        title: "Import complete",
        description: `${d.result.imported} new · ${d.result.updated} updated · ${d.result.skipped} skipped`,
      });
      load();
    } catch {
      toast({ title: "Import failed", variant: "destructive" });
    } finally {
      setRunning(false);
    }
  };

  const publish = async (id: string) => {
    track("submit_vip_inquiry", { import_id: id, action: "publish", source: "en_admin" });
    try {
      const res = await fetch(`/api/instagram/import/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const d = await res.json();
      if (d.ok) {
        toast({ title: "Published", description: `Occurrence ${d.occurrenceId}` });
        load();
      } else {
        toast({ title: "Cannot publish", description: d.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const reject = async (id: string) => {
    track("submit_vip_inquiry", { import_id: id, action: "reject", source: "en_admin" });
    try {
      const res = await fetch(`/api/instagram/import/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: "Manually rejected in admin review." }),
      });
      const d = await res.json();
      if (d.ok) {
        toast({ title: "Rejected" });
        load();
      } else {
        toast({ title: "Failed", description: d.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const filtered = imports.filter((i) => tab === "all" || i.status === tab);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/?view=english-nights"
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> English Nights
          </Link>
          <Button
            onClick={runImport}
            disabled={running}
            className="rounded-none bg-foreground px-5 text-background hover:bg-accent"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", running && "animate-spin")} />
            {running ? "Running…" : "Run Import"}
          </Button>
        </div>

        <div className="mt-8">
          <span className="eyebrow text-accent">Internal · Import Review</span>
          <h1 className="heading-editorial mt-3 text-4xl text-foreground md:text-5xl">
            English Night Imports
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Review Instagram posts tagged <code className="rounded bg-secondary px-1.5 py-0.5 text-accent">{ENGLISH_NIGHT_HASHTAG}</code>{" "}
            from the three approved venue accounts. Auto-publish only when venue, date, time, and event media are validated.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border/40 bg-border/40 md:grid-cols-5">
            <Stat label="Total" value={stats.total} />
            <Stat label="Ready" value={stats.ready} tone="ok" />
            <Stat label="Needs Review" value={stats.needsReview} tone="warn" />
            <Stat label="Rejected" value={stats.rejected} tone="bad" />
            <Stat label="Import Runs" value={stats.runs} />
          </div>
        )}

        {/* Last import */}
        {stats?.lastImportAt && (
          <p className="mt-3 font-mono-tight text-[0.625rem] uppercase tracking-[0.15em] text-muted-foreground">
            Last import: {new Date(stats.lastImportAt).toLocaleString()}
          </p>
        )}

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          <Tab active={tab === "all"} onClick={() => setTab("all")} label="All" count={imports.length} />
          <Tab active={tab === "READY_TO_PUBLISH"} onClick={() => setTab("READY_TO_PUBLISH")} label="Ready" count={imports.filter((i) => i.status === "READY_TO_PUBLISH").length} tone="ok" />
          <Tab active={tab === "NEEDS_REVIEW"} onClick={() => setTab("NEEDS_REVIEW")} label="Needs Review" count={imports.filter((i) => i.status === "NEEDS_REVIEW").length} tone="warn" />
          <Tab active={tab === "REJECTED"} onClick={() => setTab("REJECTED")} label="Rejected" count={imports.filter((i) => i.status === "REJECTED").length} tone="bad" />
        </div>

        {/* Imports list */}
        {loading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-sm bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-sm border border-dashed border-border/60 py-20 text-center">
            <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-serif-display text-xl text-foreground">No imports in this view</p>
            <p className="mt-2 text-sm text-muted-foreground">Run an import to fetch new posts.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {filtered.map((imp) => (
              <ImportRow key={imp.id} imp={imp} onPublish={publish} onReject={reject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImportRow({ imp, onPublish, onReject }: { imp: ImportItem; onPublish: (id: string) => void; onReject: (id: string) => void }) {
  const v = imp.venue ? getVenue(imp.venue as "avenue" | "ora" | "blacktape") : null;
  const statusConfig: Record<ImportStatus, { label: string; cls: string; icon: typeof Check }> = {
    READY_TO_PUBLISH: { label: "Ready to Publish", cls: "border-green-400/30 bg-green-400/10 text-green-300", icon: Check },
    NEEDS_REVIEW: { label: "Needs Review", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300", icon: AlertCircle },
    REJECTED: { label: "Rejected", cls: "border-red-400/30 bg-red-400/10 text-red-300", icon: X },
  };
  const sc = statusConfig[imp.status];
  const StatusIcon = sc.icon;

  return (
    <div data-venue={imp.venue || undefined} className="venue-surface grid gap-4 rounded-sm border border-[var(--venue-foreground)]/10 p-4 md:grid-cols-12 md:p-5">
      {/* Thumbnail */}
      <div className="md:col-span-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-sm">
          <AssetImage
            src={imp.thumbnailUrl}
            file={`event_${imp.venue}_english-night_${imp.parsed.date || "tba"}_portrait.webp`}
            purpose={`Instagram thumbnail for ${imp.parsed.title || "untitled English Night"}.`}
            crop="portrait"
            venue={(imp.venue as "avenue" | "ora" | "blacktape") || "global"}
            alt={imp.parsed.title || "English Night"}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Parsed data */}
      <div className="md:col-span-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-[var(--venue-accent)]">
            <Instagram className="h-3 w-3" /> {imp.accountHandle}
          </span>
          {v && (
            <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">
              · {v.shortName}
            </span>
          )}
        </div>
        <h3 className="mt-1 font-serif-display text-lg text-[var(--venue-foreground)]">
          {imp.parsed.title || <span className="text-[var(--venue-muted)]">Untitled — will auto-generate</span>}
        </h3>

        {/* Parsed fields grid */}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs md:grid-cols-3">
          <ParsedField icon={<Calendar className="h-3 w-3" />} label="Date" value={imp.parsed.date} />
          <ParsedField icon={<Clock className="h-3 w-3" />} label="Doors" value={imp.parsed.doors} />
          <ParsedField icon={<Clock className="h-3 w-3" />} label="Close" value={imp.parsed.close} />
          <ParsedField icon={<Music2 className="h-3 w-3" />} label="Music" value={imp.parsed.music.join(", ") || null} />
          <ParsedField icon={<Music2 className="h-3 w-3" />} label="DJs" value={imp.parsed.djs.join(", ") || null} />
          <ParsedField icon={<MapPin className="h-3 w-3" />} label="Entry" value={imp.parsed.entry} />
        </div>

        {/* Caption preview */}
        <details className="mt-3">
          <summary className="cursor-pointer font-mono-tight text-[0.5625rem] uppercase tracking-[0.15em] text-[var(--venue-muted)] hover:text-[var(--venue-foreground)]">
            View caption
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-sm bg-[var(--venue-bg)]/60 p-3 text-[0.6875rem] text-[var(--venue-foreground)]/80 whitespace-pre-wrap">
            {imp.caption}
          </pre>
        </details>
      </div>

      {/* Status + actions */}
      <div className="flex flex-col justify-between gap-3 md:col-span-4">
        <div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono-tight text-[0.5rem] uppercase tracking-[0.12em]", sc.cls)}>
            <StatusIcon className="h-3 w-3" /> {sc.label}
          </span>
          <p className="mt-2 text-xs text-[var(--venue-muted)]">{imp.statusReason}</p>
          {imp.occurrenceId && (
            <a
              href={`/?view=english-night&venue=${imp.venue}&date=${imp.parsed.date}`}
              className="mt-2 inline-flex items-center gap-1 font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-accent)] hover:text-[var(--venue-foreground)]"
            >
              View event <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a
            href={imp.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)] hover:text-[var(--venue-foreground)]"
          >
            Media ID: {imp.mediaId}
          </a>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {imp.status !== "READY_TO_PUBLISH" && imp.status !== "REJECTED" && (
            <Button
              onClick={() => onPublish(imp.id)}
              size="sm"
              className="flex-1 rounded-none bg-[var(--venue-accent)] text-[var(--venue-bg)] hover:opacity-90"
            >
              <Check className="mr-1 h-3 w-3" /> Publish
            </Button>
          )}
          {imp.status !== "REJECTED" && (
            <Button
              onClick={() => onReject(imp.id)}
              size="sm"
              variant="outline"
              className="rounded-none border-[var(--venue-foreground)]/20 text-[var(--venue-foreground)]"
            >
              <X className="mr-1 h-3 w-3" /> Reject
            </Button>
          )}
          {imp.status === "REJECTED" && (
            <span className="flex-1 text-center font-mono-tight text-[0.5625rem] uppercase tracking-[0.12em] text-[var(--venue-muted)]">
              No actions
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ParsedField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="mt-0.5 text-[var(--venue-muted)]">{icon}</span>
      <div className="min-w-0">
        <p className="font-mono-tight text-[0.5rem] uppercase tracking-[0.15em] text-[var(--venue-muted)]">{label}</p>
        <p className={cn("truncate", value ? "text-[var(--venue-foreground)]" : "text-red-400/70 italic")}>
          {value || "missing"}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" | "bad" }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-1 font-serif-display text-2xl tnum",
        tone === "ok" && "text-green-400",
        tone === "warn" && "text-amber-400",
        tone === "bad" && "text-red-400",
        !tone && "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}

function Tab({ active, onClick, label, count, tone }: { active: boolean; onClick: () => void; label: string; count: number; tone?: "ok" | "warn" | "bad" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono-tight text-[0.625rem] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
      )}
    >
      {label}
      <span className={cn(
        "rounded-full px-1.5 text-[0.5rem]",
        tone === "ok" && "bg-green-400/20 text-green-300",
        tone === "warn" && "bg-amber-400/20 text-amber-300",
        tone === "bad" && "bg-red-400/20 text-red-300",
        !tone && "bg-background/20",
        active && !tone && "bg-background/20 text-background"
      )}>
        {count}
      </span>
    </button>
  );
}
