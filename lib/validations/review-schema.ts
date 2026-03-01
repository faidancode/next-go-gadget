import { z } from "zod";

export const reviewApiSchema = z.object({
  id: z.string(),
  productId: z.string().nullable().optional(),
  productSlug: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  productImageUrl: z.string().nullable().optional(),
  rating: z.number(),
  title: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type ReviewListItem = z.infer<typeof reviewApiSchema>;

export const reviewSchema = z
  .object({
    rating: z.coerce.number().min(1, "Please select at least 1 star").max(5),
    title: z
      .string()
      .trim()
      .max(120, "Title must be at most 120 characters")
      .optional(),
    comment: z.string().trim().min(10, "Review must be at least 10 characters"),
  })
  .transform((value) => ({
    ...value,
    title:
      value.title && value.title.trim().length > 0
        ? value.title.trim()
        : undefined,
    comment: value.comment.trim(),
  }));

export type ReviewFormValues = z.input<typeof reviewSchema>;