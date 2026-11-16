import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/content/site";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import { AssistantPanel } from "@/components/ai/assistant-panel";

const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], weight: ["700", "800", "900"], variable: "--font-archivo", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/images/hero/hero-sneaker.png", width: 686, height: 744, alt: "GASENOS" }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ff4d1a",
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
          <AssistantPanel />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
