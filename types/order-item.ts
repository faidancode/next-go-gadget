export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productCoverUrl: string;
  productSlug: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;

  createdAt: string;
  updatedAt?: string | null;
};