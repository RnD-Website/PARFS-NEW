import { Eyebrow } from "@/components/ui/eyebrow";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";

export function PageHeader({ eyebrow, title, intro, crumbs }: { eyebrow: string; title: React.ReactNode; intro?: string; crumbs: { name: string; href: string }[] }) {
  return (
    <header className="flex flex-col gap-4">
      <Breadcrumbs items={crumbs} />
      <Eyebrow className="mt-4">{eyebrow.toUpperCase()}</Eyebrow>
      <h1 className="text-h1">{title}</h1>
      {intro && <p className="max-w-2xl text-body-lg text-ink-2">{intro}</p>}
    </header>
  );
}
