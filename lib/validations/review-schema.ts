import { z } from "zod";

export const reviewSchema = z
  .object({
    rating: z.coerce.number().min(1, "Please select at least 1 star").max(5),
    title: z
      .string()
      .trim()
      .max(120, "Title must be at most 120 characters")
      .optional(),
    body: z.string().trim().min(10, "Review must be at least 10 characters"),
  })
  .transform((value) => ({
    ...value,
    title:
      value.title && value.title.trim().length > 0
        ? value.title.trim()
        : undefined,
    body: value.body.trim(),
  }));

export type ReviewFormValues = z.input<typeof reviewSchema>;
