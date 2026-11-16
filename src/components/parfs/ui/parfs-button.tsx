import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Common = { children: ReactNode; theme?: "light" | "dark"; solid?: boolean; className?: string };
type AsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, "className" | "children">;

/**
 * Figma "Button" — outlined label box + circular arrow.
 * Theme=Light on dark backgrounds, Theme=Dark on light backgrounds.
 * Hover: the circle fills and the arrow slides through.
 * `solid` — primary version: label box and circle start filled (black on light backgrounds) and lift to
 * pure black on hover, the arrow still sliding through.
 */
export function ParfsButton(props: AsLink | AsButton) {
  const { children, theme = "light", solid = false, className } = props;
  const tone = solid
    ? theme === "light"
      ? "text-p-ink [--b:#fff] [--bg:#fff] [--fill:#e9e3d9] [--on-fill:#0a0a0b]"
      : "text-p-paper [--b:#221f1b] [--bg:#221f1b] [--fill:#000] [--on-fill:#f3eee6]"
    : theme === "light"
      ? "text-white [--b:rgba(255,255,255,0.7)] [--bg:transparent] [--fill:#fff] [--on-fill:#0a0a0b]"
      : "text-p-text [--b:rgba(34,31,27,0.6)] [--bg:transparent] [--fill:#221f1b] [--on-fill:#f3eee6]";

  const inner = (
    <>
      <span className="relative flex h-52 items-center overflow-hidden border border-(--b) bg-(--bg) px-30 transition-colors duration-500 max-lg:h-[52px] max-lg:px-[24px]">
        <span className="absolute inset-0 origin-bottom scale-y-0 bg-(--fill) transition-transform duration-600 ease-out-expo group-hover:scale-y-100" />
        <span className="relative fs-12 font-medium tracking-[0.08em] whitespace-nowrap uppercase transition-colors duration-500 group-hover:text-(--on-fill) max-lg:text-[12px]">
          {children}
        </span>
      </span>
      <span className="relative flex size-52 shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--b) bg-(--bg) transition-colors duration-500 group-hover:bg-(--fill) max-lg:size-[52px]">
        <Arrow className="transition-transform duration-500 ease-out-expo group-hover:translate-x-[300%]" />
        <Arrow className="absolute -translate-x-[300%] text-(--on-fill) transition-transform duration-500 ease-out-expo group-hover:translate-x-0" />
      </span>
    </>
  );

  const cls = cn("group inline-flex items-center", tone, className);
  if (props.href !== undefined) {
    const { href, ...rest } = strip(props);
    return (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  const rest = strip(props);
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}

/** Drop the props ParfsButton consumes itself before spreading the rest onto the element. */
function strip<T extends Common>(props: T) {
  const rest: Record<string, unknown> = { ...props };
  delete rest.children;
  delete rest.theme;
  delete rest.solid;
  delete rest.className;
  return rest as Omit<T, keyof Common>;
}

/** icon/arrow-right from the Figma component set (18×18), used as a mask so it can take currentColor. */
function Arrow({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block size-18 bg-current max-lg:size-[18px]", className)}
      style={{ mask: "url(/images/parfs/icon-arrow-right.svg) center / contain no-repeat", WebkitMask: "url(/images/parfs/icon-arrow-right.svg) center / contain no-repeat" }}
    />
  );
}
