"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  /** True once the list was merged with the signed-in account. */
  syncedUserId: string | null;
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
  setAll: (ids: string[], userId: string | null) => void;
  remove: (productId: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      syncedUserId: null,
      has: (id) => get().ids.includes(id),
      toggle: (id) => {
        const added = !get().ids.includes(id);
        set((s) => ({ ids: added ? [id, ...s.ids] : s.ids.filter((x) => x !== id) }));
        if (get().syncedUserId) {
          // Fire-and-forget server sync for signed-in customers.
          fetch("/api/wishlist", {
            method: added ? "POST" : "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ productId: id }),
          }).catch(() => {});
        }
        return added;
      },
      remove: (id) => {
        set((s) => ({ ids: s.ids.filter((x) => x !== id) }));
        if (get().syncedUserId) {
          fetch("/api/wishlist", {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ productId: id }),
          }).catch(() => {});
        }
      },
      setAll: (ids, userId) => set({ ids, syncedUserId: userId }),
    }),
    { name: "gasenos-wishlist", version: 1 },
  ),
);
