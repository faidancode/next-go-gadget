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
  console.log(wishlistItems)
  return (
    <div>
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-lg font-semibold">Wishlist</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs">Sort by:</span>
          <Select
            value={wishlistSort}
            onValueChange={(value) =>
              setWishlistSort(value as "newest" | "highest" | "lowest")
            }
          >
            <SelectTrigger
              size="sm"
              className="bg-tertiary border rounded px-2 py-1 text-sm "
            >
              <SelectValue placeholder="Newest" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="start"
              className="bg-tertiary border "
            >
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest">Highest Price</SelectItem>
              <SelectItem value="lowest">Lowest Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center text-center text-gray-500 py-10 gap-2">
          <EmptyState
            title="Your wishlists is empty."
            description="Go find the products you like"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {wishlistItems.map((item) => {
            if (!item.product) {
              return null;
            }
            return (
              <ProductCard
                key={item.id}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
