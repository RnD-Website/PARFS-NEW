import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/icons/icon";

/** 44px round icon button (Figma "Icon Button"): Light · Dark · Outline · Accent. */
export type IconButtonVariant = "light" | "dark" | "outline" | "accent" | "ghost" | "violet";

const variants: Record<IconButtonVariant, string> = {
  light: "bg-white text-ink hover:bg-cream",
  dark: "bg-ink text-white hover:bg-[#34302b]",
  outline: "border-[1.5px] border-line text-ink hover:border-ink",
  accent: "bg-orange text-ink hover:bg-orange-soft",
  ghost: "text-ink hover:bg-ink/5",
  violet: "bg-violet text-white hover:bg-[#5a3df0]",
};

export function iconButtonClasses(variant: IconButtonVariant = "light", size = 44, className?: string) {
  return cn(
    "relative inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,border-color,transform] duration-200 active:scale-95",
    "disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    size === 44 ? "size-11" : size === 52 ? "size-[52px]" : size === 36 ? "size-9" : "size-10",
    className,
  );
}

type Common = {
  icon: IconName;
  label: string;
  variant?: IconButtonVariant;
  size?: 36 | 40 | 44 | 52;
  iconSize?: number;
  filled?: boolean;
  badge?: number;
  className?: string;
};

function Badge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-1 text-[11px] leading-none font-bold text-ink ring-2 ring-white tabular-nums">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function IconButton({
  icon,
  label,
  variant,
  size = 44,
  iconSize = 20,
  filled,
  badge,
  className,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button type={type} aria-label={label} title={label} className={iconButtonClasses(variant, size, className)} {...rest}>
      <Icon name={icon} size={iconSize} filled={filled} />
      <Badge count={badge} />
    </button>
  );
}

export function IconLink({
  icon,
  label,
  variant,
  size = 44,
  iconSize = 20,
  filled,
  badge,
  className,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link aria-label={label} title={label} className={iconButtonClasses(variant, size, className)} {...rest}>
      <Icon name={icon} size={iconSize} filled={filled} />
      <Badge count={badge} />
    </Link>
  );
}
