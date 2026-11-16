"use client";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cartCount, cartSubtotal } from "@/stores/cart";
import { formatMoney } from "@/lib/utils/money";
import { storePolicy } from "@/content/site";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { CartLineItem } from "./cart-line";
import { FreeShippingMeter } from "./free-shipping-meter";
import { useCartSync } from "./use-cart-sync";
import { AskAIEmptyState } from "@/components/catalog/ask-ai-empty";

export function CartView() {
  const hydrated = useHydrated();
  const { lines, syncing, removed, adjusted } = useCartSync();
  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);
  const standardFee = subtotal >= storePolicy.freeShippingThreshold ? 0 : storePolicy.deliveryMethods[0].fee;

  if (!hydrated) {
    return <div className="container-page min-h-[50vh] py-16" aria-busy />;
  }

  return (
    <div className="container-page pt-8 pb-16 lg:pt-12 lg:pb-24">
      <Eyebrow>YOUR CART</Eyebrow>
      <h1 className="mt-3.5 text-h1">{count ? `Cart (${count})` : "Your cart is empty"}</h1>

      {(removed > 0 || adjusted) && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-2xl bg-orange/10 px-4 py-3 text-body-sm text-orange-text">
          <Icon name="info" size={18} />
          {removed > 0 ? `${removed} item${removed > 1 ? "s are" : " is"} no longer available and ${removed > 1 ? "were" : "was"} removed. ` : ""}
          {adjusted ? "Some prices or quantities were updated to match current stock." : ""}
        </p>
      )}

      {lines.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-5 rounded-[28px] bg-card px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Icon name="bag" size={28} />
          </span>
          <p className="max-w-md text-body text-ink-muted">Looks like you haven’t added anything yet. Start with our best sellers, or let GASENOS AI pick for you.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/shop" arrow>
              Start shopping
            </ButtonLink>
            <AskAIEmptyState prompt="Help me find something I'll love" />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
          <section aria-label="Items in your cart">
            <ul className="divide-y divide-line border-y border-line">
              {lines.map((l) => (
                <CartLineItem key={l.id} line={l} />
              ))}
            </ul>
            <ButtonLink href="/shop" variant="ghost" size="sm" className="mt-4 -ml-3" icon="arrow-left">
              Continue shopping
            </ButtonLink>
          </section>
          <aside aria-label="Order summary" className="flex flex-col gap-4 self-start rounded-[24px] bg-card p-6 lg:sticky lg:top-[calc(var(--header-h)+24px)]">
            <h2 className="text-h4">Order summary</h2>
            <FreeShippingMeter subtotal={subtotal} />
            <dl className="flex flex-col gap-2 text-body-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-semibold tabular-nums">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Standard delivery</dt>
                <dd className="font-semibold tabular-nums">{standardFee === 0 ? "Free" : formatMoney(standardFee)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-body">
                <dt className="font-semibold">Estimated total</dt>
                <dd className="text-price tabular-nums">{formatMoney(subtotal + standardFee)}</dd>
              </div>
            </dl>
            <ButtonLink href="/checkout" arrow fullWidth aria-disabled={syncing || undefined}>
              Checkout
            </ButtonLink>
            <p className="flex items-center justify-center gap-1.5 text-caption text-ink-muted">
              <Icon name="lock" size={14} /> Secure checkout · COD, bKash, Nagad & cards
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
