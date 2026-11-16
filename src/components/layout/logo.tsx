import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Wordmark logo — Archivo Black, as in the Figma header. */
export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="GASENOS — home"
      className={cn(
        "font-display text-[22px] leading-[1.15] font-black tracking-[-0.03em] whitespace-nowrap transition-opacity hover:opacity-80 sm:text-[28px]",
        tone === "light" ? "text-white" : "text-ink",
        className,
      )}
    >
      GASENOS
    </Link>
  );
}
