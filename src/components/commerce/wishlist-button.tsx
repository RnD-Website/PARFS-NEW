"use client";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";
import { useWishlist } from "@/stores/wishlist";
import { useUI } from "@/stores/ui";
import { useHydrated } from "@/lib/hooks/use-hydrated";

export function WishlistButton({
  productId,
  productName,
  variant = "floating",
  className,
}: {
  productId: string;
  productName: string;
  variant?: "floating" | "outline";
  className?: string;
}) {
  const hydrated = useHydrated();
  const active = useWishlist((s) => s.ids.includes(productId)) && hydrated;
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(productId);
        toast({
          title: added ? "Saved to wishlist" : "Removed from wishlist",
          description: productName,
          action: added ? { label: "View wishlist", href: "/wishlist" } : undefined,
        });
      }}
      className={cn(
        "flex items-center justify-center rounded-full transition-[transform,background-color,color] duration-200 active:scale-90",
        variant === "floating" && "size-11 bg-white text-ink shadow-sm hover:scale-105",
        variant === "outline" && "size-[52px] border-[1.5px] border-ink/80 text-ink hover:bg-ink/5",
        active && "text-orange",
        className,
      )}
    >
      <Icon name="heart" size={20} filled={active} />
    </button>
  );
}
