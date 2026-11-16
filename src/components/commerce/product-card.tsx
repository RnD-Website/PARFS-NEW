import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/commerce/types";
import { discountPercent } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { WishlistButton } from "./wishlist-button";
import { QuickAddButton } from "./add-to-cart-button";

/** Figma "Product Card". */
export function ProductCard({ product, priority, className }: { product: ProductSummary; priority?: boolean; className?: string }) {
  const image = product.images[0];
  const pct = discountPercent(product.price, product.compareAtPrice);
  const badge = product.badges[0];
  const href = `/products/${product.slug}`;

  return (
    <article className={cn("group relative flex flex-col gap-3.5", className)}>
      <div className="relative aspect-[345/290] overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-muted">
        {image && (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 345px, (min-width: 768px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
        {badge && (
          <Badge
            type={badge}
            label={badge === "sale" && pct ? `-${pct}%` : undefined}
            className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5"
          />
        )}
        {!product.inStock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-caption font-semibold">Sold out</span>
        )}
        <WishlistButton productId={product.id} productName={product.name} className="absolute top-2.5 right-2.5 z-10 max-sm:size-9" />
      </div>
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-caption text-ink-muted">{product.categories[0]?.name}</p>
          <h3 className="text-label max-sm:text-[15px]">
            <Link href={href} className="after:absolute after:inset-0 after:z-0 after:content-[''] hover:underline hover:underline-offset-4">
              {product.name}
            </Link>
          </h3>
          {product.rating && <Rating average={product.rating.average} count={product.rating.count} />}
          <Price amount={product.price} compareAt={product.compareAtPrice} currency={product.currency} className="pt-1" />
        </div>
        <QuickAddButton product={product} className="relative z-10 max-sm:size-9" />
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5" aria-hidden>
      <div className="skeleton aspect-[345/290] rounded-[var(--radius-card)]" />
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-4 w-40 rounded" />
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}
