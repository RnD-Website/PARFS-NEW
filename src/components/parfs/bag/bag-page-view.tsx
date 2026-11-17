"use client";

import Image from "next/image";
import Link from "next/link";
import { parfsCatalog } from "@/content/parfs-catalog";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { formatMoney } from "@/lib/utils/money";
import { cartCount, MAX_PER_LINE, useCart, type CartLine } from "@/stores/cart";
import { ParfsButton } from "../ui/parfs-button";
import { PaymentLogos } from "../ui/payment-logos";

const HELP = [
  { label: "FAQs", href: "/faq" },
  { label: "Shipping", href: "/legal/shipping" },
  { label: "Returns", href: "/legal/returns" },
  { label: "Speak with a specialist", href: "/contact" },
];

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * PARFS bag page — the full-page version of the bag drawer: numbered lines (photo, name, concentration /
 * volume, [−] 1 [+] stepper, line total) on the left; special instructions; and a sticky order summary
 * with Checkout on the right. Prices follow the drawer: catalogue USD for PARFS fragrances.
 */
export function BagPageView() {
  const lines = useCart((s) => s.lines);
  const note = useCart((s) => s.note);
  const setNote = useCart((s) => s.setNote);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const hydrated = useHydrated();

  const items = hydrated ? lines : [];
  const count = cartCount(items);
  const priced = items.map((l) => ({ line: l, info: parfsCatalog.find((c) => c.slug === l.slug) }));
  const allUsd = priced.every((p) => p.info);
  const total = allUsd
    ? usd(priced.reduce((n, p) => n + p.info!.price * p.line.quantity, 0))
    : formatMoney(items.reduce((n, l) => n + l.unitPrice * l.quantity, 0), items[0]?.currency);

  return (
    <section className="bg-p-paper text-p-text">
      <div className="mx-auto max-w-[1920px] px-40 pt-160 pb-140 max-lg:px-[20px] max-lg:pt-[112px] max-lg:pb-[96px]">
        <header
          className="flex items-end justify-between gap-24 border-b border-p-text/12 pb-28 max-lg:flex-col max-lg:items-start max-lg:gap-[12px] max-lg:pb-[22px]"
          data-reveal="fade"
          data-reveal-now
        >
          <h1 className="font-italiana fs-72 leading-none uppercase max-lg:text-[44px]">Bag</h1>
          {count > 0 && (
            <p className="p-mono text-p-grey">
              {count} {count === 1 ? "item" : "items"}
            </p>
          )}
        </header>

        {!hydrated ? (
          <div className="min-h-[40vh]" />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-start gap-20 py-80 max-lg:gap-[18px] max-lg:py-[56px]">
            <p className="font-italiana fs-40 leading-[1.05] max-lg:text-[32px]">Your bag is empty</p>
            <p className="max-w-480 p-body fs-16 leading-[1.55] text-p-text/75 max-lg:text-[16px]">Find the scent that moves with your day.</p>
            <ParfsButton theme="dark" href="/collection">
              Explore the collection
            </ParfsButton>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_440px] items-start gap-80 max-lg:grid-cols-1 max-lg:gap-[40px]">
            {/* Lines */}
            <div>
              <div className="grid grid-cols-[minmax(0,1fr)_160px_120px] gap-24 border-b border-p-text/12 py-16 p-mono-sm text-p-grey max-lg:hidden">
                <span>Fragrance</span>
                <span>Quantity</span>
                <span className="text-right">Total</span>
              </div>
              <ol>
                {priced.map(({ line, info }, i) => (
                  <Line
                    key={line.id}
                    index={i}
                    line={line}
                    unit={info ? usd(info.price) : formatMoney(line.unitPrice, line.currency)}
                    price={info ? usd(info.price * line.quantity) : formatMoney(line.unitPrice * line.quantity, line.currency)}
                    meta={info ? [["Concentration", info.concentration], ["Volume", info.volume]] : line.variantTitle ? [["Option", line.variantTitle]] : []}
                    onQty={(q) => setQuantity(line.id, q)}
                    onRemove={() => remove(line.id)}
                  />
                ))}
              </ol>

              <label className="block max-w-560 pt-32 max-lg:pt-[28px]">
                <span className="p-mono text-p-grey">Special instructions</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Gift message, engraving, delivery notes…"
                  className="mt-10 block w-full resize-none border border-p-text/20 bg-transparent px-14 py-12 p-body fs-15 text-p-text outline-none placeholder:text-p-grey/80 focus:border-p-text max-lg:mt-[10px] max-lg:px-[12px] max-lg:py-[10px] max-lg:text-[15px]"
                />
              </label>

              <Link
                href="/collection"
                className="mt-28 inline-block p-mono text-p-text underline underline-offset-4 transition-colors hover:text-p-gold max-lg:mt-[24px]"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <aside className="sticky top-100 mt-32 bg-p-sand/60 p-32 max-lg:static max-lg:mt-0 max-lg:p-[20px]" aria-label="Order summary">
              <h2 className="font-italiana fs-32 leading-none max-lg:text-[28px]">Order summary</h2>
              <dl className="mt-24 grid grid-cols-[auto_1fr] gap-x-16 gap-y-14 border-b border-p-text/12 pb-20 max-lg:mt-[20px] max-lg:gap-y-[12px] max-lg:pb-[18px]">
                <dt className="p-mono-sm text-p-grey">Subtotal</dt>
                <dd className="text-right p-body fs-15 tabular-nums max-lg:text-[15px]">{total}</dd>
                <dt className="p-mono-sm text-p-grey">Shipping</dt>
                <dd className="text-right p-body fs-15 max-lg:text-[15px]">Complimentary</dd>
                <dt className="p-mono-sm text-p-grey">Taxes</dt>
                <dd className="text-right p-body fs-15 text-p-text/70 max-lg:text-[15px]">Calculated at checkout</dd>
              </dl>
              <div className="flex items-baseline justify-between pt-20 max-lg:pt-[18px]">
                <span className="p-mono text-p-grey">Total</span>
                <span className="p-body fs-24 font-medium tabular-nums max-lg:text-[22px]">{total}</span>
              </div>

              <ParfsButton theme="dark" solid href="/checkout" className="mt-24 w-full max-lg:mt-[20px] [&>span:first-child]:flex-1 [&>span:first-child]:justify-center">
                Checkout
              </ParfsButton>

              <p className="mt-16 p-body fs-13 leading-[1.5] text-p-text/70 max-lg:mt-[14px] max-lg:text-[13px]">
                Complimentary shipping and returns on every order.
              </p>
              <PaymentLogos className="mt-16 max-lg:mt-[14px]" />

              <div className="mt-24 border-t border-p-text/12 pt-20 max-lg:mt-[20px] max-lg:pt-[18px]">
                <p className="p-mono-sm text-p-grey">Help</p>
                <ul className="mt-10 flex flex-wrap gap-x-20 gap-y-8 max-lg:mt-[10px] max-lg:gap-x-[18px] max-lg:gap-y-[8px]">
                  {HELP.map((h) => (
                    <li key={h.label}>
                      <Link href={h.href} className="p-body fs-14 text-p-text underline underline-offset-[3px] transition-colors hover:text-p-gold max-lg:text-[14px]">
                        {h.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function Line({
  index,
  line,
  unit,
  price,
  meta,
  onQty,
  onRemove,
}: {
  index: number;
  line: CartLine;
  unit: string;
  price: string;
  meta: string[][];
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const max = Math.min(MAX_PER_LINE, line.maxQuantity);
  const step = "px-2 transition-colors hover:text-p-text disabled:pointer-events-none disabled:opacity-30";
  return (
    <li
      className="grid grid-cols-[minmax(0,1fr)_160px_120px] items-center gap-24 border-b border-p-text/10 py-28 animate-[p-card-in_0.8s_cubic-bezier(0.16,1,0.3,1)_both] max-lg:grid-cols-1 max-lg:gap-[14px] max-lg:py-[22px]"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex gap-24 max-lg:gap-[14px]">
        <Link href={`/products/${line.slug}`} className="relative aspect-[4/5] w-140 shrink-0 overflow-hidden bg-p-sand max-lg:w-[104px]">
          {line.image && <Image src={line.image} alt={line.name} fill sizes="150px" className="object-cover" />}
        </Link>
        <div className="flex min-w-0 flex-col">
          <p className="p-mono-sm text-p-grey tabular-nums">{String(index + 1).padStart(2, "0")}</p>
          <Link href={`/products/${line.slug}`} className="mt-8 font-italiana fs-32 leading-[1.05] max-lg:mt-[6px] max-lg:text-[24px]">
            <span className="p-underline">{line.name}</span>
          </Link>
          {meta.length > 0 && (
            <dl className="mt-12 grid grid-cols-[auto_1fr] gap-x-14 gap-y-2 max-lg:mt-[8px] max-lg:gap-x-[12px]">
              {meta.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="p-mono-sm text-p-grey">{k}</dt>
                  <dd className="p-body fs-14 text-p-text/80 max-lg:text-[13px]">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-10 flex items-center gap-6 p-body fs-14 text-p-text/80 max-lg:mt-[8px] max-lg:gap-[6px] max-lg:text-[13px]">
            <span aria-hidden className="size-5 rounded-full bg-p-gold max-lg:size-[5px]" /> Ready to ship
          </p>
          <p className="mt-auto pt-12 p-body fs-14 text-p-text/70 tabular-nums max-lg:pt-[10px] max-lg:text-[13px]">{unit} each</p>
        </div>
      </div>

      <div className="flex flex-col items-start gap-12 max-lg:flex-row max-lg:items-center max-lg:justify-between max-lg:gap-[12px]">
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
        <span className="hidden p-body text-[16px] font-medium tabular-nums max-lg:block">{price}</span>
      </div>

      <span className="text-right p-body fs-18 font-medium tabular-nums max-lg:hidden">{price}</span>
    </li>
  );
}
