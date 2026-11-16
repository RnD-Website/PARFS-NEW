import { z } from "zod";
import { BD_PHONE } from "@/lib/auth/schemas";

export const checkoutSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  name: z.string().trim().min(2, "Enter the recipient's full name").max(80),
  phone: z.string().trim().regex(BD_PHONE, "Enter a valid Bangladeshi mobile number, e.g. 01XXXXXXXXX"),
  line1: z.string().trim().min(3, "Enter the street address").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter the city or upazila").max(80),
  district: z.string().trim().min(2, "Select your district"),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  deliveryMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "CARD"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const checkoutRequestSchema = z.object({
  details: checkoutSchema,
  lines: z.array(z.object({ variantId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
});

export const trackSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
  email: z.email("Enter the email used at checkout").trim().toLowerCase(),
});
