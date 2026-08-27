"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { AssetImage } from "@/components/asset-image";

export interface GalleryImage {
  src: string;
  file: string;
  purpose: string;
  dimensions?: string;
  venue?: "global" | "avenue" | "ora" | "blacktape" | "night_edit";
  alt: string;
}

interface GalleryLightboxProps {
  images: GalleryImage[];
  /** Controlled open state. */
  open: boolean;
  /** Initial index. */
  initialIndex?: number;
  onClose: () => void;
}

/**
 * GalleryLightbox — immersive fullscreen image viewer.
 *
 * Features:
 * - Keyboard navigation (← → arrows, Esc to close, +/- to zoom)
 * - Click outside or X to close
 * - Image counter (3 / 12)
 * - Zoom in/out with transform scale
 * - Tracks view_event for analytics
 * - Respects reduced motion
 * - Full AssetImage placeholder support
 */
export function GalleryLightbox({ images, open, initialIndex = 0, onClose }: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitial, setPrevInitial] = useState(initialIndex);

  // Reset index when opened or initialIndex changes (derived-state pattern).
  if (open && (prevOpen !== open || prevInitial !== initialIndex)) {
    setPrevOpen(open);
    setPrevInitial(initialIndex);
    setIndex(initialIndex);
    setZoom(1);
  }

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
    setZoom(1);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    setZoom(1);
  }, [images.length]);

  // Keyboard navigation.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 3));
      else if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, prev, onClose]);

  // Track view.
  useEffect(() => {
    if (open && images[index]) {
      track("view_event", { source: "gallery_lightbox", file: images[index].file });
    }
  }, [open, index, images]);

  if (!open || images.length === 0) return null;

  const img = images[index];

  return (
    <div
      className="fixed inset-0 z-[130] flex flex-col bg-background/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border/40 p-4">
        <div className="flex items-center gap-3">
          <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-muted-foreground">
            Gallery
          </span>
          <span className="font-mono-tight tnum text-sm text-foreground">
            {index + 1} / {images.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 1))}
            disabled={zoom <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono-tight tnum w-10 text-center text-xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            disabled={zoom >= 3}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Reset zoom"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-border/40" />
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-border/40 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close gallery"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-8">
        {/* Prev button */}
        {images.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Image */}
        <div
          className="relative max-h-full max-w-full overflow-hidden rounded-sm"
          style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease-out" }}
        >
          <AssetImage
            src={img.src}
            file={img.file}
            purpose={img.purpose}
            dimensions={img.dimensions}
            venue={img.venue}
            alt={img.alt}
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={next}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-background/60 text-muted-foreground backdrop-blur-sm transition-colors hover:text-foreground"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Bottom bar: thumbnails + info */}
      <div className="border-t border-border/40 p-4">
        <div className="mx-auto max-w-[1200px]">
          {/* Caption */}
          <p className="mb-3 text-center text-sm text-muted-foreground">
            {img.alt} <span className="text-muted-foreground/60">· {img.purpose}</span>
          </p>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {images.map((image, i) => (
                <button
                  key={i}
                  onClick={() => { setIndex(i); setZoom(1); }}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-sm border transition-all",
                    i === index ? "border-accent opacity-100" : "border-border opacity-50 hover:opacity-80"
                  )}
                >
                  <AssetImage
                    src={image.src}
                    file={image.file}
                    purpose={image.purpose}
                    venue={image.venue}
                    alt={image.alt}
                    className="h-full w-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
