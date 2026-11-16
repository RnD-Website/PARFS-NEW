import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { policies } from "@/content/policies";
import { PageHeader } from "@/components/content/page-header";
import { PendingContent } from "@/components/ui/pending-content";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = policies.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.intro, alternates: { canonical: `/policies/${p.slug}` } } : {};
}

export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const p = policies.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <div className="container-page pt-6 pb-16 lg:pt-10 lg:pb-24">
      <PageHeader eyebrow="Policies" title={p.title} intro={p.intro} crumbs={[{ name: "Home", href: "/" }, { name: "Help", href: "/help" }, { name: p.title, href: `/policies/${p.slug}` }]} />
      <div className="mt-10 flex max-w-3xl flex-col gap-8">
        {p.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-h3">{s.heading}</h2>
            <ul className="mt-3 flex flex-col gap-2 text-body text-ink-2">
              {s.body.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
        {p.pending && <PendingContent>{p.pending}</PendingContent>}
      </div>
    </div>
  );
}
