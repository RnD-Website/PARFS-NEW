"use client";

import { create } from "zustand";

export type ClientUser = { id: string; name: string; email: string; phone: string | null };

type SessionState = {
  user: ClientUser | null;
  loaded: boolean;
  setUser: (u: ClientUser | null) => void;
  refresh: () => Promise<void>;
};

export const useSession = create<SessionState>()((set) => ({
  user: null,
  loaded: false,
  setUser: (user) => set({ user, loaded: true }),
  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as { user: ClientUser | null };
      set({ user: data.user, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
