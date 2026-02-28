"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrand } from "@/lib/hooks/use-brand"; // Untuk ambil info brand (logo/nama)
import { useProducts } from "@/lib/hooks/use-product";
import { BadgeCheck, ChevronRight, Filter, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function BrandDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");

  // 1. Fetch info Brand
  const { data: brandDetail } = useBrand(slug);

  // 2. Fetch Products berdasarkan Brand Slug
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, status } =
    useProducts({
      brandSlug: slug,
      sort: sortBy,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    });

  const products = data?.pages.flatMap((p) => p.items) ?? [];

  // Jika brandDetail belum ada, baru gunakan fallback dari slug
  const brandName =
    brandDetail?.name ?? (slug ? slug.replace(/-/g, " ") : "Brand");

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Brand Header Section */}
      <section className="bg-white border-b border-slate-100 pt-20 pb-10">
        <div className="container max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm font-medium mb-6 text-slate-400">
            <Link
              href="/brands"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <BadgeCheck size={14} />
              Brands
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-900">
              {brandDetail?.name ?? brandName}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-slate-50 bg-white flex items-center justify-center p-6 shadow-xl shadow-slate-200/50">
              {brandDetail?.imageUrl ? (
                <Image
                  src={brandDetail.imageUrl}
                  alt={brandDetail.name}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              ) : (
                <span className="text-2xl font-black text-slate-200">LOGO</span>
              )}
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
                {brandDetail?.name ?? slug}
                <span className="text-primary">.</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-lg">
                Exclusive collection of {brandDetail?.name} high-end technology
                and peripherals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Filter - Sama dengan Categories */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-8">
                <Filter size={18} className="text-slate-900" />
                <h2 className="font-black uppercase tracking-tighter text-lg text-slate-900">
                  Filter Gear
                </h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="h-11 rounded-xl bg-slate-100 border-none"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="h-11 rounded-xl bg-slate-100 border-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Sort By
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-100 border-none font-bold text-xs">
                      <SelectValue placeholder="Newest" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_high">Higher Price</SelectItem>
                      <SelectItem value="price_low">Lower Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="lg:col-span-9">
            {status === "pending" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-4/5 rounded-[2rem] bg-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No Products"
                description={`Currently no products available for ${brandDetail?.name}`}
                href="/brands"
                linkText="See other brands"
              />
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="flex justify-center pt-8">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="h-14 px-12 rounded-full bg-slate-900 text-white font-bold hover:bg-primary transition-all shadow-xl shadow-slate-200"
                    >
                      {isFetchingNextPage ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Load More Products"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
