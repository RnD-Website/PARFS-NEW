"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/icons/icon";
import { useUI } from "@/stores/ui";
import { useWishlist } from "@/stores/wishlist";
import { useSession } from "@/stores/session";
import { useHydrated } from "@/lib/hooks/use-hydrated";

/** Mobile-only bottom navigation (< md). Replaces the floating Ask AI pill on phones. */
export function BottomTabBar() {
  const pathname = usePathname();
  const openAssistant = useUI((s) => s.openAssistant);
  const hydrated = useHydrated();
  const wish = useWishlist((s) => s.ids.length);
  const user = useSession((s) => s.user);

  if (pathname.startsWith("/checkout")) return null;

  const tabs: { label: string; href: string; icon: IconName; match: (p: string) => boolean; badge?: number }[] = [
    { label: "Home", href: "/", icon: "home", match: (p) => p === "/" },
    { label: "Shop", href: "/shop", icon: "grid", match: (p) => p.startsWith("/shop") || p.startsWith("/products") || p.startsWith("/categories") },
    { label: "Wishlist", href: "/wishlist", icon: "heart", match: (p) => p.startsWith("/wishlist"), badge: hydrated ? wish : 0 },
    { label: "Account", href: user ? "/account" : "/account/login", icon: "user", match: (p) => p.startsWith("/account") },
  ];

  const item = "flex flex-1 flex-col items-center justify-center gap-1 pt-2 pb-1 text-[11px] font-semibold";

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {tabs.slice(0, 2).map((t) => (
          <li key={t.label} className="flex flex-1">
            <Link href={t.href} aria-current={t.match(pathname) ? "page" : undefined} className={cn(item, t.match(pathname) ? "text-ink" : "text-ink-muted")}>
              <Icon name={t.icon} size={22} />
              {t.label}
            </Link>
          </li>
        ))}
        <li className="flex flex-1">
          <button type="button" onClick={() => openAssistant()} className={cn(item, "text-violet")} aria-label="Ask GASENOS AI">
            <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-violet text-white shadow-[0_8px_16px_rgba(107,78,255,0.35)]">
              <Icon name="sparkles" size={22} />
            </span>
            Ask AI
          </button>
        </li>
        {tabs.slice(2).map((t) => (
          <li key={t.label} className="flex flex-1">
            <Link href={t.href} aria-current={t.match(pathname) ? "page" : undefined} className={cn(item, "relative", t.match(pathname) ? "text-ink" : "text-ink-muted")}>
              <span className="relative">
                <Icon name={t.icon} size={22} />
                {!!t.badge && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] text-ink">
                    {t.badge}
                  </span>
                )}
              </span>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
