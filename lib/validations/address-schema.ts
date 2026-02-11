import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(2, "Label must be at least 2 characters"),
  recipientName: z.string().min(2, "Recipient name is required"),
  recipientPhone: z.string().min(5, "Phone number is required"),
  street: z.string().min(5, "Street address is required"),
  subdistrict: z.string().min(2, "Subdistrict is required"),
  district: z.string().min(2, "District is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z
    .string()
    .min(5, "Postal code must be at least 5 characters")
    .max(5, "Postal code cannot exceed 5 characters"),
  isPrimary: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
