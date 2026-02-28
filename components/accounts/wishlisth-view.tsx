import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WishlistItem } from "@/lib/api/wishlists";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "../shared/product-card";
import { WishlistItemActions } from "./wishlist-item-actions";
import { EmptyState } from "../shared/empty-state";
import { ArrowUpDown, Heart, ShoppingBag } from "lucide-react";

function formatIDR(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
}

export function WishlistView({
  wishlistItems,
  wishlistSort,
  setWishlistSort,
  userId,
  onWishlistMutated,
}: {
  wishlistItems: WishlistItem[];
  wishlistSort: "newest" | "highest" | "lowest";
  setWishlistSort: (v: "newest" | "highest" | "lowest") => void;
  userId?: string;
  onWishlistMutated?: () => Promise<unknown> | void;
}) {
  console.log(wishlistItems);
  return (
    <div className="space-y-8">
      {/* --- HEADER & SORTING --- */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-50 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            My <span className="text-primary italic">Wishlist</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Items you've saved for later. Keep an eye on them!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <ArrowUpDown size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Sort:
            </span>
            <Select
              value={wishlistSort}
              onValueChange={(value) => setWishlistSort(value as any)}
            >
              <SelectTrigger className="border-none bg-transparent h-auto p-0 focus:ring-0 text-xs font-bold text-slate-700 w-27.5">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="rounded-2xl border-slate-100 shadow-xl p-2"
              >
                <SelectItem
                  value="newest"
                  className="rounded-xl py-2.5 font-medium"
                >
                  Newest Added
                </SelectItem>
                <SelectItem
                  value="highest"
                  className="rounded-xl py-2.5 font-medium"
                >
                  Highest Price
                </SelectItem>
                <SelectItem
                  value="lowest"
                  className="rounded-xl py-2.5 font-medium"
                >
                  Lowest Price
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      {wishlistItems.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
            <Heart size={32} className="text-slate-200" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Your wishlist is empty
          </h2>
          <p className="text-slate-500 mt-2 mb-8 max-w-62.5 text-center text-sm leading-relaxed">
            Explore our collection and save your favorite premium gadgets here.
          </p>
          <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-slate-200">
            <ShoppingBag size={16} />
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item: any) => {
            if (!item.product) return null;
            return (
              <div key={item.id} className="group relative">
                <ProductCard
                  product={item.product}
                  actions={
                    <WishlistItemActions
                      product={item.product}
                      wishlistItemId={item.id}
                      userId={userId}
                      onWishlistMutated={onWishlistMutated}
                    />
                  }
                />
                {/* Optional: Add a "Quick Add" floating button or badge here */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
