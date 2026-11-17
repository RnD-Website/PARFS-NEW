"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cartCount, useCart } from "@/stores/cart";
import { useUI } from "@/stores/ui";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { scrollToTarget, setScrollLocked } from "./motion/smooth-scroll";
import { AccountDrawer } from "./account-drawer";
import { MenuPanel } from "./menu-panel";
import { useParfsUI } from "@/stores/parfs-ui";
import { useSession } from "@/stores/session";
import { SearchPanel } from "./search-panel";
import { WishlistPopover } from "./wishlist/wishlist-popover";
import { useParfsWishlist } from "@/stores/parfs-wishlist";

/**
 * PARFS header — after dior.com's bar: a menu icon on the left, the PARFS wordmark centred, and
 * search · wishlist · account · bag icons on the right. The menu icon opens the full-screen menu
 * panel (MenuPanel). White over the home hero, dark type on the light inner pages.
 */
export function ParfsHeader() {
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  const setCartOpen = useUI((s) => s.setCartOpen);
  const count = hydrated ? cartCount(lines) : 0;
  const wishSlugs = useParfsWishlist((s) => s.slugs);
  const wishOpen = useParfsWishlist((s) => s.open);
  const setWishOpen = useParfsWishlist((s) => s.setOpen);
  const wishCount = hydrated ? wishSlugs.length : 0;
  const setAccountOpen = useParfsUI((s) => s.setAccountOpen);
  const signedIn = useSession((s) => !!s.user);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  // Only the home page opens on a dark hero. Every other page sits on light paper: there the bar has no
  // background and dark type, gaining a frosted paper backdrop once the page scrolls under it.
  const isHome = pathname === "/";
  // The search panel is light paper, so the bar switches to dark type while it is open.
  const light = searchOpen || !isHome;
  // The colour is applied after hydration: the server-built HTML can carry the wrong page's colour
  // (seen on Vercel for the cached home page), and React keeps server classes it did not render itself.
  const ink = !hydrated ? "text-inherit" : light ? "text-p-text" : "text-white";

  // Hide while scrolling down, reveal on scroll up; gain a backdrop once past the hero.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > window.innerHeight * 0.6);
      setScrolled(y > 8);
      setHidden(
        y > 160 && y > last + 2 ? true : y < last - 2 ? false : (h) => h,
      );
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menu / search: lock the page and close on Escape (every link inside closes them on click).
  const overlay = menuOpen || searchOpen;
  useEffect(() => {
    if (!overlay) return;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [overlay]);

  const icon = cn(
    "relative flex size-34 items-center justify-center transition-[color,opacity] duration-500 hover:opacity-60 max-lg:size-[36px]",
    ink,
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-72 transition-[transform,background-color,backdrop-filter] duration-700 ease-out-expo max-lg:h-[60px]",
          hidden && !overlay && !wishOpen && "-translate-y-full",
          searchOpen
            ? "bg-p-paper"
            : menuOpen
              ? "bg-transparent"
              : isHome
                ? solid
                  ? "bg-p-ink/85 backdrop-blur-md"
                  : "bg-transparent"
                : scrolled
                  ? "border-b border-p-text/10 bg-p-paper/85 backdrop-blur-md"
                  : "bg-transparent",
        )}
      >
        <div
          className="flex h-full items-center justify-between px-28 max-lg:px-[12px]"
          data-reveal="fade"
          data-reveal-now
          data-reveal-delay="0.9"
          data-reveal-y="-12"
        >
          {/* Menu */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setWishOpen(false);
              setMenuOpen((v) => !v);
            }}
            aria-expanded={menuOpen}
            aria-controls="parfs-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={icon}
          >
            <span aria-hidden className="relative block h-[9px] w-[18px]">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-out-expo",
                  menuOpen && "translate-y-[4px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-out-expo",
                  menuOpen && "-translate-y-[4px] -rotate-45",
                )}
              />
            </span>
          </button>

          {/* Icons */}
          <nav
            aria-label="Account"
            className="flex items-center gap-0 max-lg:gap-0"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setWishOpen(false);
                setSearchOpen((v) => !v);
              }}
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Search"}
              className={icon}
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              data-wishlist-toggle
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(false);
                setWishOpen(!wishOpen);
              }}
              aria-expanded={wishOpen}
              aria-label={`Wishlist, ${wishCount} saved`}
              className={icon}
            >
              <HeartIcon />
              {wishCount > 0 && (
                <span
                  aria-hidden
                  className="absolute top-[4px] right-[2px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-p-gold px-[3px] font-mono-p text-[9px] leading-none text-white tabular-nums"
                >
                  {wishCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(false);
                setWishOpen(false);
                setAccountOpen(true);
              }}
              aria-label={signedIn ? "Your account" : "Sign in"}
              className={cn(icon, "max-lg:hidden")}
            >
              <UserIcon />
              {signedIn && <span aria-hidden className="absolute right-[9px] bottom-[8px] size-[6px] rounded-full bg-p-gold" />}
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}
              className={icon}
            >
              <BagIcon />
              {count > 0 && (
                <span
                  aria-hidden
                  className="absolute top-[4px] right-[2px] flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-p-gold px-[3px] font-mono-p text-[9px] leading-none text-white tabular-nums"
                >
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Wordmark */}
        <Link
          href="/"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              setMenuOpen(false);
              scrollToTarget(0);
            }
          }}
          className="absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center font-italiana leading-none"
          aria-label="PARFS — home"
        >
          <span
            className={cn(
              "pl-[0.34em] fs-30 tracking-[0.34em] transition-colors duration-500 max-lg:text-[22px]",
              ink,
            )}
          >
            <span
              data-reveal="split"
              data-reveal-now
              data-reveal-delay="0.6"
              data-reveal-stagger="0.06"
              aria-hidden
            >
              {"PARFS".split("").map((c, i) => (
                <span key={i} className="p-split-mask">
                  <span className="p-split-item">{c}</span>
                </span>
              ))}
            </span>
          </span>
        </Link>
      </header>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      <WishlistPopover />
      <AccountDrawer />

      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

/* Thin-line icons (1.25 stroke, currentColor) in the spirit of the reference bar. */
const svg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function SearchIcon() {
  return (
    <svg {...svg}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg {...svg}>
      <path d="M12 19.5s-7-4.35-7-9.6A3.9 3.9 0 0 1 8.9 6c1.3 0 2.4.6 3.1 1.6A3.75 3.75 0 0 1 15.1 6 3.9 3.9 0 0 1 19 9.9c0 5.25-7 9.6-7 9.6Z" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...svg}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg {...svg}>
      <path d="M5.5 8.5h13l-1 11.5h-11l-1-11.5Z" />
      <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    </svg>
  );
}
