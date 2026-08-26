"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AssetImageProps {
  /** Attempted image path. */
  src: string;
  /** Exact file name shown on the placeholder. */
  file: string;
  /** What the real image must show. */
  purpose: string;
  /** Recommended size, e.g. "2400 × 1350". */
  dimensions?: string;
  /** Crop hint. */
  crop?: "desktop" | "mobile" | "portrait" | "square" | "wide" | "svg";
  /** Venue scope for theme. */
  venue?: "global" | "avenue" | "ora" | "blacktape" | "night_edit";
  /** Alt text for accessibility. */
  alt: string;
  className?: string;
  /** When true, render as a square-ish label block (for logos / svgs). */
  variant?: "media" | "logo";
}

/**
 * AssetImage — designed placeholder system.
 *
 * Per directive: every missing image must display a DESIGNED placeholder
 * (never a broken image icon). The placeholder visibly shows:
 *   MISSING ASSET
 *   FILE: exact_file_name
 *   PURPOSE: what the real image must show
 *   RECOMMENDED SIZE: width by height
 *   CROP: desktop, mobile, portrait, square, or wide
 *
 * Attempts to load the real src; on error falls back to the placeholder.
 * In development (ASSET_STRICT_MODE = false), placeholders render by default.
 */
export function AssetImage({
  src,
  file,
  purpose,
  dimensions,
  crop,
  venue = "global",
  alt,
  className,
  variant = "media",
}: AssetImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Reset when src changes (derived-state pattern — avoids setState-in-effect).
  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoaded(false);
    setFailed(false);
  }

  return (
    <div
      data-venue={venue}
      className={cn(
        "relative overflow-hidden bg-[var(--venue-surface)]",
        variant === "logo" && "flex items-center justify-center",
        className
      )}
    >
      {/* The real image attempt (hidden until loaded) */}
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Designed placeholder — shown until real asset loads */}
      {(!loaded || failed) && (
        <PlaceholderOverlay
          file={file}
          purpose={purpose}
          dimensions={dimensions}
          crop={crop}
          variant={variant}
        />
      )}
    </div>
  );
}

function PlaceholderOverlay({
  file,
  purpose,
  dimensions,
  crop,
  variant,
}: {
  file: string;
  purpose: string;
  dimensions?: string;
  crop?: string;
  variant: "media" | "logo";
}) {
  if (variant === "logo") {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-[var(--venue-surface)] p-3 text-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage:
            "linear-gradient(45deg, var(--venue-foreground) 25%, transparent 25%, transparent 75%, var(--venue-foreground) 75%), linear-gradient(45deg, var(--venue-foreground) 25%, transparent 25%, transparent 75%, var(--venue-foreground) 75%)",
          backgroundSize: "12px 12px",
          backgroundPosition: "0 0, 6px 6px",
        }} />
        <span className="eyebrow relative text-[0.5rem] text-[var(--venue-muted)]">
          Logo Placeholder
        </span>
        <span className="relative mt-1 font-mono-tight text-[0.625rem] text-[var(--venue-foreground)]/70">
          {file}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-[var(--venue-surface)] p-3">
      {/* Diagonal hatch pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--venue-foreground) 0, var(--venue-foreground) 1px, transparent 1px, transparent 14px)",
        }}
      />
      {/* Corner brackets — editorial */}
      <Bracket position="tl" />
      <Bracket position="tr" />
      <Bracket position="bl" />
      <Bracket position="br" />

      <div className="relative flex items-start justify-between">
        <span className="eyebrow text-[0.5rem] text-[var(--venue-accent)]">
          Missing Asset
        </span>
        {crop && (
          <span className="font-mono-tight text-[0.5rem] uppercase text-[var(--venue-muted)]">
            {crop}
          </span>
        )}
      </div>

      <div className="relative space-y-1">
        <p className="font-mono-tight break-all text-[0.625rem] leading-tight text-[var(--venue-foreground)]">
          {file}
        </p>
        <p className="line-clamp-2 text-[0.625rem] leading-tight text-[var(--venue-muted)]">
          {purpose}
        </p>
        {dimensions && (
          <p className="font-mono-tight text-[0.5rem] text-[var(--venue-muted)]">
            {dimensions}
          </p>
        )}
      </div>
    </div>
  );
}

function Bracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "top-2 left-2 border-t border-l",
    tr: "top-2 right-2 border-t border-r",
    bl: "bottom-2 left-2 border-b border-l",
    br: "bottom-2 right-2 border-b border-r",
  }[position];
  return (
    <span
      className={cn(
        "pointer-events-none absolute h-3 w-3 border-[var(--venue-accent)]/40",
        pos
      )}
      aria-hidden
    />
  );
}
