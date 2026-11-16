import { parfsReviews } from "@/content/parfs-home";

/** Client reviews — the ones that mention this scent first. (No star scores until real review data exists.) */
export function PdpReviews({ productName }: { productName: string }) {
  const items = [...parfsReviews.items].sort((a, b) => Number(b.text.includes(productName)) - Number(a.text.includes(productName)));
  return (
    <section className="bg-[linear-gradient(to_bottom,var(--p-paper)_0%,var(--p-sand)_min(420px,45%))] px-40 pt-72 pb-120 text-p-text max-lg:px-[20px] max-lg:pt-[48px] max-lg:pb-[80px]">
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col items-center gap-14 text-center max-lg:gap-[12px]">
          <p className="p-mono text-p-gold">{parfsReviews.eyebrow}</p>
          <h2 className="font-italiana fs-64 leading-none text-p-gold max-lg:text-[40px]" data-reveal="fade">
            Reviews that linger
          </h2>
        </div>
        <ul className="mt-56 grid gap-20 max-lg:mt-[36px] max-lg:grid-cols-1 max-lg:gap-[16px] lg:grid-cols-3">
          {items.map((r, i) => (
            <li key={r.name} className="flex flex-col gap-20 bg-p-letter p-32 shadow-[0_24px_40px_rgba(64,51,31,0.08)] max-lg:gap-[16px] max-lg:p-[24px]" data-reveal="fade" data-reveal-delay={i * 0.1} data-reveal-y="40">
              <span aria-hidden className="font-italiana fs-28 leading-none text-p-gold">P</span>
              <blockquote className="flex-1 p-body fs-17 leading-[1.55] max-lg:text-[16px]">“{r.text}”</blockquote>
              <div className="flex items-end justify-between gap-12 border-t border-p-text/10 pt-16 max-lg:pt-[14px]">
                <span className="font-script fs-32 leading-none max-lg:text-[28px]">{r.name}</span>
                <span className="p-mono-sm text-p-text/55">{r.location}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
