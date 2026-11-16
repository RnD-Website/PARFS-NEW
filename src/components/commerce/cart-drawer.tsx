"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { ButtonLink } from "@/components/ui/button";
import { useCart, cartCount, cartSubtotal } from "@/stores/cart";
import { useUI } from "@/stores/ui";
import { formatMoney } from "@/lib/utils/money";
import { CartLineItem } from "./cart-line";
import { FreeShippingMeter } from "./free-shipping-meter";
import { Icon } from "@/components/icons/icon";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const openAssistant = useUI((s) => s.openAssistant);
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname, setOpen]);

  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);
  const close = () => setOpen(false);

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      title={hydrated && count ? `Your cart (${count})` : "Your cart"}
      footer={
        hydrated && lines.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-body">Subtotal</span>
              <span className="text-price tabular-nums">{formatMoney(subtotal)}</span>
            </div>
            <p className="text-caption text-ink-muted">Delivery and any discounts are calculated at checkout.</p>
            <ButtonLink href="/checkout" arrow fullWidth onClick={close}>
              Checkout
            </ButtonLink>
            <ButtonLink href="/cart" variant="outline" fullWidth onClick={close}>
              View cart
            </ButtonLink>
          </div>
        ) : undefined
      }
    >
      {!hydrated ? null : lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Icon name="bag" size={28} />
          </span>
          <p className="text-h4">Your cart is empty</p>
          <p className="text-body-sm text-ink-muted">Browse best sellers or let GASENOS AI find something for you.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/shop" size="sm" onClick={close}>
              Start shopping
            </ButtonLink>
            <button
              type="button"
              onClick={() => openAssistant("Help me find something I'll love")}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-violet-soft px-4 text-[14px] font-semibold text-violet transition-colors hover:bg-[#ddd6ff]"
            >
              <Icon name="sparkles" size={16} /> Ask GASENOS AI
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5">
          <FreeShippingMeter subtotal={subtotal} />
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <CartLineItem key={l.id} line={l} compact onNavigate={close} />
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
