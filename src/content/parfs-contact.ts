import { parfsFooter } from "./parfs-home";

/**
 * PARFS contact page (/contact), structured after dior.com's client-service page.
 * Opening hours, reply times and the delivery/returns promises below are PLACEHOLDERS — confirm before launch.
 * Phone and email come from the footer content so they stay in one place.
 */
export const contactPage = {
  title: "Contact",
  intro: "Our Client Advisors are available Monday to Friday, 9am – 7pm, and Saturday, 10am – 6pm (ET).",
  sub: "They will be delighted to help with your order, guide you to a signature scent or arrange a private consultation.",

  channels: [
    {
      no: "01",
      title: "Call us",
      text: "Speak with a Client Advisor for personal advice.",
      action: { label: parfsFooter.contact.phone, href: `tel:${parfsFooter.contact.phone.replace(/\s/g, "")}` },
      note: "Monday to Friday, 9am – 7pm · Saturday, 10am – 6pm (ET).",
    },
    {
      no: "02",
      title: "Email us",
      text: "Write to us at any time — we reply within one business day.",
      action: { label: parfsFooter.contact.email, href: `mailto:${parfsFooter.contact.email}` },
      note: "For press and partnerships, mention it in your subject line.",
    },
  ],

  order: {
    no: "03",
    title: "Your order",
    text: "Check the contents of your order, track its status, or request a return.",
    sub: "Placed an order as a guest? Enter the details from your confirmation email.",
  },

  services: [
    {
      title: "Private consultation",
      text: "Book a one-to-one session with a fragrance specialist — in person or by video — to find the scent that moves with you.",
      cta: "Book a consultation",
      href: "#write-us",
      subject: "Private consultation",
    },
    {
      title: "Frequently asked questions",
      text: "Answers about orders, payment, engraving and caring for your fragrance.",
      cta: "See all FAQs",
      href: "/faq",
    },
    {
      title: "Delivery & returns",
      text: "Complimentary standard delivery, dispatch within one business day and free returns within 30 days.",
      cta: "Delivery & returns",
      href: "/legal/shipping",
    },
    {
      title: "The Maison newsletter",
      text: "Be the first to discover new creations, private launches and rituals from the Maison.",
      cta: "Sign up",
      href: "#newsletter",
    },
  ],

  form: {
    title: "Write to us",
    text: "Tell us how we can help and a Client Advisor will reply by email.",
    titles: ["Ms", "Mr", "Mx", "Prefer not to say"],
    countries: ["United States", "Canada", "United Kingdom", "France", "Germany", "Italy", "Spain", "United Arab Emirates", "Australia", "Other"],
    subjects: ["My order", "Product advice", "Private consultation", "Returns & refunds", "Engraving & gifting", "Press & partnerships", "Other"],
    messageMax: 600,
  },
};
