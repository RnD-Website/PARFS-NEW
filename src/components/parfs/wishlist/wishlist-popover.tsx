"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useParfsWishlist } from "@/stores/parfs-wishlist";
import { useAddToBag } from "../use-add-to-bag";
import { useWishlistItems } from "./use-wishlist-items";

/**
 * Wishlist popover under the header heart — after jomalone.com's: "Wishlist" title, saved scents with
 * photo, name, size · Qty 1, price and "Add to bag", then a full-width "View wishlist" button.
 * Closes on outside click and Escape.
 */
export function WishlistPopover() {
  const open = useParfsWishlist((s) => s.open);
  const setOpen = useParfsWishlist((s) => s.setOpen);
  const remove = useParfsWishlist((s) => s.remove);
  const { items } = useWishlistItems(open);
  const addToBag = useAddToBag();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (panel.current?.contains(t) || t.closest("[data-wishlist-toggle]")) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div
      ref={panel}
      role="dialog"
      aria-label="Wishlist"
      aria-hidden={!open}
      data-lenis-prevent
      className={cn(
        "fixed top-72 right-28 z-[55] flex max-h-[calc(100svh_-_var(--spacing)_*_100)] w-400 flex-col bg-p-paper text-p-text shadow-[0_24px_60px_-20px_rgba(10,10,11,0.35)] transition-[opacity,transform,visibility] duration-500 ease-out-expo max-lg:top-[60px] max-lg:right-[12px] max-lg:left-[12px] max-lg:w-auto",
        open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-8 opacity-0",
      )}
    >
      <div className="flex items-center justify-between px-28 pt-24 pb-16 max-lg:px-[20px] max-lg:pt-[20px] max-lg:pb-[14px]">
        <p className="font-italiana fs-24 tracking-[0.06em] uppercase max-lg:text-[22px]">Wishlist</p>
        <button type="button" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} className="p-mono-sm text-p-grey transition-colors hover:text-p-text" aria-label="Close wishlist">
          Close ✕
        </button>
      </div>

      {items.length === 0 ? (
        <div className="px-28 pb-28 max-lg:px-[20px] max-lg:pb-[24px]">
          <p className="p-body fs-15 leading-[1.55] text-p-text/75 max-lg:text-[15px]">Your wishlist is empty. Tap the heart on any fragrance to save it here.</p>
          <Link
            href="/collection"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="mt-20 flex h-48 items-center justify-center bg-p-text fs-12 font-medium tracking-[0.08em] text-p-paper uppercase transition-colors hover:bg-black max-lg:mt-[18px] max-lg:h-[48px] max-lg:text-[12px]"
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <>
          <ul className="min-h-0 flex-1 overflow-y-auto px-28 max-lg:px-[20px]">
            {items.map(({ slug, info, summary }) => (
              <li key={slug} className="flex gap-16 border-t border-p-text/10 py-18 max-lg:gap-[14px] max-lg:py-[16px]">
                <Link href={`/products/${slug}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} className="relative aspect-[4/5] w-80 shrink-0 overflow-hidden bg-p-sand max-lg:w-[76px]">
                  <Image src={info.image} alt={info.name} fill sizes="90px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/products/${slug}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} className="font-italiana fs-22 leading-[1.1] max-lg:text-[20px]">
                    {info.name}
                  </Link>
                  <p className="mt-4 p-mono-sm text-p-grey max-lg:mt-[4px]">
                    {info.volume} · Qty 1
                  </p>
                  <p className="mt-4 p-body fs-15 tabular-nums max-lg:mt-[4px] max-lg:text-[15px]">${info.price}</p>
                  <div className="mt-auto flex items-center justify-between pt-10 max-lg:pt-[10px]">
                    <button type="button" onClick={() => remove(slug)} tabIndex={open ? 0 : -1} className="p-mono-sm text-p-grey transition-colors hover:text-p-text">
                      Remove
                    </button>
                    {summary ? (
                      <button
                        type="button"
                        tabIndex={open ? 0 : -1}
                        onClick={() => {
                          setOpen(false);
                          addToBag(summary);
                        }}
                        className="p-mono text-p-text underline underline-offset-4 transition-colors hover:text-p-gold"
                      >
                        Add to bag
                      </button>
                    ) : (
                      <Link href={`/products/${slug}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1} className="p-mono text-p-text underline underline-offset-4 transition-colors hover:text-p-gold">
                        View
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-p-text/10 px-28 pt-18 pb-24 max-lg:px-[20px] max-lg:pt-[16px] max-lg:pb-[20px]">
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="flex h-48 items-center justify-center bg-p-text fs-12 font-medium tracking-[0.08em] text-p-paper uppercase transition-colors hover:bg-black max-lg:h-[48px] max-lg:text-[12px]"
            >
              View wishlist
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
