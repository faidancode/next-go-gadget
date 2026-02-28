"use client";

import { ProductSkeleton } from "./product-skeleton";

interface ProductGridSkeletonProps {
  count?: number; // Jumlah kartu skeleton yang ingin ditampilkan
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-in fade-in duration-500"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <ProductSkeleton />
        </div>
      ))}
    </div>
  );
}
