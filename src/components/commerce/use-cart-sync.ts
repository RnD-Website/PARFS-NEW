"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/stores/cart";

/** Refreshes cart prices & stock from the server once per mount. */
export function useCartSync() {
  const lines = useCart((s) => s.lines);
  const sync = useCart((s) => s.sync);
  const [state, setState] = useState<{ syncing: boolean; removed: number; adjusted: boolean }>({ syncing: true, removed: 0, adjusted: false });
  const done = useRef(false);

  const run = useCallback(() => {
    const current = useCart.getState().lines;
    if (!current.length) {
      setState({ syncing: false, removed: 0, adjusted: false });
      return;
    }
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lines: current.map((l) => ({ variantId: l.id, quantity: l.quantity })) }),
    })
      .then((r) => r.json())
      .then((d: { lines: { variantId: string; unitPrice: number; compareAtPrice: number | null; stock: number; adjusted: boolean }[]; removed: string[] }) => {
        const changedPrice = d.lines.some((f) => current.find((c) => c.id === f.variantId)?.unitPrice !== f.unitPrice);
        sync(d.lines.map((f) => ({ id: f.variantId, unitPrice: f.unitPrice, compareAtPrice: f.compareAtPrice, maxQuantity: f.stock })));
        setState({ syncing: false, removed: d.removed.length, adjusted: changedPrice || d.lines.some((l) => l.adjusted) });
      })
      .catch(() => setState((s) => ({ ...s, syncing: false })));
  }, [sync]);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    run();
  }, [run]);

  return { ...state, lines, resync: run };
}
