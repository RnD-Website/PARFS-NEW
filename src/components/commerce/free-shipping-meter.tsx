import { storePolicy } from "@/content/site";
import { formatMoney } from "@/lib/utils/money";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const threshold = storePolicy.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="rounded-2xl bg-card p-3.5">
      <p className="text-body-sm">
        {remaining > 0 ? (
          <>
            Add <strong className="tabular-nums">{formatMoney(remaining)}</strong> more for <strong>free delivery</strong>.
          </>
        ) : (
          <>
            🎉 You’ve unlocked <strong>free delivery</strong>.
          </>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
        <div className="h-full rounded-full bg-orange transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
