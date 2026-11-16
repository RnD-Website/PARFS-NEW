import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/** Figma "Chip / Tab": Active (ink fill) · Default (outline). */
export function Chip({
  active,
  className,
  children,
  ...rest
}: { active?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-11 shrink-0 items-center rounded-full border-[1.5px] border-ink px-5 text-button whitespace-nowrap transition-colors duration-200",
        active ? "bg-ink text-white" : "text-ink hover:bg-ink/5",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
