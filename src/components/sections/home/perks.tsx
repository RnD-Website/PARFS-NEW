import { perks } from "@/content/home";
import { Icon, type IconName } from "@/components/icons/icon";

/** Figma "Perks" (hidden in the mockup, enabled per brief). */
export function Perks() {
  return (
    <section aria-label="Why customers shop with GASENOS" className="border-y border-line bg-cream">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-8 lg:grid-cols-4 lg:gap-6 lg:py-[60px]">
        {perks.map((p) => (
          <li key={p.title} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-image">
              <Icon name={p.icon as IconName} size={22} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-label">{p.title}</span>
              <span className="text-body-sm text-ink-muted">{p.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
