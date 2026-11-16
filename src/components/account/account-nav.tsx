"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/icons/icon";
import { useSession } from "@/stores/session";

const items: { label: string; href: string; icon: IconName }[] = [
  { label: "Overview", href: "/account", icon: "dashboard" },
  { label: "Orders", href: "/account/orders", icon: "package" },
  { label: "Addresses", href: "/account/addresses", icon: "location" },
  { label: "Profile & security", href: "/account/profile", icon: "user" },
  { label: "Wishlist", href: "/wishlist", icon: "heart" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const setUser = useSession((s) => s.setUser);
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    setUser(null);
    router.replace("/");
    router.refresh();
  };
  return (
    <nav aria-label="Account" className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex gap-2 lg:flex-col lg:gap-1">
        {items.map((i) => {
          const active = i.href === "/account" ? pathname === "/account" : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-body-sm font-semibold whitespace-nowrap transition-colors lg:rounded-xl",
                  active ? "bg-ink text-white" : "bg-card hover:bg-muted lg:bg-transparent",
                )}
              >
                <Icon name={i.icon} size={18} /> {i.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={logout}
            disabled={busy}
            className="flex items-center gap-3 rounded-full bg-card px-4 py-2.5 text-body-sm font-semibold whitespace-nowrap text-ink-muted transition-colors hover:text-danger lg:w-full lg:rounded-xl lg:bg-transparent"
          >
            <Icon name="logout" size={18} /> {busy ? "Signing out…" : "Sign out"}
          </button>
        </li>
      </ul>
    </nav>
  );
}
