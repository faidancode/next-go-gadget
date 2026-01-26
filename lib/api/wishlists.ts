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
  product?: Product | null;
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

async function createWishlist(payload: {
  userId: string;
  items: WishlistItemInput[];
}) {
  const response = await apiRequest<unknown>(WISHLIST_ENDPOINT, payload, {
    method: "POST",
  });
  return unwrapSingle<Wishlist>(response);
}

async function updateWishlist(
  wishlistId: string,
  payload: { items: WishlistItemInput[] },
) {
  const response = await apiRequest<unknown>(
    `${WISHLIST_ENDPOINT}/${wishlistId}`,
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
      `${WISHLIST_ENDPOINT}/detail?${search}`,
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
  userId: string,
  productId: string,
  options?: { wishlist?: Wishlist | null },
): Promise<Wishlist | null> {
  if (!userId || !productId) {
    throw new Error("userId and productId are required");
  }
  const existing = options?.wishlist ?? (await getWishlistByUser());
  const nextProductIds = extractProductIds(existing);
  if (!nextProductIds.includes(productId)) {
    nextProductIds.push(productId);
  }
  const items = convertToInputs(nextProductIds);

  if (!existing) {
    return createWishlist({ userId, items });
  }
  return updateWishlist(existing.id, { items });
}

export async function removeProductFromWishlist(
  userId: string,
  productId: string,
  options?: { wishlist?: Wishlist | null; wishlistItemId?: string | null },
): Promise<Wishlist | null> {
  if (!userId || !productId) {
    throw new Error("userId and productId are required");
  }
  const existing = options?.wishlist ?? (await getWishlistByUser());
  const wishlistItemId =
    options?.wishlistItemId ??
    existing?.items?.find((item) => item.productId === productId)?.id ??
    (await checkWishlistStatus(productId)).wishlistItemId ??
    null;

  if (!wishlistItemId) {
    return existing ?? null;
  }

  await apiRequest<unknown>(
    `${WISHLIST_ENDPOINT}/items/${wishlistItemId}`,
    undefined,
    {
      method: "DELETE",
    },
  );

  return getWishlistByUser();
}
