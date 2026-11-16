import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Icon } from "@/components/icons/icon";
import { site } from "@/content/site";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-cream">
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Logo />
          <p className="flex items-center gap-2 text-body-sm font-semibold">
            <Icon name="lock" size={18} /> Secure checkout
          </p>
          <Link href="/cart" className="hidden text-body-sm font-semibold underline-offset-4 hover:underline sm:block">
            Back to cart
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line py-6 text-center text-caption text-ink-muted">
        © {new Date().getFullYear()} {site.legalName} ·{" "}
        <Link href="/policies/terms" className="hover:underline">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/policies/privacy" className="hover:underline">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/policies/returns" className="hover:underline">
          Returns
        </Link>
      </footer>
    </div>
  );
}
