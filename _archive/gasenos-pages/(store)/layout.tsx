import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { FloatingAskAI } from "@/components/ai/floating-ask-ai";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <FloatingAskAI />
      <BottomTabBar />
    </>
  );
}
