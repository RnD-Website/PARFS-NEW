import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-orange text-white">
      <div className="container-page flex h-[72px] items-center">
        <Logo tone="light" />
      </div>
      <main id="main" className="container-page flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <p aria-hidden className="font-display text-[clamp(120px,22vw,280px)] leading-[0.8] font-black tracking-[-0.06em]">
          404
        </p>
        <h1 className="text-h2">This page wandered off.</h1>
        <p className="max-w-md text-body">The link may be broken or the product may no longer be available.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="light" arrow>
            Back to home
          </ButtonLink>
          <ButtonLink href="/shop" variant="outline-light">
            Shop all products
          </ButtonLink>
        </div>
        <Link href="/assistant" className="text-body-sm font-semibold underline underline-offset-4">
          Or ask GASENOS AI to find it
        </Link>
      </main>
    </div>
  );
}
