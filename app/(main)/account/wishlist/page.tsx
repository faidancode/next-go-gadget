"use client";

import { useAuthStore } from "@/app/stores/auth";
import { WishlistView } from "@/components/accounts/wishlisth-view";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import Link from "next/link";
import { useState } from "react";

export default function WishlistPage() {
  const user = useAuthStore((s) => s.user);
  const [wishlistSort, setWishlistSort] = useState<
    "newest" | "highest" | "lowest"
  >("newest");

  const {
    data: wishlist,
    isLoading,
    refetch,
  } = useWishlist(user?.id, { sort: wishlistSort ?? "newest" });

  if (!user) {
    return (
      <div className="w-full p-4">
        <div className="w-full text-center py-10">
          <p className="mb-4">Please login to view your wishlist.</p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-secondary px-5 py-2 font-semibold text-white"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-4">
        <div className="rounded-lg bg-tertiary p-4 text-sm text-gray-400">
          Loading Wishlist...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <WishlistView
        wishlistItems={wishlist?.items ?? []}
        wishlistSort={wishlistSort}
        setWishlistSort={(v) => setWishlistSort(v)}
        userId={user?.id}
        onWishlistMutated={refetch}
      />
    </div>
  );
}
