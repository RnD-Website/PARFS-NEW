"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { Eyebrow } from "@/components/ui/eyebrow";
import { QuantityStepper } from "@/components/ui/quantity";
import { Icon } from "@/components/icons/icon";
import { useCart, MAX_PER_LINE } from "@/stores/cart";
import { useUI } from "@/stores/ui";
import { storePolicy } from "@/content/site";
import { formatMoney } from "@/lib/utils/money";
import { WishlistButton } from "./wishlist-button";

type FitCheck = { title: string; text: string; cta: string; prompt: string };

/**
 * Options + price + add to cart (Figma "Details" of the Featured product).
 * Used on the homepage featured drop and on every product page.
 */
export function ProductPurchase({
  product,
  eyebrow,
  title,
  fitCheck,
  headingLevel = "h1",
  showQuantity,
}: {
  product: Product;
  eyebrow?: string;
  title?: string;
  fitCheck?: FitCheck;
  headingLevel?: "h1" | "h2";
  showQuantity?: boolean;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const openAssistant = useUI((s) => s.openAssistant);

  const initial = useMemo(() => {
    const sel: Record<string, string> = {};
    for (const o of product.options) {
      // Pre-select the first available colour (as the design does); sizes must be chosen.
      if (o.name === "Size") continue;
      const first = o.values.find((v) => product.variants.some((x) => x.options[o.name] === v.value && x.stock > 0)) ?? o.values[0];
      if (first) sel[o.name] = first.value;
    }
    return sel;
  }, [product]);

  const [selected, setSelected] = useState<Record<string, string>>(initial);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const variant = product.options.length
    ? product.variants.find((v) => product.options.every((o) => v.options[o.name] === selected[o.name]))
    : product.variants[0];
  const missing = product.options.filter((o) => !selected[o.name]).map((o) => o.name.toLowerCase());
  const stockFor = (name: string, value: string) =>
    product.variants.some((v) => v.options[name] === value && v.stock > 0 && product.options.every((o) => o.name === name || !selected[o.name] || v.options[o.name] === selected[o.name]));

  const Heading = headingLevel;
  const colorOpt = product.options.find((o) => o.name === "Color");
  const colorLabel = colorOpt?.values.find((v) => v.value === selected.Color)?.label;

  const addToCart = (goToCheckout: boolean) => {
    if (missing.length || !variant) {
      setError(`Please choose a ${missing.join(" and ") || "option"}.`);
      return;
    }
    if (variant.stock <= 0) {
      setError("This option is sold out.");
      return;
    }
    setError(null);
    setAdding(true);
    add(
      {
        id: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.src ?? null,
        variantTitle: product.options.length ? variant.title : null,
        unitPrice: variant.price,
        compareAtPrice: product.compareAtPrice,
        currency: product.currency,
        maxQuantity: variant.stock,
      },
      qty,
    );
    setTimeout(() => setAdding(false), 400);
    if (goToCheckout) {
      router.push("/checkout");
    } else {
      toast({ title: "Added to cart", description: `${product.name}${product.options.length ? ` — ${variant.title}` : ""}`, action: { label: "View cart", href: "/cart" } });
      setCartOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-col gap-[22px]">
        {eyebrow && <Eyebrow>{eyebrow.toUpperCase()}</Eyebrow>}
        <Heading className="font-display text-[clamp(30px,2.6vw+14px,40px)] leading-[1.05] font-extrabold tracking-[-0.025em]">{title ?? product.name}</Heading>
        {product.rating && <Rating average={product.rating.average} count={product.rating.count} variant="reviews" className="text-body text-ink-2" />}
      </div>
      <Price amount={variant?.price ?? product.price} compareAt={product.compareAtPrice} currency={product.currency} size="xl" />
      {product.highlights.length > 0 && <p className="-mt-2 text-body-sm text-ink-muted">{product.highlights.join(" · ")}</p>}

      {product.options.map((o) => (
        <fieldset key={o.name} className="flex flex-col gap-3">
          <legend className="mb-3 text-label">
            {o.name}{" "}
            <span className="font-medium text-ink-muted">
              ({" "}
              {o.name === "Color" ? colorLabel ?? "choose" : o.name === "Size" ? product.attributes["Size system"] ?? "choose" : selected[o.name] ?? "choose"} )
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {o.values.map((v) => {
              const isSel = selected[o.name] === v.value;
              const available = stockFor(o.name, v.value);
              if (o.name === "Color") {
                return (
                  <button
                    key={v.value}
                    type="button"
                    aria-label={`${v.label}${available ? "" : " (sold out)"}`}
                    aria-pressed={isSel}
                    title={v.label}
                    onClick={() => {
                      setSelected((s) => ({ ...s, [o.name]: v.value }));
                      setError(null);
                    }}
                    className={cn(
                      "flex size-[52px] items-center justify-center rounded-full border-[1.5px] transition-[border-color,transform] duration-200 hover:scale-105",
                      isSel ? "border-ink" : "border-transparent",
                      !available && "opacity-40",
                    )}
                  >
                    <span className="size-10 rounded-full border border-ink/10" style={{ background: v.swatch }} />
                  </button>
                );
              }
              return (
                <button
                  key={v.value}
                  type="button"
                  aria-pressed={isSel}
                  aria-label={`${o.name} ${v.label}${available ? "" : " (sold out)"}`}
                  onClick={() => {
                    setSelected((s) => ({ ...s, [o.name]: v.value }));
                    setError(null);
                  }}
                  className={cn(
                    "flex h-11 min-w-14 items-center justify-center rounded-xl border-[1.5px] px-3 text-[15px] font-semibold transition-colors duration-200",
                    isSel ? "border-ink bg-ink text-white" : "border-line bg-card text-ink hover:border-ink",
                    !available && !isSel && "text-ink-faint line-through decoration-1",
                  )}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {fitCheck && (
        <div className="flex gap-3 rounded-2xl bg-card p-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet text-white">
            <Icon name="sparkles" size={16} />
          </span>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-label">{fitCheck.title}</p>
              <p className="mt-1 text-body-sm text-ink-2">{fitCheck.text}</p>
            </div>
            <button type="button" onClick={() => openAssistant(fitCheck.prompt)} className="self-start text-body-sm font-semibold text-violet hover:underline">
              {fitCheck.cta} →
            </button>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2.5 text-body-sm text-ink-2">
        {[
          `Free delivery on orders over ${formatMoney(storePolicy.freeShippingThreshold)}`,
          `${storePolicy.returnDays}-day free returns`,
          `${storePolicy.warrantyYears}-year warranty`,
        ].map((b) => (
          <li key={b} className="flex items-center gap-2.5">
            <Icon name="check" size={18} className="text-orange-text" /> {b}
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="flex items-center gap-2 text-body-sm text-danger">
          <Icon name="alert" size={16} /> {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {showQuantity && (
          <div className="flex items-center gap-4">
            <QuantityStepper value={qty} max={Math.min(MAX_PER_LINE, variant?.stock || MAX_PER_LINE)} onChange={setQty} />
            {variant && variant.stock > 0 && variant.stock <= 3 && <span className="text-body-sm font-semibold text-orange-text">Only {variant.stock} left</span>}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Button variant="outline" onClick={() => addToCart(false)} loading={adding} disabled={!product.inStock}>
            {product.inStock ? "Add to cart" : "Sold out"}
          </Button>
          <Button arrow onClick={() => addToCart(true)} disabled={!product.inStock}>
            Buy now
          </Button>
          <WishlistButton productId={product.id} productName={product.name} variant="outline" className="hidden sm:flex" />
        </div>
      </div>
    </div>
  );
}
