import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className="text-caption text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((it, i) => (
            <li key={it.href} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevron-right" size={12} />}
              {i === items.length - 1 ? (
                <span aria-current="page" className="font-semibold text-ink">
                  {it.name}
                </span>
              ) : (
                <Link href={it.href} className="hover:text-ink hover:underline">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
