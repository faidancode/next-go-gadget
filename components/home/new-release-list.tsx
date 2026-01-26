"use client";

import { useProducts } from "@/lib/hooks/use-product"; // Ganti useBooks ke useProducts
import { ProductCard } from "../shared/product-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import LinkButton from "../shared/link-button";

export function NewRelease() {
  const { data, isLoading, isError, refetch } = useProducts({
    pageSize: 10,
    sort: "newest",
  });

  const products = data?.pages[0]?.items ?? [];

  return (
    <section className="w-full">
      <div className="flex w-full items-end justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            New <span className="text-primary">Release</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            The latest gadgets just for you.
          </p>
        </div>
        <LinkButton text="Explore All" href="/" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-3/4 rounded-xl bg-muted animate-pulse"
              />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {isError && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">Failed to load products.</p>
          <button onClick={() => refetch()} className="text-xs underline">
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
