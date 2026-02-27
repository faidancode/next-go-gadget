"use client";

import { useProducts } from "@/lib/hooks/use-product"; // Ganti useBooks ke useProducts
import { ProductCard } from "../shared/product-card";
import { ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import LinkButton from "../shared/link-button";

export function NewRelease() {
  const { data, isLoading, isError, refetch } = useProducts({
    limit: 10,
    sort: "newest",
  });

  const products = data?.pages[0]?.items ?? [];

  return (
    <section className="w-full py-12 md:py-16">
      {/* Header Section */}
      <div className="flex w-full items-end justify-between mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              New Arrivals
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            New <span className="text-primary italic">Release</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-md">
            The latest cutting-edge gadgets and tech essentials curated just for
            you.
          </p>
        </div>
        <LinkButton text="Explore All" href="/shop" />
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-4/5 rounded-[2rem] bg-slate-100 animate-pulse border border-slate-200"
            />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 text-slate-300">
              <ShoppingBag size={32} />
            </div>
            <p className="text-slate-500 font-medium">
              No products found in this collection.
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 p-8 rounded-[2rem] bg-red-50 border border-red-100">
          <p className="text-sm font-bold text-red-600">
            Failed to sync with the catalog.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Re-sync Catalog
          </button>
        </div>
      )}
    </section>
  );
}
