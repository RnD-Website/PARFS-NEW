import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { legalEntity, legalPages } from "@/content/parfs-legal";
import { cn } from "@/lib/utils/cn";

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: { absolute: `${page.title} — PARFS` },
    description: page.intro,
    alternates: { canonical: `/legal/${page.slug}` },
  };
}

/**
 * PARFS legal page — after byredo.com's terms page: one narrow centred column, an upper-case title,
 * then numbered "Article N — Title" sections in plain running text. PARFS type: Italiana title,
 * mono labels, Helvetica Now body; the other legal pages sit in a row under the title.
 */
export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <article className="bg-p-paper px-40 pt-160 pb-160 text-p-text max-lg:px-[20px] max-lg:pt-[112px] max-lg:pb-[96px]">
      <div className="mx-auto max-w-680">
        <header data-reveal="fade" data-reveal-now>
          <h1 className="font-italiana fs-48 leading-[1.05] tracking-[0.02em] uppercase max-lg:text-[34px]">{page.title}</h1>
          <p className="mt-14 p-mono-sm text-p-grey max-lg:mt-[12px]">Last updated — {legalEntity.updated}</p>
          <nav aria-label="Legal" className="mt-28 flex flex-wrap gap-x-20 gap-y-8 border-y border-p-text/12 py-14 max-lg:mt-[24px] max-lg:gap-x-[16px] max-lg:gap-y-[8px] max-lg:py-[12px]">
            {legalPages.map((p) => (
              <Link
                key={p.slug}
                href={`/legal/${p.slug}`}
                aria-current={p.slug === page.slug ? "page" : undefined}
                className={cn("p-mono-sm transition-colors", p.slug === page.slug ? "text-p-text underline underline-offset-4" : "text-p-grey hover:text-p-text")}
              >
                {p.nav}
              </Link>
            ))}
          </nav>
        </header>

        <div className="mt-36 p-body fs-15 leading-[1.65] text-p-text/80 max-lg:mt-[28px] max-lg:text-[15px]" data-reveal="fade" data-reveal-now data-reveal-delay="0.15">
          {page.intro && <p className="text-p-text">{page.intro}</p>}
          {page.articles.map((a, i) => (
            <section key={a.title} className="mt-32 max-lg:mt-[28px]">
              <h2 className="font-medium text-p-text">
                Article {i + 1} — {a.title}
              </h2>
              {a.body.map((para) => (
                <p key={para.slice(0, 40)} className="mt-10 max-lg:mt-[10px]">
                  {para}
                </p>
              ))}
            </section>
          ))}
          <p className="mt-48 border-t border-p-text/12 pt-20 max-lg:mt-[40px] max-lg:pt-[18px]">
            Questions about this page? Write to{" "}
            <a href={`mailto:${legalEntity.email}`} className="text-p-text underline underline-offset-4 hover:text-p-gold">
              {legalEntity.email}
            </a>
            .
          </p>
        </div>
      </div>
    </article>
  );
}
