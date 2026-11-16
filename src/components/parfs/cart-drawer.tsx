"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { parfsCatalog } from "@/content/parfs-catalog";
import { formatMoney } from "@/lib/utils/money";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { cartCount, MAX_PER_LINE, useCart, type CartLine } from "@/stores/cart";
import { useUI } from "@/stores/ui";
import { setScrollLocked } from "./motion/smooth-scroll";
import { ParfsButton } from "./ui/parfs-button";

const HELP = [
  { label: "FAQs", href: "/faq" },
  { label: "Visit us", href: "/contact" },
  { label: "Speak with a specialist", href: "/contact" },
];

/**
 * PARFS cart drawer — numbered lines with photo, name, price, concentration / volume and a [−] 1 [+]
 * stepper; special-instructions note (carried into checkout), shipping + total, View bag / Checkout,
 * and help links. Slides in from the right like the collection's filter drawer.
 *
 * Prices: the PARFS pages show the catalogue's USD prices, so lines for PARFS fragrances use those.
 * (The store's checkout still bills in its own currency until checkout moves to Shopify.)
 */
export function ParfsCartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const note = useCart((s) => s.note);
  const setNote = useCart((s) => s.setNote);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const hydrated = useHydrated();
  const pathname = usePathname();
  const close = () => setOpen(false);

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [open, setOpen]);

  const items = hydrated ? lines : [];
  const count = cartCount(items);
  const priced = items.map((l) => ({ line: l, info: parfsCatalog.find((c) => c.slug === l.slug) }));
  const allUsd = priced.every((p) => p.info);
  const total = allUsd
    ? `$${priced.reduce((n, p) => n + p.info!.price * p.line.quantity, 0).toLocaleString("en-US")}`
    : formatMoney(items.reduce((n, l) => n + l.unitPrice * l.quantity, 0), items[0]?.currency);

  return (
    <div className={cn("fixed inset-0 z-[70] transition-[visibility] duration-700", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div onClick={close} className={cn("absolute inset-0 bg-p-ink/40 backdrop-blur-[2px] transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Bag"
        data-lenis-prevent
        className={cn(
          "absolute inset-y-0 right-0 flex w-440 max-w-full flex-col bg-p-paper text-p-text shadow-2xl transition-transform duration-700 ease-out-expo max-lg:w-[min(100vw,420px)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Head */}
        <div className="flex items-center justify-between border-b border-p-text/12 px-28 py-20 max-lg:px-[20px] max-lg:py-[18px]">
          <p className="p-mono">
            Bag <span className="text-p-grey">[{count}]</span>
          </p>
          <button type="button" onClick={close} className="p-mono text-p-grey transition-colors hover:text-p-text" aria-label="Close bag">
            Close ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-20 px-28 text-center max-lg:gap-[18px] max-lg:px-[20px]">
            <p className="font-italiana fs-40 leading-none max-lg:text-[34px]">Your bag is empty</p>
            <p className="max-w-280 p-body fs-15 text-p-text/70 max-lg:text-[15px]">Find the scent that moves with your day.</p>
            <ParfsButton theme="dark" href="/collection" onClick={close}>
              Explore the collection
            </ParfsButton>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-28 max-lg:px-[20px]">
              {/* Lines */}
              <ol>
                {priced.map(({ line, info }, i) => (
                  <Line
                    key={line.id}
                    index={i}
                    line={line}
                    price={info ? `$${(info.price * line.quantity).toLocaleString("en-US")}` : formatMoney(line.unitPrice * line.quantity, line.currency)}
                    meta={info ? [["Concentration", info.concentration], ["Volume", info.volume]] : line.variantTitle ? [["Option", line.variantTitle]] : []}
                    open={open}
                    onQty={(q) => setQuantity(line.id, q)}
                    onRemove={() => remove(line.id)}
                    onNavigate={close}
                  />
                ))}
              </ol>

              {/* Special instructions */}
              <label className="block pt-28 pb-8 max-lg:pt-[24px]">
                <span className="p-mono text-p-grey">Special instructions</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Gift message, engraving, delivery notes…"
                  className="mt-10 block w-full resize-none border border-p-text/20 bg-transparent px-14 py-12 p-body fs-15 text-p-text outline-none placeholder:text-p-grey/80 focus:border-p-text max-lg:mt-[10px] max-lg:px-[12px] max-lg:py-[10px] max-lg:text-[15px]"
                />
              </label>
            </div>

            {/* Foot */}
            <div className="border-t border-p-text/12 px-28 pt-20 pb-24 max-lg:px-[20px] max-lg:pt-[18px] max-lg:pb-[20px]">
              <dl className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] gap-x-16 gap-y-12 max-lg:gap-x-[14px] max-lg:gap-y-[10px]">
                <dt className="pt-2 p-mono-sm text-p-grey">Shipping</dt>
                <dd className="p-body fs-14 leading-[1.45] text-p-text/80 max-lg:text-[14px]">Complimentary shipping and returns. Taxes calculated at checkout.</dd>
                <dt className="pt-2 p-mono-sm text-p-grey">Total</dt>
                <dd className="p-body fs-18 font-medium tabular-nums max-lg:text-[18px]">{total}</dd>
              </dl>

              <div className="mt-20 grid grid-cols-2 gap-10 max-lg:mt-[18px] max-lg:gap-[10px]">
                <BoxLink href="/cart" onClick={close}>
                  View bag
                </BoxLink>
                <BoxLink href="/checkout" onClick={close} solid>
                  Checkout
                </BoxLink>
              </div>

              <div className="mt-20 max-lg:mt-[18px]">
                <p className="p-mono-sm text-p-grey">Help</p>
                <ul className="mt-8 flex items-center justify-between gap-12 max-lg:mt-[8px] max-lg:gap-[10px]">
                  {HELP.map((h) => (
                    <li key={h.label}>
                      <Link href={h.href} onClick={close} className="p-body fs-14 text-p-text underline underline-offset-[3px] transition-colors hover:text-p-gold max-lg:text-[14px]">
                        {h.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Line({
  index,
  line,
  price,
  meta,
  open,
  onQty,
  onRemove,
  onNavigate,
}: {
  index: number;
  line: CartLine;
  price: string;
  meta: string[][];
  open: boolean;
  onQty: (q: number) => void;
  onRemove: () => void;
  onNavigate: () => void;
}) {
  const max = Math.min(MAX_PER_LINE, line.maxQuantity);
  const step = "px-2 transition-colors hover:text-p-text disabled:pointer-events-none disabled:opacity-30";
  return (
    <li
      className={cn("border-b border-p-text/10 py-24 transition-[opacity,transform] duration-700 ease-out-expo last:border-b-0 max-lg:py-[20px]", open ? "translate-x-0 opacity-100" : "translate-x-24 opacity-0")}
      style={{ transitionDelay: open ? `${150 + index * 70}ms` : "0ms" }}
    >
      <p className="p-mono-sm text-p-grey tabular-nums">{String(index + 1).padStart(2, "0")}</p>
      <div className="mt-10 flex gap-16 max-lg:mt-[10px] max-lg:gap-[14px]">
        <Link href={`/products/${line.slug}`} onClick={onNavigate} className="relative aspect-[4/5] w-104 shrink-0 overflow-hidden bg-p-sand max-lg:w-[96px]">
          {line.image && <Image src={line.image} alt={line.name} fill sizes="110px" className="object-cover" />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-12">
            <Link href={`/products/${line.slug}`} onClick={onNavigate} className="font-italiana fs-24 leading-[1.05] max-lg:text-[22px]">
              <span className="p-underline">{line.name}</span>
            </Link>
            <span className="shrink-0 p-body fs-15 tabular-nums max-lg:text-[15px]">{price}</span>
          </div>
          {meta.length > 0 && (
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-14 gap-y-2 max-lg:mt-[8px] max-lg:gap-x-[12px]">
              {meta.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="p-mono-sm text-p-grey">{k}</dt>
                  <dd className="p-body fs-13 text-p-text/80 max-lg:text-[13px]">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-8 flex items-center gap-6 p-body fs-13 text-p-text/80 max-lg:mt-[8px] max-lg:gap-[6px] max-lg:text-[13px]">
            <span aria-hidden className="size-5 rounded-full bg-p-gold max-lg:size-[5px]" /> Ready to ship
          </p>
          <div className="mt-auto flex items-center justify-between pt-10 max-lg:pt-[10px]">
            <div className="flex items-center gap-8 p-mono text-p-grey max-lg:gap-[8px]">
              <button type="button" onClick={() => onQty(line.quantity - 1)} className={step} aria-label={`Decrease ${line.name}`}>
                [−]
              </button>
              <span className="min-w-14 text-center text-p-text tabular-nums" aria-live="polite">
                {line.quantity}
              </span>
              <button type="button" onClick={() => onQty(line.quantity + 1)} disabled={line.quantity >= max} className={step} aria-label={`Increase ${line.name}`}>
                [+]
              </button>
            </div>
            <button type="button" onClick={onRemove} className="p-mono-sm text-p-grey underline underline-offset-[3px] transition-colors hover:text-p-text">
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/** Half-width boxed action in the PARFS button language (outlined box, fill rises on hover). */
function BoxLink({ href, onClick, solid, children }: { href: string; onClick: () => void; solid?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex h-52 items-center justify-center overflow-hidden border max-lg:h-[52px]",
        solid ? "border-p-text bg-p-text text-p-paper" : "border-p-text/60 text-p-text",
      )}
    >
      <span aria-hidden className={cn("absolute inset-0 origin-bottom scale-y-0 transition-transform duration-600 ease-out-expo group-hover:scale-y-100", solid ? "bg-black" : "bg-p-text")} />
      <span className={cn("relative fs-12 font-medium tracking-[0.08em] uppercase transition-colors duration-500 max-lg:text-[12px]", !solid && "group-hover:text-p-paper")}>{children}</span>
    </Link>
  );
}
