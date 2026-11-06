"use client";

import { AssetImage } from "@/components/asset-image";
import { VenueVideo } from "@/components/venue-video";
import type { VenueRecord } from "@/lib/types";

interface VenueHeroMediaProps {
  venue: VenueRecord;
  alt: string;
  purpose: string;
  className?: string;
  /** Show the mute / unmute control. */
  allowSound?: boolean;
  /** Show the "Reel" badge. */
  showBadge?: boolean;
  /** Positioning classes for the floating video controls. */
  controlsClassName?: string;
}

/** A hero video is used only when it is real venue media, not a placeholder path. */
export function hasRealHeroVideo(venue: VenueRecord): boolean {
  return Boolean(venue.heroVideo && !venue.heroVideo.startsWith("/placeholders/"));
}

/**
 * VenueHeroMedia — renders the venue hero video when real footage exists,
 * otherwise the hero image (with the designed placeholder fallback).
 * The video fills its container with object-cover, so it fits every
 * aspect ratio the parent sets (mobile, tablet, desktop).
 */
export function VenueHeroMedia({
  venue: v,
  alt,
  purpose,
  className,
  allowSound = false,
  showBadge = false,
  controlsClassName,
}: VenueHeroMediaProps) {
  const image = (
    <AssetImage
      src={v.heroDesktop}
      file={`${v.slug}_hero_desktop.webp`}
      purpose={purpose}
      dimensions="2400 × 1350"
      crop="desktop"
      venue={v.slug}
      alt={alt}
      className={className}
    />
  );

  if (!hasRealHeroVideo(v)) return image;

  return (
    <VenueVideo
      key={v.heroVideo}
      src={v.heroVideo!}
      poster={v.heroDesktop}
      alt={alt}
      className={className}
      allowSound={allowSound}
      showBadge={showBadge}
      overlay={false}
      controlsClassName={controlsClassName}
      fallback={image}
    />
  );
}

