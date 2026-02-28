"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card"; // Sesuaikan nama komponen
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/lib/hooks/use-category";
import { useProducts } from "@/lib/hooks/use-product"; // Gunakan hook product
import {
    ChevronRight,
    Filter,
    LayoutGrid,
    Loader2,
    SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price_high", label: "Harga Tertinggi" },
  { value: "price_low", label: "Harga Terendah" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function CategoryShopPage() {
  const { slug } = useParams<{ slug: string }>();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortValue>("newest");

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, status } =
    useProducts({
      limit: PAGE_SIZE,
      categories: slug ? [slug] : undefined,
      sort: sortBy,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
    });


  const products = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data],
  );

  const categoryName = (slug ? slug.replace(/-/g, " ") : "Category");

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- BREADCRUMB & HEADER --- */}
        <header className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link
              href="/categories"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <LayoutGrid size={14} />
              Categories
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-900">{categoryName}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 capitalize">
                {categoryName}
                <span className="text-primary">.</span>
              </h1>
              <p className="text-slate-500 font-medium">
                Menampilkan koleksi terbaik untuk {categoryName}
              </p>
            </div>

            {/* SORTING DESKTOP */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <SlidersHorizontal size={14} />
                Sort By:
              </div>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortValue)}
              >
                <SelectTrigger className="w-full md:w-50 h-12 rounded-2xl border-white bg-white shadow-sm font-bold text-slate-700">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  className="rounded-2xl border-slate-100"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="font-medium text-sm"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- SIDEBAR FILTER --- */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="sticky top-24 rounded-2xl border border-white bg-white/70 backdrop-blur-md p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-slate-900">
                <Filter size={18} strokeWidth={2.5} />
                <h2 className="font-black uppercase tracking-tighter text-lg">
                  Filter
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Range Harga
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest h-11"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            </div>
          </aside>

          {/* --- PRODUCT GRID --- */}
          <section className="lg:col-span-9">
            {status === "pending" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-3/4 rounded-[2rem] bg-white animate-pulse border border-white"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-12 border border-dashed border-slate-200 flex flex-center">
                <EmptyState
                  title="Produk Tidak Ditemukan"
                  description="Maaf, kami belum memiliki stok produk untuk filter ini."
                  href="/categories"
                  linkText="Lihat Kategori Lain"
                />
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* LOAD MORE */}
                {hasNextPage && (
                  <div className="flex justify-center pt-8">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="h-14 px-10 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-all shadow-xl shadow-slate-200"
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={18} />
                          <span>Loading Gear...</span>
                        </div>
                      ) : (
                        "Muat Lebih Banyak"
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
