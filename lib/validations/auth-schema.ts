import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),

    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name is too long"),

    // Phone dibuat opsional agar sinkron dengan database (NULLABLE)
    // Namun jika diisi, minimal harus 10 karakter
    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 characters")
      .max(15, "Phone number is too long")
      .regex(/^[0-9+]+$/, "Invalid phone format") // Hanya angka dan tanda +
      .optional()
      .or(z.literal("")), // Menangani string kosong agar tidak error saat validasi

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

// Type inference untuk TypeScript
export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Email is not valid"),
  password: z
    .string({ message: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.email("Please input valid email"),
});

export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Minimal 8 characters required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const resendEmailSchema = z.object({
  email: z.email("Please input valid email"),
});

export type ResendEmailInput = z.infer<typeof resendEmailSchema>;
