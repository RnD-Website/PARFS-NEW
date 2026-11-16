import Image from "next/image";
import Link from "next/link";
import { services } from "@/content/home";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Services() {
  return (
    <section aria-labelledby="services-title" className="container-page py-14 lg:py-[120px]">
      <div className="mx-auto flex max-w-[641px] flex-col items-center gap-4 text-center">
        <Eyebrow>{services.eyebrow.toUpperCase()}</Eyebrow>
        <h2 id="services-title" className="text-h1">
          {services.title.before}
          <span className="text-orange">{services.title.highlight}</span>
          {services.title.after}
        </h2>
        <p className="max-w-[600px] text-body text-ink-2">{services.subtitle}</p>
      </div>
      <ul className="no-scrollbar mt-10 flex snap-x gap-4 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible lg:mt-[50px] lg:grid-cols-5 lg:gap-5">
        {services.items.map((s) => (
          <li key={s.title} className="w-[240px] shrink-0 snap-start md:w-auto">
            <Link
              href={s.href}
              className="group flex h-[260px] flex-col items-center justify-between rounded-[24px] border border-line bg-card px-6 py-8 text-center transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-[0_16px_32px_rgba(28,26,23,0.08)] lg:h-[300px]"
            >
              <span className="text-h4">{s.title}</span>
              <Image src={s.image} alt="" width={128} height={128} className="size-28 transition-transform duration-500 group-hover:scale-105 lg:size-32" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
