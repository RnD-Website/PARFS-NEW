"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  /** variantId — the unit we actually sell. */
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Human-readable selected options, e.g. "Volt Orange / 42". */
  variantTitle: string | null;
  unitPrice: number;
  compareAtPrice: number | null;
  currency: string;
  quantity: number;
  maxQuantity: number;
};

type CartState = {
  lines: CartLine[];
  /** Special instructions typed in the cart drawer; prefills the checkout's order notes. */
  note: string;
  setNote: (note: string) => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Replace prices/stock with fresh server values (called by the cart page and checkout). */
  sync: (fresh: { id: string; unitPrice: number; compareAtPrice: number | null; maxQuantity: number }[]) => void;
};

export { MAX_PER_LINE } from "./cart-constants";
import { MAX_PER_LINE } from "./cart-constants";

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      note: "",
      setNote: (note) => set({ note }),
      add: (line, quantity = 1) =>
        set((s) => {
          const cap = Math.min(MAX_PER_LINE, line.maxQuantity);
          const existing = s.lines.find((l) => l.id === line.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.id === line.id ? { ...l, ...line, quantity: Math.min(cap, l.quantity + quantity) } : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, quantity: Math.min(cap, quantity) }] };
        }),
      setQuantity: (id, quantity) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.id === id ? { ...l, quantity: Math.max(0, Math.min(Math.min(MAX_PER_LINE, l.maxQuantity), quantity)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [], note: "" }),
      sync: (fresh) =>
        set((s) => ({
          lines: s.lines
            .map((l) => {
              const f = fresh.find((x) => x.id === l.id);
              if (!f) return { ...l, quantity: 0 };
              return {
                ...l,
                unitPrice: f.unitPrice,
                compareAtPrice: f.compareAtPrice,
                maxQuantity: f.maxQuantity,
                quantity: Math.min(l.quantity, Math.min(MAX_PER_LINE, f.maxQuantity)),
              };
            })
            .filter((l) => l.quantity > 0),
        })),
    }),
    { name: "gasenos-cart", version: 1 },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
