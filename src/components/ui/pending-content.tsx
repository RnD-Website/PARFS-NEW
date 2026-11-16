import { Icon } from "@/components/icons/icon";

/**
 * Marks copy GASENOS still needs to supply. Shown on the page so it can't be missed
 * before launch; remove once the real content is added.
 */
export function PendingContent({ children }: { children: React.ReactNode }) {
  return (
    <div role="note" className="flex items-start gap-3 rounded-2xl border-[1.5px] border-dashed border-orange/50 bg-orange/5 p-4 text-body-sm text-ink-2">
      <Icon name="info" size={18} className="mt-0.5 shrink-0 text-orange-text" />
      <div>{children}</div>
    </div>
  );
}
