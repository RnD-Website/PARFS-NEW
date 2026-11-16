"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";
import { useCart, type CartLine } from "@/stores/cart";
import { QuantityStepper } from "@/components/ui/quantity";
import { Icon } from "@/components/icons/icon";
import { MAX_PER_LINE } from "@/stores/cart";

export function CartLineItem({ line, compact, onNavigate }: { line: CartLine; compact?: boolean; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const href = `/products/${line.slug}`;
  return (
    <li className="flex gap-4 py-4">
      <Link
        href={href}
        onClick={onNavigate}
        className={cn("relative shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-muted", compact ? "size-[84px]" : "size-24 sm:size-28")}
      >
        {line.image && <Image src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} onClick={onNavigate} className="text-label line-clamp-2 hover:underline hover:underline-offset-4">
              {line.name}
            </Link>
            {line.variantTitle && <p className="text-caption text-ink-muted">{line.variantTitle}</p>}
          </div>
          <p className="text-[15px] font-bold whitespace-nowrap tabular-nums">{formatMoney(line.unitPrice * line.quantity, line.currency)}</p>
        </div>
        {line.quantity > 1 && (
          <p className="text-caption text-ink-muted tabular-nums">{formatMoney(line.unitPrice, line.currency)} each</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            max={Math.min(MAX_PER_LINE, line.maxQuantity)}
            onChange={(q) => setQuantity(line.id, q)}
            label={`Quantity for ${line.name}`}
          />
          <button
            type="button"
            onClick={() => remove(line.id)}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-caption font-semibold text-ink-muted transition-colors hover:bg-ink/5 hover:text-danger"
          >
            <Icon name="trash" size={16} /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
