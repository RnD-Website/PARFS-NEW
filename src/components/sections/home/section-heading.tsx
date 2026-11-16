import { cn } from "@/lib/utils/cn";
import { Eyebrow } from "@/components/ui/eyebrow";

export function SectionHeading({
  eyebrow,
  title,
  id,
  tone = "light",
  align = "left",
  className,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  id: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3.5", align === "center" && "items-center text-center", className)}>
      <Eyebrow tone={tone === "dark" ? "dark" : "light"}>{eyebrow.toUpperCase()}</Eyebrow>
      <h2 id={id} className="text-h1">
        {title}
      </h2>
      {children}
    </div>
  );
}
