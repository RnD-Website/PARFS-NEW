"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Icon, type IconName } from "@/components/icons/icon";
import { useUI } from "@/stores/ui";
import { useSession } from "@/stores/session";
import { mainNav } from "@/content/site";
import { cn } from "@/lib/utils/cn";

const categoryLinks = [
  { label: "Electronics", href: "/shop/electronics" },
  { label: "Fashion", href: "/shop/fashion" },
  { label: "Home & Living", href: "/shop/home-living" },
  { label: "Beauty", href: "/shop/beauty" },
  { label: "Footwear", href: "/shop/footwear" },
  { label: "Audio", href: "/shop/audio" },
];

export function MobileNav() {
  const open = useUI((s) => s.navOpen);
  const setOpen = useUI((s) => s.setNavOpen);
  const openAssistant = useUI((s) => s.openAssistant);
  const user = useSession((s) => s.user);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);

  const accountLinks: { label: string; href: string; icon: IconName }[] = user
    ? [
        { label: "My account", href: "/account", icon: "user" },
        { label: "Orders", href: "/account/orders", icon: "package" },
        { label: "Wishlist", href: "/wishlist", icon: "heart" },
      ]
    : [
        { label: "Sign in", href: "/account/login", icon: "user" },
        { label: "Create account", href: "/account/register", icon: "add" },
        { label: "Wishlist", href: "/wishlist", icon: "heart" },
      ];

  return (
    <Drawer open={open} onOpenChange={setOpen} title="Menu" side="left">
      <nav aria-label="Mobile" className="flex flex-col gap-8 px-5 pb-8">
        <button
          type="button"
          onClick={() => openAssistant()}
          className="flex items-center gap-3 rounded-[20px] bg-violet p-4 text-left text-white transition-colors hover:bg-[#5a3df0]"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white text-violet">
            <Icon name="sparkles" size={20} />
          </span>
          <span>
            <span className="block text-label">Ask GASENOS AI</span>
            <span className="block text-caption text-white/80">Not sure what to buy? Just ask.</span>
          </span>
        </button>

        <ul className="flex flex-col">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-between border-b border-line py-3.5 font-display text-[24px] font-extrabold tracking-[-0.02em]",
                  pathname.startsWith(item.href) && "text-orange-text",
                )}
              >
                {item.label}
                <Icon name="arrow-right" size={20} />
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <p className="mb-3 text-eyebrow text-orange-text">( Categories )</p>
          <ul className="grid grid-cols-2 gap-2">
            {categoryLinks.map((c) => (
              <li key={c.href}>
                <Link href={c.href} className="block rounded-xl bg-card px-3.5 py-3 text-body-sm font-semibold transition-colors hover:bg-muted">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <ul className="flex flex-col gap-1">
          {accountLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-body transition-colors hover:bg-ink/5">
                <Icon name={l.icon} size={20} /> {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/track-order" className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-body transition-colors hover:bg-ink/5">
              <Icon name="truck" size={20} /> Track an order
            </Link>
          </li>
        </ul>
      </nav>
    </Drawer>
  );
}
