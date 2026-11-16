import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION = "PARFS — Maison de Parfum. Scent for every soul: eaux de parfum and extraits in weighted glass and solid brass.";

const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PARFS — Maison de Parfum", template: "%s — PARFS" },
  description: DESCRIPTION,
  applicationName: "PARFS",
  openGraph: {
    type: "website",
    siteName: "PARFS",
    locale: "en_US",
    title: "PARFS — Maison de Parfum",
    description: DESCRIPTION,
    images: [{ url: "/images/parfs/hero-center-v2.jpg", width: 716, height: 900, alt: "PARFS eau de parfum" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        {/* PARFS pages: hide scroll-reveal targets before first paint (the motion runtime adds `p-ready`);
            un-hide them if it never boots. Harmless on other pages — nothing there uses data-reveal. */}
        <Script id="parfs-reveal-gate" strategy="beforeInteractive">
          {`document.documentElement.classList.add('p-js');setTimeout(function(){if(!document.documentElement.classList.contains('p-ready'))document.documentElement.classList.remove('p-js')},4000);`}
        </Script>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
