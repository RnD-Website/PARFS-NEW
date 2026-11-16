"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { faqPage, faqTopics } from "@/content/parfs-faq";
import { cn } from "@/lib/utils/cn";
import { scrollToTarget } from "../motion/smooth-scroll";
import { ParfsButton } from "../ui/parfs-button";

const SERVICE_LINKS = [
  { label: "Contact us", href: "/contact" },
  { label: "Shipping", href: "/legal/shipping" },
  { label: "Returns & refunds", href: "/legal/returns" },
  { label: "Privacy policy", href: "/legal/privacy" },
];

/**
 * PARFS FAQ page — after jomalone.com/customer-service/faq: a sticky sidebar of customer-service links
 * (here, the FAQ topics plus the service pages) and, on the right, the title, intro and questions in
 * tinted rows that open one at a time with a +. PARFS type: Italiana titles, mono labels, Helvetica Now.
 */
export function FaqView() {
  const [open, setOpen] = useState<string | null>(`${faqTopics[0].id}-0`);
  const [active, setActive] = useState(faqTopics[0].id);

  // Highlight the topic currently in view.
  useEffect(() => {
    const sections = faqTopics.map((t) => document.getElementById(`faq-${t.id}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id.replace("faq-", ""));
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const goTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(`faq-${id}`);
    if (el) scrollToTarget(el.getBoundingClientRect().top + window.scrollY - 150);
  };

  return (
    <div className="bg-p-paper text-p-text">
      <div className="mx-auto grid max-w-[1920px] gap-80 px-40 pt-160 pb-140 max-lg:grid-cols-1 max-lg:gap-[28px] max-lg:px-[20px] max-lg:pt-[112px] max-lg:pb-[96px] lg:grid-cols-[calc(var(--spacing)*280)_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="max-lg:order-2" data-reveal="fade" data-reveal-now data-reveal-delay="0.15">
          <nav aria-label="FAQ topics" className="lg:sticky lg:top-120">
            <p className="p-mono-sm text-p-grey">Topics</p>
            <ul className="mt-16 flex flex-col gap-14 max-lg:mt-[14px] max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-[16px] max-lg:gap-y-[10px]">
              {faqTopics.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#faq-${t.id}`}
                    onClick={goTo(t.id)}
                    aria-current={active === t.id ? "true" : undefined}
                    className={cn("p-mono transition-colors", active === t.id ? "text-p-text underline underline-offset-4" : "text-p-grey hover:text-p-text")}
                  >
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-40 border-t border-p-text/12 pt-24 p-mono-sm text-p-grey max-lg:mt-[28px] max-lg:pt-[20px]">Customer service</p>
            <ul className="mt-16 flex flex-col gap-14 max-lg:mt-[14px] max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-[16px] max-lg:gap-y-[10px]">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="p-mono text-p-grey transition-colors hover:text-p-text">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <div className="max-lg:order-1">
          <header data-reveal="fade" data-reveal-now>
            <h1 className="font-italiana fs-64 leading-[1] uppercase max-lg:text-[40px]">{faqPage.title}</h1>
            <p className="mt-20 max-w-640 p-body fs-17 leading-[1.55] text-p-text/75 max-lg:mt-[16px] max-lg:text-[16px]">{faqPage.intro}</p>
          </header>

          {faqTopics.map((t, ti) => (
            <section key={t.id} id={`faq-${t.id}`} aria-labelledby={`faq-${t.id}-title`} className="mt-64 scroll-mt-120 max-lg:mt-[48px]" data-reveal="fade" data-reveal-now={ti === 0 ? "" : undefined} data-reveal-delay={ti === 0 ? "0.1" : undefined}>
              <h2 id={`faq-${t.id}-title`} className="flex gap-10 p-mono">
                <span className="text-p-grey">[{String(ti + 1).padStart(2, "0")}]</span>
                <span>{t.title}</span>
              </h2>
              <ul className="mt-16 flex flex-col gap-8 max-lg:mt-[14px] max-lg:gap-[8px]">
                {t.items.map((item, i) => {
                  const key = `${t.id}-${i}`;
                  const isOpen = open === key;
                  return (
                    <li key={key} className={cn("bg-p-sand/70 transition-colors duration-500", isOpen && "bg-p-sand")}>
                      <h3>
                        <button
                          type="button"
                          id={`${key}-q`}
                          aria-expanded={isOpen}
                          aria-controls={`${key}-a`}
                          onClick={() => setOpen(isOpen ? null : key)}
                          className="flex w-full items-center justify-between gap-24 px-24 py-20 text-left max-lg:gap-[16px] max-lg:px-[18px] max-lg:py-[18px]"
                        >
                          <span className="p-body fs-17 leading-[1.4] text-p-text max-lg:text-[16px]">{item.q}</span>
                          <span aria-hidden className="relative size-14 shrink-0 max-lg:size-[14px]">
                            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-p-text" />
                            <span className={cn("absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-p-text transition-transform duration-500 ease-out-expo", isOpen && "scale-y-0")} />
                          </span>
                        </button>
                      </h3>
                      <div id={`${key}-a`} role="region" aria-labelledby={`${key}-q`} className={cn("grid transition-[grid-template-rows] duration-500 ease-out-expo", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                        <div className="overflow-hidden">
                          <div className="flex max-w-720 flex-col gap-10 px-24 pb-24 p-body fs-15 leading-[1.65] text-p-text/75 max-lg:gap-[10px] max-lg:px-[18px] max-lg:pb-[20px] max-lg:text-[15px]">
                            {item.a.map((p) => (
                              <p key={p.slice(0, 32)}>{p}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Still need help */}
          <div className="mt-80 flex flex-col items-start gap-20 border-t border-p-text/12 pt-48 max-lg:mt-[56px] max-lg:gap-[18px] max-lg:pt-[36px]" data-reveal="fade">
            <p className="font-italiana fs-40 leading-[1.05] max-lg:text-[32px]">Still have a question?</p>
            <p className="max-w-520 p-body fs-16 leading-[1.55] text-p-text/75 max-lg:text-[16px]">Our Client Advisors will be delighted to help — by phone, by email or in a private consultation.</p>
            <ParfsButton theme="dark" href="/contact">
              Contact us
            </ParfsButton>
          </div>
        </div>
      </div>
    </div>
  );
}
