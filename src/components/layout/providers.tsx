"use client";

import { useEffect } from "react";
import { useSession } from "@/stores/session";
import { useWishlist } from "@/stores/wishlist";

/**
 * Client bootstrapping: loads the session once and merges the local (guest) wishlist into
 * the customer's account wishlist after sign-in.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const user = useSession((s) => s.user);
  const loaded = useSession((s) => s.loaded);
  const refresh = useSession((s) => s.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loaded) return;
    const { ids, syncedUserId, setAll } = useWishlist.getState();
    if (!user) {
      if (syncedUserId) setAll([], null); // signed out: don't keep the account's list on this device
      return;
    }
    if (syncedUserId === user.id) return;
    fetch("/api/wishlist", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: ids }),
    })
      .then((r) => r.json())
      .then((d: { productIds: string[] }) => setAll(d.productIds, user.id))
      .catch(() => {});
  }, [user, loaded]);

  return <>{children}</>;
}
