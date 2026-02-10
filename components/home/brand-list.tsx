"use client";

import { Button } from "@/components/ui/button";
import { useBrands } from "@/lib/hooks/use-brand";
import { ChevronRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LinkButton from "../shared/link-button";

export function Brands() {
  const { data, isLoading, isError, refetch } = useBrands();

  const brands = data?.data ?? [];
  const displayed = brands.slice(0, 6);

  return (
    <section className="w-full py-8">
      {/* Header Section */}
      <div className="flex w-full items-end justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Explore <span className="text-primary">Brands</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Find the best gadgets by your favorite brand.
          </p>
        </div>
        <LinkButton text="Explore All" href="/brands" />
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 rounded-2xl bg-muted/50 animate-pulse border border-border/50"
            />
          ))
        ) : displayed.length > 0 ? (
          displayed.map((cat) => (
            <Link
              key={cat.id ?? cat.slug}
              href={`/shop/categories/${cat.slug}`}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/5 active:scale-95"
            >
              {/* Container Logo / Icon (Kiri) */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    width={32}
                    height={32}
                    alt={cat.name}
                    className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <LayoutGrid className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                )}
              </div>

              {/* Container Teks (Kanan) */}
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                  {cat.name}
                </span>
                <p className="text-xs text-muted-foreground">
                  Browse collection
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              There are no brands to display yet.
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          <span>Cannot load brand.</span>
          <button className="font-bold underline" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
