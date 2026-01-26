export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productCoverUrl: string;
  productAuthor: string;
  productSlug: string;
  titleSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  totalCents: number;

  createdAt: string;
  updatedAt?: string | null;
};