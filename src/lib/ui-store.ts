"use client";

import { create } from "zustand";

export type View = "home" | "asset-manifest" | "guide";

export interface ConciergePreset {
  venue?: string;
  eventOrDate?: string;
  eventId?: string;
  eventDate?: string;
  occasion?: string;
  /** Source page that opened the concierge (for attribution). */
  source?: string;
}

interface UiState {
  /** Venue detail drawer (slug or null). */
  venueDrawer: string | null;
  /** Event detail drawer (id or null). */
  eventDrawer: string | null;
  /** Legacy VIP booking modal (being replaced by concierge). */
  bookingOpen: boolean;
  bookingPreset: ConciergePreset | null;
  /** Mobile menu sheet open. */
  mobileMenuOpen: boolean;
  /** Active venue theme for hero (avenue | ora | blacktape). */
  heroVenue: "avenue" | "ora" | "blacktape";
  /** Night Concierge bottom sheet. */
  conciergeOpen: boolean;
  conciergePreset: ConciergePreset | null;

  openVenueDrawer: (slug: string) => void;
  closeVenueDrawer: () => void;
  openEventDrawer: (id: string) => void;
  closeEventDrawer: () => void;
  openBooking: (preset?: ConciergePreset) => void;
  closeBooking: () => void;
  setMobileMenu: (open: boolean) => void;
  setHeroVenue: (v: "avenue" | "ora" | "blacktape") => void;
  openConcierge: (preset?: ConciergePreset) => void;
  closeConcierge: () => void;
}

export const useUi = create<UiState>((set) => ({
  venueDrawer: null,
  eventDrawer: null,
  bookingOpen: false,
  bookingPreset: null,
  mobileMenuOpen: false,
  heroVenue: "avenue",
  conciergeOpen: false,
  conciergePreset: null,
  openVenueDrawer: (slug) => set({ venueDrawer: slug, eventDrawer: null, mobileMenuOpen: false }),
  closeVenueDrawer: () => set({ venueDrawer: null }),
  openEventDrawer: (id) => set({ eventDrawer: id, venueDrawer: null, mobileMenuOpen: false }),
  closeEventDrawer: () => set({ eventDrawer: null }),
  openBooking: (preset) => set({ bookingOpen: true, bookingPreset: preset ?? null, mobileMenuOpen: false }),
  closeBooking: () => set({ bookingOpen: false, bookingPreset: null }),
  setMobileMenu: (open) => set({ mobileMenuOpen: open }),
  setHeroVenue: (v) => set({ heroVenue: v }),
  openConcierge: (preset) => set({ conciergeOpen: true, conciergePreset: preset ?? null, mobileMenuOpen: false }),
  closeConcierge: () => set({ conciergeOpen: false }),
}));
