import { z } from "zod";

export const newsletterSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  consent: z.boolean().refine((v) => v, "Please tick the box so we can email you"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Add a subject").max(120),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(3000),
});
export type ContactInput = z.infer<typeof contactSchema>;
