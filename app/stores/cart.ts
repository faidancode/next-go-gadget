"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getCartByUser, mapServerCartItemsToLocal } from "@/lib/api/cart";
import { Product } from "@/types/product";

/* =======================
   Types
======================= */

export type CartItem = {
  id: string; // productId
  name: string;
  slug: string;
  price: number; // cents
  imageUrl?: string;
  category?: string;
  qty: number;
  cartItemId?: string; // dari server
};

type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPriceCents: number;

  // local actions
  add: (product: Product, qty?: number) => void;
  inc: (productId: string) => void;
  dec: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;

  // server sync
  replaceAll: (items: CartItem[]) => void;
  syncFromServer: (userId: string) => Promise<void>;
};

/* =======================
   Helpers
======================= */

const normalizeItems = (items: CartItem[]): CartItem[] =>
  items.filter(Boolean).map((item) => ({
    ...item,
    qty: item.qty > 0 ? item.qty : 1,
    price: Number.isFinite(item.price) ? item.price : 0,
    name: item.name || "Untitled",
    slug: item.slug || "",
    imageUrl: item.imageUrl ?? "",
    category: item.category ?? "",
  }));

const computeTotals = (items: CartItem[]) => ({
  items,
  totalItems: items.reduce((sum, i) => sum + i.qty, 0),
  totalPriceCents: items.reduce((sum, i) => sum + i.price * i.qty, 0),
});

/* =======================
   Store
======================= */

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      const setItems = (items: CartItem[]) => {
        const normalized = normalizeItems(items);
        set(computeTotals(normalized));
      };

      return {
        items: [],
        totalItems: 0,
        totalPriceCents: 0,

        /* ========= Local Ops ========= */

        add: (product, qty = 1) => {
          const items = [...get().items];
          const idx = items.findIndex((i) => i.id === product.id);

          const price = product.discountPriceCents ?? product.price;
          console.log({items});
          if (idx >= 0) {
            items[idx] = {
              ...items[idx],
              qty: items[idx].qty + qty,
            };
          } else {
            items.push({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price,
              imageUrl: product.imageUrl,
              category: product.categoryId,
              qty,
            });
          }

          setItems(items);
        },

        inc: (productId) => {
          setItems(
            get().items.map((item) =>
              item.id === productId ? { ...item, qty: item.qty + 1 } : item,
            ),
          );
        },

        dec: (productId) => {
          setItems(
            get()
              .items.map((item) =>
                item.id === productId ? { ...item, qty: item.qty - 1 } : item,
              )
              .filter((item) => item.qty > 0),
          );
        },

        remove: (productId) => {
          setItems(get().items.filter((item) => item.id !== productId));
        },

        clear: () => {
          setItems([]);
        },

        /* ========= Server Sync ========= */

        replaceAll: (items) => {
          setItems(Array.isArray(items) ? items : []);
        },

        syncFromServer: async (userId) => {
          if (!userId) return;

          try {
            const cart = await getCartByUser();
            const serverItems = cart?.items ?? [];

            if (!serverItems.length) return;

            const mapped = mapServerCartItemsToLocal(serverItems);
            if (!mapped.length) return;

            setItems(mapped);
          } catch (err) {
            console.error("sync cart failed", err);
          }
        },
      };
    },
    {
      name: "cart-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/* =======================
   Selectors
======================= */

export const selectCartItems = (s: CartState) => s.items;
export const selectTotalItems = (s: CartState) => s.totalItems;
export const selectTotalPrice = (s: CartState) => s.totalPriceCents;
