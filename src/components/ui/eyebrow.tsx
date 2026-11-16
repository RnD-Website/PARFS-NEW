import { cn } from "@/lib/utils/cn";

/** Figma "Eyebrow": "( LABEL )" — tone Light (orange text), Dark (on orange), AI (violet). */
export function Eyebrow({
  children,
  tone = "light",
  className,
  as: Tag = "p",
}: {
  children: string;
  tone?: "light" | "dark" | "ai";
  className?: string;
  as?: "p" | "span" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "text-eyebrow",
        tone === "light" && "text-orange-text",
        tone === "dark" && "text-white",
        tone === "ai" && "text-violet",
        className,
      )}
    >
      ( {children} )
    </Tag>
  );
}
