import { z } from "zod";

export const BD_PHONE = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.email("Enter a valid email address").trim().toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(BD_PHONE, "Enter a valid Bangladeshi mobile number, e.g. 01XXXXXXXXX")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export const forgotSchema = z.object({ email: z.email("Enter a valid email address").trim().toLowerCase() });

export const resetSchema = z
  .object({
    token: z.string().min(10),
    password: registerSchema.shape.password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

export const profileSchema = z.object({
  name: registerSchema.shape.name,
  phone: registerSchema.shape.phone,
});

export const addressSchema = z.object({
  label: z.string().trim().max(30).optional().or(z.literal("")),
  fullName: z.string().trim().min(2, "Enter the recipient's name").max(80),
  phone: z.string().trim().regex(BD_PHONE, "Enter a valid Bangladeshi mobile number"),
  line1: z.string().trim().min(3, "Enter the street address").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter the city").max(80),
  district: z.string().trim().min(2, "Select the district"),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;
