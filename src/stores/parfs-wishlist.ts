"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * PARFS wishlist — saved fragrance slugs (so collection-only/placeholder scents can be saved too),
 * kept in the browser. `open` drives the header popover and isn't persisted.
 */
type ParfsWishlistState = {
  slugs: string[];
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Adds or removes a slug; returns true when it was added. */
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
};

export const useParfsWishlist = create<ParfsWishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      open: false,
      setOpen: (open) => set({ open }),
      toggle: (slug) => {
        const added = !get().slugs.includes(slug);
        set((s) => ({ slugs: added ? [slug, ...s.slugs] : s.slugs.filter((x) => x !== slug) }));
        return added;
      },
      remove: (slug) => set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
    }),
    { name: "parfs-wishlist", version: 1, partialize: (s) => ({ slugs: s.slugs }) },
  ),
);
