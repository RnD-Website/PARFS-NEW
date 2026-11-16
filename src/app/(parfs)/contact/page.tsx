import type { Metadata } from "next";
import { ContactView } from "@/components/parfs/contact/contact-view";

export const metadata: Metadata = {
  title: { absolute: "Contact — PARFS" },
  description: "Speak with a PARFS Client Advisor: call, email, track your order, book a private consultation or write to us.",
  alternates: { canonical: "/contact" },
};

/** PARFS contact page, structured after dior.com's client-service page. (The old GASENOS page is archived in _archive/gasenos-pages/(store)/_gasenos-contact.tsx.bak.) */
export default function ContactPage() {
  return <ContactView />;
}
