"use client";

import { create } from "zustand";

/** Small PARFS UI state shared between the header, menu and drawers. */
type ParfsUIState = {
  accountOpen: boolean;
  setAccountOpen: (open: boolean) => void;
};

export const useParfsUI = create<ParfsUIState>()((set) => ({
  accountOpen: false,
  setAccountOpen: (accountOpen) => set({ accountOpen }),
}));
