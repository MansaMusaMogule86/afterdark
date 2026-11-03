"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VenueVideoProps {
  src: string;
  poster?: string;
  className?: string;
  allowSound?: boolean;
  showPlayPause?: boolean;
  alt?: string;
  autoPlay?: boolean;
  loop?: boolean;
  /** Show the "Reel" badge (top-left). */
  showBadge?: boolean;
  /** Render the built-in bottom gradient overlay. */
  overlay?: boolean;
  /** Positioning classes for the floating controls. */
  controlsClassName?: string;
  /** Rendered instead of the video if it fails to load. */
  fallback?: React.ReactNode;
}

export function VenueVideo({
  src,
  poster,
  className,
  allowSound = true,
  showPlayPause = false,
  alt = "Venue video reel",
  autoPlay = true,
  loop = true,
  showBadge = true,
  overlay = true,
  controlsClassName = "bottom-3 right-3",
  fallback,
}: VenueVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Safe autoplay that catches browser policy rejections
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoPlay) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with sound or battery saver might be blocked; fallback to muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => setIsPlaying(false));
          });
      }
    }
  }, [src, autoPlay, isMuted]);

  // Pause when scrolled out of view to save mobile performance & battery
  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            if (!video.paused) {
              video.pause();
              setIsPlaying(false);
            }
          } else {
            if (autoPlay && video.paused) {
              video.play().catch(() => {});
              setIsPlaying(true);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlay]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!isPlaying) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  if (hasError && fallback) return <>{fallback}</>;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden bg-black", className)}
      aria-label={alt}
    >
      {!hasError && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={isMuted}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Ambient overlay gradient for typography readability */}
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      )}

      {/* Floating video controls */}
      <div className={cn("absolute z-20 flex items-center gap-1.5", controlsClassName)}>
        {showPlayPause && (
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/90 backdrop-blur-md transition-colors hover:bg-black/90 hover:text-white"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
          </button>
        )}

        {allowSound && (
          <button
            type="button"
            onClick={toggleSound}
            className={cn(
              "flex h-7 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.625rem] font-mono-tight uppercase tracking-wider backdrop-blur-md transition-colors",
              isMuted
                ? "border-white/20 bg-black/60 text-white/80 hover:bg-black/80 hover:text-white"
                : "border-red-500/50 bg-red-950/70 text-red-200 hover:bg-red-900/80"
            )}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3 w-3" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3 w-3 text-red-400" />
                <span>Live Audio</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Live Reel Badge */}
      {showBadge && (
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-red-500/30 bg-black/70 px-2 py-0.5 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          <span className="font-mono-tight text-[0.5625rem] uppercase tracking-[0.18em] text-red-300">
            Reel
          </span>
        </div>
      )}
    </div>
  );
}
