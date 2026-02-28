"use client";

import { Card } from "@/components/ui/card";

export function ProductSkeleton() {
  return (
    <Card className="group relative flex flex-col h-72 w-full overflow-hidden rounded-[2rem] border-white bg-white/70 backdrop-blur-sm shadow-xl shadow-emerald-950/5 animate-pulse">
      {/* 1. Area Gambar (Pulse) */}
      <div className="relative aspect-4/5 flex items-center justify-center p-6 bg-slate-100 rounded-3xl m-2" />

      {/* 2. Area Content (Text & Price) */}
      <div className="flex flex-col grow px-5 pb-6 pt-3 space-y-3">
        {/* Nama Produk Skeleton */}
        <div className="space-y-1.5">
          <div className="h-4 w-3/4 rounded-full bg-slate-200" />
          <div className="h-4 w-1/2 rounded-full bg-slate-100" />
        </div>

        {/* Harga Skeleton (Spacer & Pulse) */}
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="h-6 w-1/2 rounded-full bg-slate-200 mt-2" />
          {/* Discount Badge Skeleton (Optional) */}
          <div className="h-4 w-12 rounded-full bg-slate-100" />
        </div>
      </div>
    </Card>
  );
}
