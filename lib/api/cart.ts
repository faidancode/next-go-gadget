import type { Cart, CartItem, CartItem as CartItemRow } from "@/types";
import type { CartItem as LocalCartItem } from "@/app/stores/cart";
import { apiRequest } from "./fetcher";
import { unwrapSingle } from "./normalizers";

const CART_ENDPOINT = "/carts";

export type CartWithItems = Cart & {
  data?: CartItem[];
  items?: CartItem[];
};

export type CartItemInput = {
  bookId: string;
  quantity: number;
  priceCentsAtAdd: number;
};

export type CartMergeInput = {
  userId: string;
  items: CartItemInput[];  
};

export function mapLocalItemsToCartInput(items: LocalCartItem[]): CartItemInput[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }
  return items
    .filter((item) => item && item.qty > 0)
    .map((item) => ({
      bookId: item.id,
      quantity: item.qty,
      priceCentsAtAdd: item.price,
    }));
}

export function mapServerCartItemsToLocal(items?: CartItem[]): LocalCartItem[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  const localItems: LocalCartItem[] = [];

  for (const item of items) {
    if (!item) continue;
    const id = item.bookId;
    if (!id) continue;

    localItems.push({
      id,
      title: item.bookTitle ?? "Untitled",
      slug: item.bookSlug,
      author: item.bookAuthor ?? undefined,
      price: item.priceCentsAtAdd?? 0,
      coverUrl: item.bookCoverUrl ?? "",
      category: item.categoryId ?? "",
      qty: item.quantity ?? 1,
      cartItemId: item.id,
    });
  }

  return localItems;
}

export async function replaceCart(input: CartMergeInput): Promise<CartWithItems | null> {
  if (!input.userId) {
    throw new Error("userId is required");
  }
  const payload = await apiRequest<unknown>(`${CART_ENDPOINT}`, input, {
    method: "POST",
  });
  return unwrapSingle<CartWithItems>(payload);
}

// Alias untuk backward compatibility
export const syncCartWithServer = replaceCart;

export async function getCartByUser(userId: string): Promise<CartWithItems | null> {
  if (!userId) {
    return null;
  }
  const payload = await apiRequest<unknown>(`${CART_ENDPOINT}/detail`);
  return unwrapSingle<CartWithItems>(payload);
}

function parseCartCount(payload: unknown): number {
  if (typeof payload === "number") return payload;
  if (typeof payload === "string" && payload.trim().length > 0) {
    const parsed = Number(payload);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.count,
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).count
        : undefined,
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "number") {
        return candidate;
      }
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        const parsed = Number(candidate);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
  }
  throw new Error("Invalid cart count response");
}

export async function getCartCount(userId?: string): Promise<number> {
  if (!userId) {
    return 0;
  }
  const payload = await apiRequest<unknown>(`${CART_ENDPOINT}/count`);
  return parseCartCount(payload);
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartWithItems | null> {
  if (!itemId) {
    throw new Error("itemId is required");
  }
  const payload = await apiRequest<unknown>(
    `${CART_ENDPOINT}/items/${encodeURIComponent(itemId)}`,
    { quantity },
    { method: "PATCH" }
  );
  return unwrapSingle<CartWithItems>(payload);
}


