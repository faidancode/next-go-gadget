import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/app/stores/cart";
import {
  syncCartWithServer,
  getCartByUser,
  getCartCount,
  mapLocalItemsToCartInput,
  mapServerCartItemsToLocal,
} from "@/lib/api/cart";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { CartWithItems } from "@/types/cart";

interface CartMutationContext {
  prevItems: ReturnType<typeof useCartStore.getState>["items"];
}

// ==========================================
// 🛒 ADD TO CART
// ==========================================
export function useAddToCart(
  product: Product | null | undefined,
  userId: string | null | undefined,
) {
  const router = useRouter();
  const add = useCartStore((state) => state.add);
  const queryClient = useQueryClient();

  const mutation = useMutation<
    CartWithItems | null,
    unknown,
    number | void,
    CartMutationContext
  >({
    // ⚠️ mutationFn TIDAK perlu cek login lagi
    mutationFn: async () => {
      if (!product || !userId) return null;

      const localItems = useCartStore.getState().items;
      const payloadItems = mapLocalItemsToCartInput(localItems);
      if (payloadItems.length === 0) return null;

      return syncCartWithServer({
        userId,
        items: payloadItems,
      });
    },

    onMutate: async (qty = 1) => {
      if (!product) return { prevItems: [] };

      const prevItems = useCartStore
        .getState()
        .items.map((item) => ({ ...item }));

      const quantity = typeof qty === "number" && qty > 0 ? qty : 1;
      add(product, quantity);

      return { prevItems };
    },

    onError: (error, _vars, context) => {
      if (context?.prevItems) {
        useCartStore.setState({ items: context.prevItems });
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add product to cart.",
      );
    },

    onSuccess: (data) => {
      if (data?.items || data?.data) {
        const serverItems = mapServerCartItemsToLocal(data.items || data.data);
        useCartStore.getState().replaceAll(serverItems);
      }

      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });

      toast.success("Product added to cart.");
    },
  });

  // ✅ Wrapper function (GUARD LOGIN)
  const addToCart = (qty?: number) => {
    if (!userId) {
      router.replace(`/login?next=/products/${product?.slug}`);
      return;
    }

    mutation.mutate(qty);
  };

  return {
    ...mutation,
    addToCart,
  };
}

// ==========================================
// 📊 GET CART
// ==========================================
export function useCart(userId?: string) {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => getCartByUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==========================================
// 🔢 GET CART COUNT
// ==========================================
export function useCartCount(userId?: string) {
  return useQuery({
    queryKey: ["cart-count", userId],
    queryFn: () => getCartCount(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==========================================
// ➕ INCREMENT ITEM
// ==========================================
export function useIncrementCartItem(userId?: string) {
  const inc = useCartStore((state) => state.inc);
  const queryClient = useQueryClient();

  return useMutation<
    CartWithItems | null,
    unknown,
    string,
    CartMutationContext
  >({
    mutationFn: async (productId: string) => {
      if (!userId) return null;

      // ✅ Update local first (optimistic)
      inc(productId);

      // ✅ Kirim full cart ke server
      const localItems = useCartStore.getState().items;
      const payloadItems = mapLocalItemsToCartInput(localItems);

      return syncCartWithServer({
        userId,
        items: payloadItems,
      });
    },

    onMutate: async (productId) => {
      const prevItems = useCartStore
        .getState()
        .items.map((item) => ({ ...item }));
      return { prevItems };
    },

    onError: (error, _vars, context) => {
      if (context?.prevItems) {
        useCartStore.getState().replaceAll(context.prevItems);
      }
      toast.error("Failed to update cart.");
    },

    onSuccess: (data) => {
      if (data?.items || data?.data) {
        const serverItems = mapServerCartItemsToLocal(data.items || data.data);
        useCartStore.getState().replaceAll(serverItems);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// ==========================================
// ➖ DECREMENT ITEM
// ==========================================
export function useDecrementCartItem(userId?: string) {
  const dec = useCartStore((state) => state.dec);
  const queryClient = useQueryClient();

  return useMutation<
    CartWithItems | null,
    unknown,
    string,
    CartMutationContext
  >({
    mutationFn: async (productId: string) => {
      if (!userId) return null;

      // ✅ Update local first (optimistic)
      dec(productId);

      // ✅ Kirim full cart ke server
      const localItems = useCartStore.getState().items;
      const payloadItems = mapLocalItemsToCartInput(localItems);

      return syncCartWithServer({
        userId,
        items: payloadItems,
      });
    },

    onMutate: async (productId) => {
      const prevItems = useCartStore
        .getState()
        .items.map((item) => ({ ...item }));
      return { prevItems };
    },

    onError: (error, _vars, context) => {
      if (context?.prevItems) {
        useCartStore.getState().replaceAll(context.prevItems);
      }
      toast.error("Failed to update cart.");
    },

    onSuccess: (data) => {
      if (data?.items || data?.data) {
        const serverItems = mapServerCartItemsToLocal(data.items || data.data);
        useCartStore.getState().replaceAll(serverItems);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// ==========================================
// 🗑️ REMOVE ITEM
// ==========================================
export function useRemoveCartItem(userId?: string) {
  const remove = useCartStore((state) => state.remove);
  const queryClient = useQueryClient();

  return useMutation<
    CartWithItems | null,
    unknown,
    string,
    CartMutationContext
  >({
    mutationFn: async (productId: string) => {
      if (!userId) return null;

      // ✅ Update local first (optimistic)
      remove(productId);

      // ✅ Kirim full cart ke server
      const localItems = useCartStore.getState().items;
      const payloadItems = mapLocalItemsToCartInput(localItems);

      return syncCartWithServer({
        userId,
        items: payloadItems,
      });
    },

    onMutate: async (productId) => {
      const prevItems = useCartStore
        .getState()
        .items.map((item) => ({ ...item }));
      return { prevItems };
    },

    onError: (error, _vars, context) => {
      if (context?.prevItems) {
        useCartStore.getState().replaceAll(context.prevItems);
      }
      toast.error("Failed to remove item.");
    },

    onSuccess: (data) => {
      if (data?.items || data?.data) {
        const serverItems = mapServerCartItemsToLocal(data.items || data.data);
        useCartStore.getState().replaceAll(serverItems);
      }
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item removed from cart.");
    },
  });
}

// ==========================================
// 🔄 SYNC CART FROM SERVER
// ==========================================
export function useSyncCart(userId?: string) {
  const syncFromServer = useCartStore((state) => state.syncFromServer);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await syncFromServer(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
    },
  });
}

// ==========================================
// 🗑️ CLEAR CART
// ==========================================
export function useClearCart(userId?: string) {
  const clear = useCartStore((state) => state.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) return null;

      // ✅ Clear local cart
      clear();

      // ✅ Sync dengan server (empty cart)
      return syncCartWithServer({
        userId,
        items: [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast.success("Cart cleared.");
    },
  });
}
