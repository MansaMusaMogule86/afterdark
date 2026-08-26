"use client";

import { create } from "zustand";

export type View = "home" | "asset-manifest" | "guide";

interface UiState {
  /** Venue detail drawer (slug or null). */
  venueDrawer: string | null;
  /** Event detail drawer (id or null). */
  eventDrawer: string | null;
  /** VIP booking modal open + prefilled venue/event. */
  bookingOpen: boolean;
  bookingPreset: { venue?: string; eventOrDate?: string } | null;
  /** Mobile menu sheet open. */
  mobileMenuOpen: boolean;
  /** Active venue theme for hero (avenue | ora | blacktape). */
  heroVenue: "avenue" | "ora" | "blacktape";

  openVenueDrawer: (slug: string) => void;
  closeVenueDrawer: () => void;
  openEventDrawer: (id: string) => void;
  closeEventDrawer: () => void;
  openBooking: (preset?: { venue?: string; eventOrDate?: string }) => void;
  closeBooking: () => void;
  setMobileMenu: (open: boolean) => void;
  setHeroVenue: (v: "avenue" | "ora" | "blacktape") => void;
}

export const useUi = create<UiState>((set) => ({
  venueDrawer: null,
  eventDrawer: null,
  bookingOpen: false,
  bookingPreset: null,
  mobileMenuOpen: false,
  heroVenue: "avenue",
  openVenueDrawer: (slug) => set({ venueDrawer: slug, eventDrawer: null, mobileMenuOpen: false }),
  closeVenueDrawer: () => set({ venueDrawer: null }),
  openEventDrawer: (id) => set({ eventDrawer: id, venueDrawer: null, mobileMenuOpen: false }),
  closeEventDrawer: () => set({ eventDrawer: null }),
  openBooking: (preset) => set({ bookingOpen: true, bookingPreset: preset ?? null, mobileMenuOpen: false }),
  closeBooking: () => set({ bookingOpen: false, bookingPreset: null }),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setHeroVenue: (v) => set({ heroVenue: v }),
}));
