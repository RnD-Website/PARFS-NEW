"use client";

import { useEffect } from "react";

const KEY = "gasenos-recent";

/** Remembers the last viewed products on this device (used on the cart page). */
export function RecentlyViewedTracker({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
      localStorage.setItem(KEY, JSON.stringify([productId, ...list.filter((x) => x !== productId)].slice(0, 12)));
    } catch {}
  }, [productId]);
  return null;
}

export function readRecentlyViewed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
