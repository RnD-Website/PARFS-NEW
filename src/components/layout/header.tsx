"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { mainNav } from "@/content/site";
import { Logo } from "./logo";
import { IconButton, IconLink } from "@/components/ui/icon-button";
import { AISearchBar } from "@/components/ai/ai-search-bar";
import { useCart, cartCount } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { useUI } from "@/stores/ui";
import { useSession } from "@/stores/session";
import { useHydrated } from "@/lib/hooks/use-hydrated";

/**
 * Site header (Figma "Header").
 * Home page: sits on the orange hero (white logo/nav). Elsewhere: cream background.
 * < lg: hamburger + logo + search + cart; nav lives in the drawer.
 */
export function Header() {
  const pathname = usePathname();
  const onOrange = pathname === "/";
  const hydrated = useHydrated();
  const count = useCart((s) => cartCount(s.lines));
  const wishCount = useWishlist((s) => s.ids.length);
  const user = useSession((s) => s.user);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setNavOpen = useUI((s) => s.setNavOpen);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow] duration-300",
        onOrange ? "bg-orange text-white" : "bg-cream text-ink",
        scrolled && (onOrange ? "shadow-[0_8px_24px_rgba(28,26,23,0.12)]" : "shadow-[0_1px_0_var(--line-default)]"),
      )}
    >
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-4 lg:py-[22px]">
        <div className="flex items-center gap-1 lg:hidden">
          <IconButton
            icon="menu"
            label="Open menu"
            variant="ghost"
            className={onOrange ? "text-white hover:bg-white/15" : undefined}
            onClick={() => setNavOpen(true)}
          />
        </div>

        <Logo tone={onOrange ? "light" : "dark"} className="max-lg:absolute max-lg:left-1/2 max-lg:-translate-x-1/2" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative text-body whitespace-nowrap transition-opacity hover:opacity-75",
                    "after:absolute after:inset-x-0 after:-bottom-1 after:h-[1.5px] after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100",
                    isActive(item.href) && "after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden w-[260px] xl:block xl:w-[380px]">
            <AISearchBar />
          </div>
          <IconButton
            icon="search"
            label="Search or ask GASENOS AI"
            variant={onOrange ? "light" : "outline"}
            className="xl:hidden"
            onClick={() => setSearchOpen(true)}
          />
          <IconLink
            href="/wishlist"
            icon="heart"
            label={`Wishlist${hydrated && wishCount ? ` (${wishCount} items)` : ""}`}
            variant={onOrange ? "light" : "outline"}
            badge={hydrated ? wishCount : 0}
            className="max-md:hidden"
          />
          <IconButton
            icon="bag"
            label={`Cart${hydrated && count ? ` (${count} items)` : ""}`}
            variant="dark"
            badge={hydrated ? count : 0}
            onClick={() => setCartOpen(true)}
          />
          <IconLink
            href={user ? "/account" : "/account/login"}
            icon="user"
            label={user ? `Account — ${user.name}` : "Sign in"}
            variant={onOrange ? "light" : "outline"}
            className="max-md:hidden"
          />
        </div>
      </div>
    </header>
  );
}
