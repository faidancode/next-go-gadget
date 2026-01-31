import { z } from "zod";

export const ServerCartItemSchema = z.object({
  id: z.string(), // cart_item_id
  productId: z.string(),
  name: z.string(),
  slug: z.string(),
  price: z.number(), // cents
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  qty: z.number().int().min(1),
});

export const ServerCartResponseSchema = z.object({
  id: z.string(),
  items: z.array(ServerCartItemSchema),
  totalItems: z.number().optional(),
});

// Infer type dari schema agar sinkron otomatis
export type ServerCartItem = z.infer<typeof ServerCartItemSchema>;
export type ServerCartResponse = z.infer<typeof ServerCartResponseSchema>;