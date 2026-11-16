import { Italiana, JetBrains_Mono, Manrope, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";
import { ParfsCartDrawer } from "@/components/parfs/cart-drawer";
import { Concierge } from "@/components/parfs/assistant/concierge";
import { ParfsHeader } from "@/components/parfs/header";
import { ParfsFooter } from "@/components/parfs/footer";
import { SmoothScroll } from "@/components/parfs/motion/smooth-scroll";

const italiana = Italiana({ subsets: ["latin"], weight: "400", variable: "--font-italiana-face", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-jetbrains", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["500"], variable: "--font-manrope-face", display: "swap" });
// Helvetica Now Display (from the designer's machine) for all running/paragraph text.
// NOTE: publishing needs a Monotype web-font licence for Helvetica Now.
const helvetica = localFont({
  src: [
    { path: "../fonts/HelveticaNowDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/HelveticaNowDisplay-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-helvetica",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-pinyon", display: "swap" });

/** PARFS storefront shell (home page for now). Other routes keep the existing store layout. */
export default function ParfsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={`parfs ${italiana.variable} ${jetbrains.variable} ${manrope.variable} ${pinyon.variable} ${helvetica.variable}`}>
        <ParfsHeader />
        <main id="main">{children}</main>
        <ParfsFooter />
        <SmoothScroll />
        <ParfsCartDrawer />
        <Concierge />
      </div>
      {/* DialKit tuning panel — hidden for now. Restore this line to bring it back: <ParfsDialRoot /> */}
    </>
  );
}
