import { Order, OrderAddressSnapshot } from "@/types/order";
import { apiRequest, buildQueryString } from "./fetcher";
import { ListResult, toListResult, unwrapSingle } from "./normalizers";
import { z } from "zod";

const ORDERS_ENDPOINT = "/orders";

export type CheckoutPayload = {
  userId: string;
  addressId: string;
  paymentMethod?: string;
  shippingCents?: number;
  discountCents?: number;
  note?: string;
  initialStatus?: "PENDING" | "PAID";
};

export type CheckoutPaymentPayload = {
  snapToken: string;
  redirectUrl?: string;
};

export type CheckoutResult = {
  order: Order;
  payment: CheckoutPaymentPayload | null;
};

export type MidtransSnapTokenResponse = {
  snapToken: string;
  redirectUrl?: string;
};

function normalizeAddressSnapshot(
  order: Order | null | undefined,
): Order | null {
  if (!order) return order ?? null;
  const snapshot = order.addressSnapshot as
    | OrderAddressSnapshot
    | string
    | undefined;
  if (snapshot && typeof snapshot === "string") {
    try {
      const parsed = JSON.parse(snapshot) as OrderAddressSnapshot;
      return { ...order, addressSnapshot: parsed };
    } catch {
      return {
        ...order,
        addressSnapshot: {
          id: "",
          label: snapshot,
          recipientName: "",
          recipientPhone: "",
          street: snapshot,
        } as OrderAddressSnapshot,
      };
    }
  }
  return order;
}

function normalizeOrdersList(result: ListResult<Order>): ListResult<Order> {
  return {
    ...result,
    items: result.items.map(
      (order) => normalizeAddressSnapshot(order) ?? order,
    ),
  };
}

function normalizeCheckoutResult(
  result: CheckoutResult | null,
): CheckoutResult | null {
  if (!result) return null;
  return {
    order: normalizeAddressSnapshot(result.order) ?? result.order,
    payment: result.payment ?? null,
  };
}

export async function checkoutOrder(
  input: CheckoutPayload,
  options?: { idempotencyKey?: string },
): Promise<CheckoutResult | null> {
  if (!input?.userId || !input?.addressId) {
    throw new Error("userId and addressId are required");
  }

  const headers =
    options?.idempotencyKey && options.idempotencyKey.length > 0
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined;

  const payload = await apiRequest<unknown>(
    `${ORDERS_ENDPOINT}/checkout`,
    input,
    {
      method: "POST",
      headers,
    },
  );
  return normalizeCheckoutResult(unwrapSingle<CheckoutResult>(payload));
}

export async function listOrdersByUser(
  userId: string,
  params?: { page?: number; limit?: number; status?: string },
): Promise<ListResult<Order>> {
  if (!userId) {
    return { items: [], meta: {}, raw: null };
  }

  const statusQuery =
    params?.status && params.status.toUpperCase() !== "ALL"
      ? params.status
      : undefined;

  const query = buildQueryString({
    page: params?.page,
    limit: params?.limit,
    status: statusQuery,
  });
  const search = query ? `?${query}` : "";

  const payload = await apiRequest<unknown>(`${ORDERS_ENDPOINT}${search}`);
  return normalizeOrdersList(toListResult<Order>(payload));
}

export async function getOrderDetail(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  const payload = await apiRequest<unknown>(`${ORDERS_ENDPOINT}/${orderId}`);
  return normalizeAddressSnapshot(unwrapSingle<Order>(payload));
}

const updateStatusInputSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

const continuePaymentInputSchema = z.object({
  orderId: z.string().min(1, "orderId is required to continue payment"),
});

export async function markOrderAsCompletedByCustomer(
  orderId: string,
): Promise<Order | null> {
  const parsed = updateStatusInputSchema.parse({ orderId });
  const payload = await apiRequest<unknown>(
    `${ORDERS_ENDPOINT}/${parsed.orderId}/status/customer`,
    {},
    { method: "PATCH" },
  );
  return normalizeAddressSnapshot(unwrapSingle<Order>(payload));
}

export async function createMidtransSnapTransaction(
  orderId: string,
): Promise<MidtransSnapTokenResponse | null> {
  const parsed = continuePaymentInputSchema.parse({ orderId });
  const payload = await apiRequest<unknown>(
    `${ORDERS_ENDPOINT}/${parsed.orderId}/continue-payment`,
    { orderId: parsed.orderId },
  );

  return unwrapSingle<MidtransSnapTokenResponse>(payload);
}

export async function cancelOrderByCustomer(
  orderId: string,
): Promise<Order | null> {
  const parsed = updateStatusInputSchema.parse({ orderId });
  const payload = await apiRequest<unknown>(
    `${ORDERS_ENDPOINT}/${parsed.orderId}/cancel/customer`,
    {},
    { method: "POST" },
  );
  return normalizeAddressSnapshot(unwrapSingle<Order>(payload));
}
