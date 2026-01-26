"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Book } from "@/types";
import { getCartByUser, mapServerCartItemsToLocal } from "@/lib/api/cart";

export type CartItem = {
  id: string;
  title: string;
  slug: string;
  author?: string;
  price: number;
  imageUrl: string;
  category: string;
  qty: number;
  cartItemId?: string;
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPriceCents: number;
  add: (product: Book, qty?: number) => void;
  setCartTotalItems: (count: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  replaceAll: (items: CartItem[]) => void;
  syncFromServer: (userId: string) => Promise<void>;
};

const initialState = {
  items: [] as CartItem[],
  totalItems: 0,
  totalPriceCents: 0,
};

const sanitizeItems = (items: CartItem[]) =>
  items
    .filter((item): item is CartItem => Boolean(item && item.id))
    .map((item) => ({
      ...item,
      qty: item.qty > 0 ? item.qty : 1,
      price: Number.isFinite(item.price) ? item.price : 0,
      title: item.title || "Untitled",
      slug: item.slug || "",
      author: item.author,
      imageUrl: item.imageUrl ?? "",
      category: item.category ?? "",
      cartItemId: item.cartItemId,
    }));

const computeTotals = (items: CartItem[]) => ({
  items,
  totalItems: items.reduce((sum, item) => sum + item.qty, 0),
  totalPriceCents: items.reduce((sum, item) => sum + item.price * item.qty, 0),
});

export const useCartStore = create(
  persist<CartState>(
    (set, get) => {
      const setItems = (items: CartItem[]) => {
        const normalized = sanitizeItems(items);
        set(computeTotals(normalized));
      };

      return {
        ...initialState,
        add: (product, qty = 1) => {
          const items = get().items.slice();
          const idx = items.findIndex((item) => item.id === product.id);
          const priceAtAdd = product.discountPriceCents ?? product.priceCents;
          if (idx >= 0) {
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
          } else {
            items.push({
              id: product.id,
              title: product.title,
              slug: product.slug,
              author: product.authorName ?? undefined,
              price: priceAtAdd,
              imageUrl: product.imageUrl,
              category: product.categoryId,
              qty,
            });
          }
          setItems(items);
        },
        setCartTotalItems: (count) => {
          set((state) => ({
            ...state,
            totalItems: Math.max(0, Math.trunc(count)),
          }));
        },
        inc: (id) => {
          const items = get().items.map((item) =>
            item.id === id ? { ...item, qty: item.qty + 1 } : item
          );
          setItems(items);
        },
        dec: (id) => {
          const items = get()
            .items.map((item) =>
              item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item
            )
            .filter((item) => item.qty > 0);
          setItems(items);
        },
        remove: (id) => {
          const items = get().items.filter((item) => item.id !== id);
          setItems(items);
        },
        clear: () => {
          setItems([]);
        },
        replaceAll: (items) => {
          setItems(Array.isArray(items) ? items : []);
        },
        syncFromServer: async (userId) => {
          if (!userId) return;
          try {
            const cart = await getCartByUser(userId);
            const cartItems = cart?.data ?? cart?.items ?? [];
            if (cartItems.length === 0) {
              return;
            }
            const mapped = mapServerCartItemsToLocal(cartItems);
            if (mapped.length === 0 && get().items.length > 0) {
              return;
            }
            setItems(mapped);
          } catch (error) {
            console.error("Failed syncing cart from server", error);
          }
        },
      };
    },
    {
      name: "cart-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const selectTotalItems = (state: CartState) => state.totalItems;
