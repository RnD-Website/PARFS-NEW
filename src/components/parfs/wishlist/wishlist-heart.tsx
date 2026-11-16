"use client";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { useParfsWishlist } from "@/stores/parfs-wishlist";

/**
 * Save / unsave a fragrance. Saving opens the header wishlist popover so the customer sees it land.
 * `tone="light"` for use over photographs.
 */
export function WishlistHeart({ slug, name, tone = "dark", className }: { slug: string; name: string; tone?: "dark" | "light"; className?: string }) {
  const hydrated = useHydrated();
  const saved = useParfsWishlist((s) => s.slugs.includes(slug));
  const toggle = useParfsWishlist((s) => s.toggle);
  const setOpen = useParfsWishlist((s) => s.setOpen);
  const on = hydrated && saved;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (toggle(slug)) setOpen(true);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn(
        "flex size-36 items-center justify-center transition-[transform,background-color,color] duration-300 active:scale-90 max-lg:size-[34px]",
        tone === "light"
          ? "rounded-full bg-p-ink/25 text-white backdrop-blur-md hover:bg-p-ink/40"
          : "text-p-text hover:text-p-gold",
        className,
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="transition-transform duration-500 ease-out-expo" style={{ transform: on ? "scale(1.08)" : undefined }}>
        <path
          d="M12 19.5s-7-4.35-7-9.6A3.9 3.9 0 0 1 8.9 6c1.3 0 2.4.6 3.1 1.6A3.75 3.75 0 0 1 15.1 6 3.9 3.9 0 0 1 19 9.9c0 5.25-7 9.6-7 9.6Z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
          className={on ? "text-p-gold" : undefined}
        />
      </svg>
    </button>
  );
}
