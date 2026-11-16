"use client";

import * as D from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./icon-button";

/** Side drawer / bottom sheet built on Radix Dialog (focus trap, Esc, scroll lock). */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  children,
  footer,
  className,
  hideHeader,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  side?: "right" | "left" | "bottom";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  hideHeader?: boolean;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <D.Content
          className={cn(
            "fixed z-50 flex flex-col bg-cream shadow-2xl outline-none",
            side === "right" && "inset-y-0 right-0 w-full max-w-[440px] data-[state=open]:animate-slide-in-right",
            side === "left" && "inset-y-0 left-0 w-[88%] max-w-[380px] data-[state=open]:animate-slide-in-left",
            side === "bottom" && "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[28px] data-[state=open]:animate-slide-up",
            className,
          )}
        >
          <div className={cn("flex items-center justify-between gap-4 px-5 pt-5 pb-3", hideHeader && "sr-only")}>
            <div>
              <D.Title className="text-h4">{title}</D.Title>
              {description ? (
                <D.Description className="text-body-sm text-ink-muted">{description}</D.Description>
              ) : (
                <D.Description className="sr-only">{title}</D.Description>
              )}
            </div>
            <D.Close asChild>
              <IconButton icon="close" label="Close" variant="ghost" />
            </D.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <div className="border-t border-line bg-cream px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">{footer}</div>}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
