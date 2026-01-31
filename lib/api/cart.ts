import { CartItem } from "@/app/stores/cart";
import { apiRequest, unwrapEnvelope } from "./fetcher";
import { unwrapSingle } from "./normalizers";
import { ServerCartItem, ServerCartResponse } from "../validations/cart-schema";

const CART_ENDPOINT = "/carts";

export const mapServerCartItemsToLocal = (
  items: ServerCartItem[],
): CartItem[] => {
  return items.map((item) => ({
    id: item.productId,
    name: item.name,
    slug: item.slug,
    price: item.price,
    imageUrl: item.imageUrl,
    category: item.category,
    qty: item.qty,
    cartItemId: item.id,
  }));
};

/* =======================
    API Calls
======================= */

/**
 * GET /carts/detail
 */
export const getCartByUser = async (): Promise<ServerCartResponse | null> => {
  try {
    const payload = await apiRequest<ServerCartResponse>(
      `${CART_ENDPOINT}/detail`,
    );
    // Menggunakan unwrapSingle jika payload dibungkus envelope atau langsung return null jika 404
    return unwrapSingle<ServerCartResponse>(payload);
  } catch (error) {
    // Menangani error 404 sebagai null sesuai logika awal kamu
    return null;
  }
};

/**
 * POST /carts
 * Replace full cart
 */
export const replaceCart = async (
  items: { productId: string; qty: number; price: number }[],
) => {
  const envelope = await apiRequest<ServerCartResponse>(CART_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return unwrapEnvelope(envelope, "Failed to replace cart");
};

/**
 * POST /carts/items/:productId/increment
 * Add item atau increment
 */
export const addToCart = async (
  productId: string,
  qty: number,
  price: number,
) => {
  const envelope = await apiRequest<any>(
    `${CART_ENDPOINT}/items/${productId}`,
    { productId, qty, price },
  );
  return unwrapEnvelope(envelope, "Failed to add to cart");
};

/**
 * PATCH /carts/items/:productId
 */
export const updateCartQty = async (productId: string, qty: number) => {
  const envelope = await apiRequest<any>(
    `${CART_ENDPOINT}/items/${productId}`,
    { qty },
    { method: "PATCH" },
  );
  return unwrapEnvelope(envelope, "Failed to update quantity");
};

/**
 * POST /carts/items/:productId/increment
 */
export const incrementCartItem = async (productId: string) => {
  const envelope = await apiRequest<any>(
    `${CART_ENDPOINT}/items/${productId}/increment`,
    {
      method: "POST",
    },
  );
  return unwrapEnvelope(envelope, "Failed to increment item");
};

/**
 * POST /carts/items/:productId/decrement
 */
export const decrementCartItem = async (productId: string) => {
  const envelope = await apiRequest<any>(
    `${CART_ENDPOINT}/items/${productId}/decrement`,
    {
      method: "POST",
    },
  );
  return unwrapEnvelope(envelope, "Failed to decrement item");
};

/**
 * DELETE /carts/items/:productId
 */
export const removeCartItem = async (productId: string) => {
  const envelope = await apiRequest<any>(
    `${CART_ENDPOINT}/items/${productId}`,
    {
      method: "DELETE",
    },
  );
  return unwrapEnvelope(envelope, "Failed to remove item");
};

/**
 * DELETE /carts
 */
export const clearCart = async () => {
  const envelope = await apiRequest<any>(CART_ENDPOINT, {
    method: "DELETE",
  });
  return unwrapEnvelope(envelope, "Failed to clear cart");
};

/**
 * GET /carts/count
 */
export const getCartCount = async (): Promise<{ count: number }> => {
  const payload = await apiRequest<{ count: number }>(`${CART_ENDPOINT}/count`);
  const data = unwrapSingle<{ count: number }>(payload);
  return data || { count: 0 };
};
