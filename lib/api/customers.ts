import { z } from "zod";
import { apiRequest } from "./fetcher";
import { unwrapSingle } from "./normalizers";
import type { User } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const updateProfileInputSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    password: z
      .string()
      .optional()
      .transform((val) => (val ?? "").trim())
      .refine(
        (val) => val.length === 0 || val.length >= 6,
        "Password must be at least 6 characters"
      )
      .transform((val) => (val.length === 0 ? undefined : val)),
    confirmPassword: z
      .string()
      .optional()
      .transform((val) => (val ?? "").trim()),
  })
  .superRefine((val, ctx) => {
    if (val.password && val.confirmPassword !== val.password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  })
  .transform((val) => ({
    name: val.name.trim(),
    password: val.password,
  }));

export type UpdateProfileInput = z.input<typeof updateProfileInputSchema>;
export type UpdateProfilePayload = z.output<typeof updateProfileInputSchema>;

export async function updateCustomerProfile(
  input: UpdateProfileInput
): Promise<User | null> {
  const payload = updateProfileInputSchema.parse(input);
  const res = await apiRequest<unknown>("/customers/profile", payload, {
    method: "PATCH",
  });
  return unwrapSingle<User>(res);
}

export function useUpdateCustomerProfile() {
  return useMutation({
    mutationFn: updateCustomerProfile,
  });
}
