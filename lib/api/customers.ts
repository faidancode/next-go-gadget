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
      .trim()
      .refine(
        (val) => val === "" || val.length >= 6,
        "Password must be at least 6 characters",
      ),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type UpdateProfileFormInput = z.input<typeof updateProfileInputSchema>;
export type UpdateProfilePayload = z.output<typeof updateProfileInputSchema>;

export async function updateCustomerProfile(
  input: UpdateProfileFormInput,
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
