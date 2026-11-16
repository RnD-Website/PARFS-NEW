"use client";

import { useSyncExternalStore } from "react";

/** True only after hydration — use before rendering values that come from localStorage. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
