import { useAuthStore } from "@/app/stores/auth";
import { useCartStore } from "@/app/stores/cart";
import {
  addToCart as apiAddToCart,
  decrementCartItem,
  getCartByUser,
  getCartCount,
  incrementCartItem,
  mapServerCartItemsToLocal,
  removeCartItem,
  updateCartQty,
} from "@/lib/api/cart";
import { Product } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* ============================
   Shared rollback context
============================ */
// interface CartMutationContext {
//   prevItems: CartItem[];
// }

const snapshot = () => useCartStore.getState().items.map((i) => ({ ...i }));

/* ============================
   🛒 ADD TO CART
============================ */
export function useAddToCart(product?: Product | null) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const add = useCartStore((s) => s.add);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!product) return null;

      // ⛔ guard auth
      if (!user) {
        router.replace(`/login?next=/products/${product.slug}`);
        throw new Error("UNAUTHENTICATED");
      }
      return apiAddToCart(
        product.id,
        1,
        product.discountPriceCents ?? product.price,
      );
    },

    onMutate: async () => {
      if (!product) return { prevItems: [] };
      const prevItems = snapshot();
      add(product, 1);
      return { prevItems };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevItems) replaceAll(ctx.prevItems);
      toast.error("Gagal menambahkan ke cart");
    },

    onSuccess: (res) => {
      if (res?.items) {
        replaceAll(mapServerCartItemsToLocal(res.items));
      }
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["cart-count"] });
      toast.success("Produk ditambahkan");
    },
  });
}

/* ============================
   📦 GET CART
============================ */
export function useCart(userId?: string, enabled = true) {
  return useQuery({
    queryKey: ["cart", userId],
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,

    queryFn: ({ queryKey }) => {
      const [, uid] = queryKey as [string, string];
      return getCartByUser();
    },
  });
}

/* ============================
   🔢 CART COUNT
============================ */
export function useCartCount(enabled = true) {
  return useQuery({
    queryKey: ["cart-count"],
    queryFn: getCartCount,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/* ============================
   ➕ INCREMENT
============================ */
export function useIncrementCartItem() {
  const inc = useCartStore((s) => s.inc);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => incrementCartItem(productId),

    onMutate: async (productId) => {
      const prevItems = snapshot();
      inc(productId);
      return { prevItems };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevItems) replaceAll(ctx.prevItems);
      toast.error("Gagal menambah qty");
    },

    onSuccess: (res) => {
      if (res?.items) replaceAll(mapServerCartItemsToLocal(res.items));
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/* ============================
   ➖ DECREMENT
============================ */
export function useDecrementCartItem() {
  const dec = useCartStore((s) => s.dec);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => decrementCartItem(productId),

    onMutate: async (productId) => {
      const prevItems = snapshot();
      dec(productId);
      return { prevItems };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevItems) replaceAll(ctx.prevItems);
      toast.error("Gagal mengurangi qty");
    },

    onSuccess: (res) => {
      if (res?.items) replaceAll(mapServerCartItemsToLocal(res.items));
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/* ============================
   ✏️ UPDATE QTY (INPUT)
============================ */
export function useUpdateCartQty() {
  const replaceAll = useCartStore((s) => s.replaceAll);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) =>
      updateCartQty(productId, qty),

    onMutate: async () => {
      return { prevItems: snapshot() };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevItems) replaceAll(ctx.prevItems);
      toast.error("Gagal update qty");
      console.log(_e);
    },

    onSuccess: (res) => {
      if (res?.items) replaceAll(mapServerCartItemsToLocal(res.items));
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

/* ============================
   🗑️ REMOVE ITEM
============================ */
export function useRemoveCartItem() {
  const remove = useCartStore((s) => s.remove);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeCartItem(productId),

    onMutate: async (productId) => {
      const prevItems = snapshot();
      remove(productId);
      return { prevItems };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevItems) replaceAll(ctx.prevItems);
      toast.error("Gagal menghapus item");
    },

    onSuccess: (res) => {
      if (res?.items) replaceAll(mapServerCartItemsToLocal(res.items));
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Item dihapus");
    },
  });
}
