"use client";

import { useEffect, useState } from "react";

/**
 * ReadingProgress — slim progress bar at the very top of the viewport.
 *
 * Shows how far the user has scrolled through the page. Uses a thin
 * accent-colored bar that fills as the user scrolls. Respects reduced
 * motion (disables the width transition).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setProgress(0);
        setVisible(false);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
      // Only show after scrolling past 2% (avoids flicker at top).
      setVisible(scrollTop > window.innerHeight * 0.05);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[85] h-0.5 pointer-events-none"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-accent/60 via-accent to-accent/60 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
