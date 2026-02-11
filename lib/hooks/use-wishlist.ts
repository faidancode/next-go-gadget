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
  productId?: string,
  wishlist?: Wishlist | null,
) {
  const queryClient = useQueryClient();

  const isWishlisted = Boolean(
    wishlist?.items?.some((item) => item.product?.id === productId),
  );

  const mutation = useMutation({
    mutationFn: async () => {
      if (!productId) return null;

      if (isWishlisted) {
        return removeProductFromWishlist(productId);
      }

      return addProductToWishlist(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  return {
    toggleWishlist: mutation.mutate,
    isWishlisted,
    isPending: mutation.isPending,
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
      return addProductToWishlist(productId);
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
    { productId: string },
    WishlistMutationContext
  >({
    mutationFn: async ({ productId }) => {
      if (!userId || !productId) {
        throw new Error("userId and productId are required");
      }
      return removeProductFromWishlist(productId);
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
