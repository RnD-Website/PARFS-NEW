import type { Product } from "@/lib/commerce/types";
import { featured } from "@/content/home";
import { ProductGallery } from "@/components/commerce/product-gallery";
import { ProductPurchase } from "@/components/commerce/product-purchase";

/** Figma "Featured product" — a fully working mini product page. */
export function FeaturedProduct({ product }: { product: Product }) {
  return (
    <section aria-label="Featured drop" className="py-14 lg:py-[120px]">
      <div className="container-page grid gap-8 md:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images.slice(0, 4)} name={product.name} />
        <ProductPurchase product={product} eyebrow={featured.eyebrow} title={featured.title} fitCheck={featured.fitCheck} headingLevel="h2" />
      </div>
    </section>
  );
}
