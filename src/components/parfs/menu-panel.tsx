"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuGroups, menuTiles } from "@/content/parfs-menu";
import { cn } from "@/lib/utils/cn";
import { scrollToTarget } from "./motion/smooth-scroll";
import { useParfsUI } from "@/stores/parfs-ui";
import { useSession } from "@/stores/session";

/** "/#section" links smooth-scroll when already on the home page, and navigate there otherwise. */
const homeAnchor = (href: string) => (href.startsWith("/#") ? href.slice(1) : null);

/**
 * PARFS main menu — after louisvuitton.com's: a light panel slides in from the left over a dimmed page.
 * "× Close" at the top, grouped links (small grey group label, large links, hairline between groups)
 * on the left, and a two-column grid of image tiles with captions on the right. On phones the panel
 * is full width with the tiles under the links.
 */
export function MenuPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const setAccountOpen = useParfsUI((s) => s.setAccountOpen);
  const signedIn = useSession((s) => !!s.user);

  const follow = (href: string) => (e: React.MouseEvent) => {
    onClose();
    const anchor = homeAnchor(href);
    if (anchor && window.location.pathname === "/") {
      e.preventDefault();
      setTimeout(() => scrollToTarget(anchor), 350);
    }
  };

  let delay = 0;
  const stagger = () => ({ transitionDelay: open ? `${180 + delay++ * 40}ms` : "0ms" });
  const rise = cn("transition-[opacity,transform] duration-700 ease-out-expo", open ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0");

  return (
    <div className={cn("fixed inset-0 z-[60] transition-[visibility] duration-700", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div onClick={onClose} className={cn("absolute inset-0 bg-p-ink/55 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} />
      <nav
        id="parfs-menu"
        aria-label="Main menu"
        data-lenis-prevent
        className={cn(
          "absolute inset-y-0 left-0 grid w-[min(100%,calc(var(--spacing)*720))] grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] overflow-y-auto bg-p-paper text-p-text shadow-2xl transition-transform duration-700 ease-out-expo max-lg:w-full max-lg:grid-cols-1",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Links */}
        <div className="flex flex-col px-40 pt-28 pb-40 max-lg:px-[20px] max-lg:pt-[18px] max-lg:pb-[28px]">
          <button type="button" onClick={onClose} tabIndex={open ? 0 : -1} className="flex w-fit items-center gap-12 p-mono text-p-text transition-opacity hover:opacity-60 max-lg:gap-[10px]">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25">
              <path d="m1 1 12 12M13 1 1 13" />
            </svg>
            Close
          </button>

          <div className="mt-56 flex flex-col max-lg:mt-[36px]">
            {menuGroups.map((g, gi) => (
              <section key={g.title} className={cn(gi > 0 && "mt-36 border-t border-p-text/12 pt-36 max-lg:mt-[28px] max-lg:pt-[28px]")}>
                <p className={cn("p-mono-sm text-p-grey", rise)} style={stagger()}>
                  {g.title}
                </p>
                <ul className="mt-18 flex flex-col gap-14 max-lg:mt-[14px] max-lg:gap-[12px]">
                  {g.links.map((l) => {
                    const current = l.href === pathname;
                    return (
                      <li key={l.label} className={rise} style={stagger()}>
                        <Link href={l.href} onClick={follow(l.href)} tabIndex={open ? 0 : -1} aria-current={current ? "page" : undefined} className="font-italiana fs-28 leading-[1.1] max-lg:text-[28px]">
                          <span className={cn("p-underline", current && "underline decoration-1 underline-offset-[6px]")}>{l.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-16 pt-48 max-lg:gap-[14px] max-lg:pt-[36px]">
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => {
                onClose();
                setAccountOpen(true);
              }}
              className="group flex w-fit items-center gap-10 p-mono text-p-text max-lg:gap-[10px]"
            >
              <span className="p-underline">{signedIn ? "My account" : "Sign in / Create an account"}</span>
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
            </button>
            <p className="p-mono-sm text-p-grey">N°01 — Nocturne · The new collection — 2026</p>
          </div>
        </div>

        {/* Image tiles */}
        <ul className="grid grid-cols-2 content-start gap-8 p-8 max-lg:gap-[8px] max-lg:px-[20px] max-lg:pt-0 max-lg:pb-[28px]">
          {menuTiles.map((t, i) => (
            <li key={t.label} className={cn("transition-[opacity,transform] duration-[900ms] ease-out-expo", open ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0")} style={{ transitionDelay: open ? `${260 + i * 60}ms` : "0ms" }}>
              <Link href={t.href} onClick={follow(t.href)} tabIndex={open ? 0 : -1} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden bg-p-sand">
                  <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 15vw, 45vw" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.05]" />
                </span>
                <span className="mt-10 block p-body fs-15 text-p-text max-lg:mt-[8px] max-lg:text-[14px]">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
