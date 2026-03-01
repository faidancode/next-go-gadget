export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  productSlug: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;

  createdAt: string;
  updatedAt?: string | null;
};