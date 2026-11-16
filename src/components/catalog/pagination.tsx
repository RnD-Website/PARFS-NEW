import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

export function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1);
  const item = "flex size-11 items-center justify-center rounded-full text-[15px] font-semibold transition-colors";
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={href(page - 1)} className={cn(item, "hover:bg-ink/5")} aria-label="Previous page">
          <Icon name="chevron-left" size={18} />
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-ink-faint">…</span>}
          <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={cn(item, p === page ? "bg-ink text-white" : "hover:bg-ink/5")}>
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className={cn(item, "hover:bg-ink/5")} aria-label="Next page">
          <Icon name="chevron-right" size={18} />
        </Link>
      )}
    </nav>
  );
}
