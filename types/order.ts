import { OrderItem } from "./order-item";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID";

export type OrderAddressSnapshot = {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  subdistrict?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;

  status: string;
  paymentMethod: string;
  paymentStatus: string;

  addressSnapshot: OrderAddressSnapshot;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  note?: string | null;
  placedAt: string;
  paidAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  receiptNo?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  items: OrderItem[];
};
