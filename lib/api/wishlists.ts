import { Product } from "@/types/product";
import { apiRequest, ApiError, buildQueryString } from "./fetcher";
import { unwrapSingle } from "./normalizers";

const WISHLIST_ENDPOINT = "/wishlists";

export type WishlistItem = {
  id: string;
  wishlistId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product?: Product;
};

export type Wishlist = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WishlistItem[];
};

type WishlistItemInput = {
  productId: string;
};

export type WishlistCheckResult = {
  isWishlisted: boolean;
  wishlistItemId?: string | null;
};

function normalizeWishlistCheck(payload: unknown): WishlistCheckResult {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data
  ) {
    const nested = (payload as { data?: unknown }).data;
    return normalizeWishlistCheck(nested);
  }

  if (payload && typeof payload === "object") {
    const result = payload as {
      isWishlisted?: boolean;
      wishlistItemId?: string | null;
    };
    return {
      isWishlisted: Boolean(result.isWishlisted),
      wishlistItemId: result.wishlistItemId ?? null,
    };
  }

  return { isWishlisted: false, wishlistItemId: null };
}

export async function checkWishlistStatus(
  productId: string,
): Promise<WishlistCheckResult> {
  if (!productId) {
    return { isWishlisted: false, wishlistItemId: null };
  }

  const query = buildQueryString({ productId });
  const payload = await apiRequest<unknown>(`/wishlists/check?${query}`);

  return normalizeWishlistCheck(payload);
}

async function createWishlist(payload: { productId: string }) {
  const response = await apiRequest<unknown>(
    `${WISHLIST_ENDPOINT}/items/${payload.productId}`,
    payload,
    {
      method: "POST",
    },
  );
  return unwrapSingle<Wishlist>(response);
}

async function updateWishlist(payload: { productId: string }) {
  const response = await apiRequest<unknown>(
    `${WISHLIST_ENDPOINT}/items/${payload.productId}`,
    payload,
    {
      method: "PATCH",
    },
  );
  return unwrapSingle<Wishlist>(response);
}

function convertToInputs(productIds: string[]): WishlistItemInput[] {
  return Array.from(new Set(productIds.filter(Boolean))).map((productId) => ({
    productId,
  }));
}

function extractProductIds(wishlist?: Wishlist | null) {
  if (!wishlist || !Array.isArray(wishlist.items)) {
    return [];
  }
  return wishlist.items.map((item) => item.productId).filter(Boolean);
}

export async function getWishlistByUser(options?: {
  sort?: "newest" | "highest" | "lowest" | string;
}): Promise<Wishlist | null> {
  const query = buildQueryString({ sort: options?.sort });
  const search = query ? `${query}` : "";
  try {
    const payload = await apiRequest<unknown>(
      `${WISHLIST_ENDPOINT}/items?${search}`,
    );
    return unwrapSingle<Wishlist>(payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function addProductToWishlist(
  productId: string,
): Promise<Wishlist | null> {
  if (!productId) {
    throw new Error("userId and productId are required");
  }

  return createWishlist({ productId });
}

export async function removeProductFromWishlist(
  productId: string,
): Promise<Wishlist | null> {
  await apiRequest<unknown>(
    `${WISHLIST_ENDPOINT}/items/${productId}`,
    undefined,
    {
      method: "DELETE",
    },
  );

  return getWishlistByUser();
}
