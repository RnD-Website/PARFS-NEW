import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { helpTopics } from "@/content/policies";
import { PageHeader } from "@/components/content/page-header";
import { PendingContent } from "@/components/ui/pending-content";
import { ButtonLink } from "@/components/ui/button";

export function generateStaticParams() {
  return helpTopics.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/help/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  const t = helpTopics.find((x) => x.slug === topic);
  return t ? { title: t.title } : {};
}

export default async function HelpTopicPage({ params }: PageProps<"/help/[topic]">) {
  const { topic } = await params;
  const t = helpTopics.find((x) => x.slug === topic);
  if (!t) notFound();
  return (
    <div className="container-page pt-6 pb-16 lg:pt-10 lg:pb-24">
      <PageHeader eyebrow="Services" title={t.title} crumbs={[{ name: "Home", href: "/" }, { name: "Help", href: "/help" }, { name: t.title, href: `/help/${t.slug}` }]} />
      <div className="mt-8 flex max-w-2xl flex-col gap-6">
        <PendingContent>{t.pending}</PendingContent>
        <p className="text-body text-ink-2">Questions in the meantime? Our team and GASENOS AI are happy to help.</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/contact">Contact us</ButtonLink>
          <ButtonLink href="/assistant" variant="ai">
            Ask GASENOS AI
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
