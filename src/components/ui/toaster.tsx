"use client";

import Link from "next/link";
import { useUI } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismissToast);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4 sm:top-auto sm:right-6 sm:bottom-6 sm:left-auto sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-2xl bg-ink p-4 text-white shadow-xl"
        >
          <Icon
            name={t.tone === "error" ? "alert" : "check-circle"}
            size={20}
            className={cn("mt-0.5 shrink-0", t.tone === "error" ? "text-orange-soft" : "text-[#7be3a4]")}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold">{t.title}</p>
            {t.description && <p className="mt-0.5 text-body-sm text-dark-muted">{t.description}</p>}
            {t.action && (
              <Link href={t.action.href} onClick={() => dismiss(t.id)} className="mt-2 inline-block text-body-sm font-semibold text-orange-soft underline-offset-4 hover:underline">
                {t.action.label}
              </Link>
            )}
          </div>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded-full p-1 text-dark-muted hover:bg-white/10 hover:text-white">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
