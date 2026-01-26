import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import {
  addProductToWishlist,
  checkWishlistStatus,
  getWishlistByUser,
  removeProductFromWishlist,
  Wishlist,
  WishlistCheckResult,
} from "../api/wishlists";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";

interface WishlistMutationContext {
  prevWishlist?: Wishlist | null;
  prevCheck?: WishlistCheckResult | null;
}

// ==========================================
// 📋 GET WISHLIST
// ==========================================
export function useWishlist(
  userId?: string,
  options?: { sort?: "newest" | "highest" | "lowest" | string },
) {
  return useQuery({
    queryKey: ["wishlist", userId ?? "guest", options?.sort],
    queryFn: () => getWishlistByUser(options),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==========================================
// ✅ CHECK WISHLIST STATUS (Single Product)
// ==========================================
export function useWishlistCheck(productId?: string, userId?: string) {
  return useQuery({
    queryKey: ["wishlist-check", productId, userId ?? "guest"],
    queryFn: () => checkWishlistStatus(productId!),
    enabled: !!productId && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==========================================
// 🔄 TOGGLE WISHLIST (Add/Remove in one hook)
// ==========================================
export function useToggleWishlist(
  product: Product | null | undefined,
  userId: string | null | undefined,
  wishlist?: Wishlist | null | undefined,
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<
    Wishlist | null,
    unknown,
    "add" | "remove",
    WishlistMutationContext
  >({
    mutationFn: async (action: "add" | "remove") => {
      if (!userId || !product?.id) {
        throw new Error("User and product are required to update wishlist.");
      }

      if (action === "add") {
        return addProductToWishlist(userId, product.id, {
          wishlist: wishlist ?? null,
        });
      }

      // For remove, get wishlistItemId from cache or API
      const checkData = queryClient.getQueryData<WishlistCheckResult>([
        "wishlist-check",
        product.id,
        userId,
      ]);

      return removeProductFromWishlist(userId, product.id, {
        wishlist: wishlist ?? null,
        wishlistItemId: checkData?.wishlistItemId ?? null,
      });
    },

    onMutate: async (action) => {
      if (!userId || !product?.id) return {};

      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["wishlist", userId] });
      await queryClient.cancelQueries({
        queryKey: ["wishlist-check", product.id, userId],
      });

      // Snapshot previous values
      const prevWishlist = queryClient.getQueryData<Wishlist>([
        "wishlist",
        userId,
      ]);
      const prevCheck = queryClient.getQueryData<WishlistCheckResult>([
        "wishlist-check",
        product.id,
        userId,
      ]);

      // Optimistic update - wishlist check
      queryClient.setQueryData<WishlistCheckResult>(
        ["wishlist-check", product.id, userId],
        {
          isWishlisted: action === "add",
          wishlistItemId:
            action === "add" ? (prevCheck?.wishlistItemId ?? null) : null,
        },
      );

      return { prevWishlist, prevCheck };
    },

    onError: (error, _action, context) => {
      // Rollback on error
      if (userId && product?.id) {
        if (context?.prevWishlist !== undefined) {
          queryClient.setQueryData(["wishlist", userId], context.prevWishlist);
        }
        if (context?.prevCheck !== undefined) {
          queryClient.setQueryData(
            ["wishlist-check", product.id, userId],
            context.prevCheck,
          );
        }
      }

      const message =
        error instanceof Error ? error.message : "Failed to update wishlist.";
      toast.error(message);
    },

    onSuccess: (result, action) => {
      if (!userId || !product?.id) return;

      // Update wishlist cache
      queryClient.setQueryData(["wishlist", userId], result);

      // Update check cache with accurate data from result
      const updatedItem =
        result?.items?.find((item) => item.productId === product.id) ?? null;
      queryClient.setQueryData<WishlistCheckResult>(
        ["wishlist-check", product.id, userId],
        {
          isWishlisted: action === "add",
          wishlistItemId: action === "add" ? (updatedItem?.id ?? null) : null,
        },
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail"] });

      toast.success(
        action === "add"
          ? "Product added to wishlist."
          : "Product removed from wishlist.",
      );
    },
  });

  const addToWishlist = (type: "add" | "remove") => {
    if (!userId) {
      router.replace(`/login?next=/products/${product?.slug}`);
      return;
    }

    mutation.mutate(type);
  };

  return {
    ...mutation,
    addToWishlist,
  };
}

// ==========================================
// ➕ ADD TO WISHLIST
// ==========================================
export function useAddToWishlist(userId?: string, wishlist?: Wishlist | null) {
  const queryClient = useQueryClient();

  return useMutation<
    Wishlist | null,
    unknown,
    string, // productId
    WishlistMutationContext
  >({
    mutationFn: async (productId: string) => {
      if (!userId || !productId) {
        throw new Error("userId and productId are required");
      }
      return addProductToWishlist(userId, productId, {
        wishlist: wishlist ?? null,
      });
    },

    onMutate: async (productId) => {
      if (!userId) return {};

      await queryClient.cancelQueries({ queryKey: ["wishlist", userId] });
      await queryClient.cancelQueries({
        queryKey: ["wishlist-check", productId, userId],
      });

      const prevWishlist = queryClient.getQueryData<Wishlist>([
        "wishlist",
        userId,
      ]);
      const prevCheck = queryClient.getQueryData<WishlistCheckResult>([
        "wishlist-check",
        productId,
        userId,
      ]);

      // Optimistic update
      queryClient.setQueryData<WishlistCheckResult>(
        ["wishlist-check", productId, userId],
        { isWishlisted: true, wishlistItemId: null },
      );

      return { prevWishlist, prevCheck };
    },

    onError: (error, productId, context) => {
      if (userId && productId) {
        if (context?.prevWishlist !== undefined) {
          queryClient.setQueryData(["wishlist", userId], context.prevWishlist);
        }
        if (context?.prevCheck !== undefined) {
          queryClient.setQueryData(
            ["wishlist-check", productId, userId],
            context.prevCheck,
          );
        }
      }
      toast.error("Failed to add product to wishlist.");
    },

    onSuccess: (result, productId) => {
      if (!userId) return;

      queryClient.setQueryData(["wishlist", userId], result);

      const updatedItem =
        result?.items?.find((item) => item.productId === productId) ?? null;
      queryClient.setQueryData<WishlistCheckResult>(
        ["wishlist-check", productId, userId],
        {
          isWishlisted: true,
          wishlistItemId: updatedItem?.id ?? null,
        },
      );

      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Product added to wishlist.");
    },
  });
}

// ==========================================
// ➖ REMOVE FROM WISHLIST
// ==========================================
export function useRemoveFromWishlist(
  userId?: string,
  wishlist?: Wishlist | null,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Wishlist | null,
    unknown,
    { productId: string; wishlistItemId?: string | null },
    WishlistMutationContext
  >({
    mutationFn: async ({ productId, wishlistItemId }) => {
      if (!userId || !productId) {
        throw new Error("userId and productId are required");
      }
      return removeProductFromWishlist(userId, productId, {
        wishlist: wishlist ?? null,
        wishlistItemId: wishlistItemId ?? null,
      });
    },

    onMutate: async ({ productId }) => {
      if (!userId) return {};

      await queryClient.cancelQueries({ queryKey: ["wishlist", userId] });
      await queryClient.cancelQueries({
        queryKey: ["wishlist-check", productId, userId],
      });

      const prevWishlist = queryClient.getQueryData<Wishlist>([
        "wishlist",
        userId,
      ]);
      const prevCheck = queryClient.getQueryData<WishlistCheckResult>([
        "wishlist-check",
        productId,
        userId,
      ]);

      // Optimistic update
      queryClient.setQueryData<WishlistCheckResult>(
        ["wishlist-check", productId, userId],
        { isWishlisted: false, wishlistItemId: null },
      );

      return { prevWishlist, prevCheck };
    },

    onError: (error, { productId }, context) => {
      if (userId && productId) {
        if (context?.prevWishlist !== undefined) {
          queryClient.setQueryData(["wishlist", userId], context.prevWishlist);
        }
        if (context?.prevCheck !== undefined) {
          queryClient.setQueryData(
            ["wishlist-check", productId, userId],
            context.prevCheck,
          );
        }
      }
      toast.error("Failed to remove product from wishlist.");
    },

    onSuccess: (result, { productId }) => {
      if (!userId) return;

      queryClient.setQueryData(["wishlist", userId], result);
      queryClient.setQueryData<WishlistCheckResult>(
        ["wishlist-check", productId, userId],
        { isWishlisted: false, wishlistItemId: null },
      );

      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Product removed from wishlist.");
    },
  });
}

// ==========================================
// 🔍 BATCH CHECK WISHLIST STATUS
// ==========================================
export function useBatchWishlistCheck(productIds: string[], userId?: string) {
  return useQuery({
    queryKey: ["wishlist-batch-check", productIds, userId ?? "guest"],
    queryFn: async () => {
      if (!userId || productIds.length === 0) {
        return {};
      }

      // Get wishlist once and check all products
      const wishlist = await getWishlistByUser();
      const wishlistedProductIds = new Set(
        wishlist?.items?.map((item) => item.productId) ?? [],
      );

      return productIds.reduce(
        (acc, productId) => {
          acc[productId] = wishlistedProductIds.has(productId);
          return acc;
        },
        {} as Record<string, boolean>,
      );
    },
    enabled: !!userId && productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
