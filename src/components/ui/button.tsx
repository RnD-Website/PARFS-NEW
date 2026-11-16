import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/icons/icon";
import { Spinner } from "./spinner";

/**
 * Pill button from the Figma "Button" component.
 * Primary = main CTA · Outline = secondary · Accent = orange (on dark) ·
 * Light = white (on orange) · AI = assistant actions (violet, sparkles icon).
 */
export type ButtonVariant = "primary" | "outline" | "accent" | "light" | "ai" | "ghost" | "outline-light" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-[#34302b]",
  outline: "border-[1.5px] border-ink text-ink hover:bg-ink hover:text-white",
  "outline-light": "border-[1.5px] border-white text-white hover:bg-white hover:text-ink",
  accent: "bg-orange text-ink hover:bg-orange-soft",
  light: "bg-white text-ink hover:bg-cream",
  ai: "bg-violet text-white hover:bg-[#5a3df0]",
  ghost: "text-ink hover:bg-ink/5",
  danger: "border-[1.5px] border-danger/40 text-danger hover:bg-danger hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-[18px] text-[14px] gap-2",
  md: "h-[52px] px-[26px] text-button gap-[10px]",
  lg: "h-14 px-8 text-[16px] gap-[10px]",
};

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Trailing arrow (the default for CTAs in the design). */
  arrow?: boolean;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: Pick<BaseProps, "variant" | "size" | "fullWidth" | "className">) {
  return cn(
    "group/btn relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none whitespace-nowrap select-none",
    "transition-[background-color,color,border-color,transform,box-shadow] duration-200 ease-out active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

function Inner({ arrow, icon, loading, children, variant, size }: BaseProps) {
  const iconSize = size === "sm" ? 16 : 18;
  return (
    <>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={iconSize} />
        </span>
      )}
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "invisible")}>
        {(icon || variant === "ai") && <Icon name={icon ?? "sparkles"} size={iconSize} />}
        {children}
        {arrow && (
          <Icon
            name="arrow-right"
            size={iconSize}
            className="transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5"
          />
        )}
      </span>
    </>
  );
}

export function Button({
  variant,
  size,
  arrow,
  icon,
  loading,
  fullWidth,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: BaseProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      <Inner {...{ variant, size, arrow, icon, loading, children }} />
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  arrow,
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: BaseProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Inner {...{ variant, size, arrow, icon, children }} />
    </Link>
  );
}
