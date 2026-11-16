"use client";

import { create } from "zustand";

type Toast = { id: number; title: string; description?: string; tone?: "default" | "success" | "error"; action?: { label: string; href: string } };

type UIState = {
  cartOpen: boolean;
  navOpen: boolean;
  searchOpen: boolean;
  assistantOpen: boolean;
  /** Prompt to send as soon as the assistant opens (from chips / search bars). */
  assistantPrompt: string | null;
  toasts: Toast[];
  setCartOpen: (v: boolean) => void;
  setNavOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  openAssistant: (prompt?: string) => void;
  closeAssistant: () => void;
  consumeAssistantPrompt: () => string | null;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useUI = create<UIState>()((set, get) => ({
  cartOpen: false,
  navOpen: false,
  searchOpen: false,
  assistantOpen: false,
  assistantPrompt: null,
  toasts: [],
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setNavOpen: (navOpen) => set({ navOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  openAssistant: (prompt) => set({ assistantOpen: true, assistantPrompt: prompt ?? null, navOpen: false, searchOpen: false }),
  closeAssistant: () => set({ assistantOpen: false }),
  consumeAssistantPrompt: () => {
    const p = get().assistantPrompt;
    set({ assistantPrompt: null });
    return p;
  },
  toast: (t) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 4000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
