"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/lib/hooks/use-product";
import { useCategories } from "@/lib/hooks/use-category";
import { useBrands } from "@/lib/hooks/use-brand";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { ProductGridSkeleton } from "@/components/shared/product-grid-skeleton";
import {
  Filter,
  SlidersHorizontal,
  X,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { selectCartItems } from "@/app/stores/cart";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const requestedSort = searchParams?.get("sortBy");

  const [sortBy, setSortBy] = useState<SortValue>("newest");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all"); // Default ke "all"
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  useEffect(() => {
    const validSort = SORT_OPTIONS.find((opt) => opt.value === requestedSort);
    if (validSort) setSortBy(validSort.value);
  }, [requestedSort]);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, status } =
    useProducts({
      limit: PAGE_SIZE,
      categories: selectedCats.length > 0 ? selectedCats : undefined,
      brandSlug: selectedBrand !== "all" ? selectedBrand : undefined,
      minPrice: minPrice ? parseInt(minPrice, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice, 10) : undefined,
      sort: sortBy,
    });

  const { data: categoriesData, isLoading: isCatsLoading } = useCategories();
  const { data: brandsData, isLoading: isBrandsLoading } = useBrands();

  const products = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items as Product[]),
    [data],
  );

  const toggleFilter = (slug: string, type: "cat" | "brand") => {
    if (type === "cat") {
      // Logic Multiple untuk Categories
      setSelectedCats((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
      );
    } else {
      // Logic Single untuk Brand
      // Jika mengeklik slug yang sama, kita kosongkan (toggle off)
      setSelectedBrand((prev) => (prev === slug ? "" : slug));
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24">
      {/* --- HEADER SECTION --- */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
                <LayoutGrid size={12} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Official Catalog
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
                The <span className="text-primary italic">Shop</span> Gear.
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                Premium hardware, components, and peripherals curated for your
                ultimate setup.
              </p>
            </div>

            {/* SORTING DROPDOWN */}
            <div className="flex flex-col gap-3 min-w-60">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Sort Collection
              </label>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortValue)}
              >
                <SelectTrigger className="h-14 rounded-2xl border-white bg-slate-50 shadow-sm font-bold text-slate-700 focus:ring-primary/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent
                  align="end"
                  className="rounded-2xl border-slate-100 p-2"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-xl font-medium py-3"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- SIDEBAR FILTERS --- */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-28 space-y-10">
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 font-black uppercase tracking-tighter text-xl text-slate-900">
                  <Filter size={20} strokeWidth={2.5} />
                  Filters
                </div>
                {/* Tambahkan pengecekan selectedBrand !== "" atau "all" */}
                {(selectedCats.length > 0 ||
                  (selectedBrand && selectedBrand !== "all") ||
                  minPrice ||
                  maxPrice) && (
                  <button
                    onClick={() => {
                      setSelectedCats([]);
                      setSelectedBrand(""); // Reset single brand
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Price Range
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      Rp
                    </span>
                    <Input
                      placeholder="Min"
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="pl-8 h-12 rounded-xl bg-white border-slate-200 focus:ring-primary/20"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      Rp
                    </span>
                    <Input
                      placeholder="Max"
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="pl-8 h-12 rounded-xl bg-white border-slate-200 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Categories Checklist (Multiple) */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Category
                </h3>
                <div className="flex flex-col gap-3">
                  {isCatsLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="h-5 w-full bg-slate-200 animate-pulse rounded-md"
                          />
                        ))
                    : categoriesData?.data.map((c) => (
                        <label
                          key={c.slug}
                          className="flex items-center justify-between group cursor-pointer"
                        >
                          <span
                            className={`text-sm font-bold transition-all ${selectedCats.includes(c.slug) ? "text-primary translate-x-1" : "text-slate-500 group-hover:text-slate-900"}`}
                          >
                            {c.name}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedCats.includes(c.slug) ? "bg-primary border-primary rotate-0" : "border-slate-200 group-hover:border-slate-400 rotate-45"}`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={selectedCats.includes(c.slug)}
                              onChange={() => toggleFilter(c.slug, "cat")}
                            />
                            {selectedCats.includes(c.slug) && (
                              <X size={12} className="text-white" />
                            )}
                          </div>
                        </label>
                      ))}
                </div>
              </div>

              {/* Manufacturer (Single Select) */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Manufacturer
                </h3>
                {isBrandsLoading ? (
                  <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
                ) : (
                  <Select
                    value={selectedBrand || "all"}
                    onValueChange={(value) =>
                      setSelectedBrand(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-700 focus:ring-primary/20 transition-all shadow-sm">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl overflow-hidden">
                      <SelectItem
                        value="all"
                        className="font-bold text-slate-400 uppercase text-[10px] tracking-widest py-3"
                      >
                        All Brands
                      </SelectItem>
                      {brandsData?.data?.map((b) => (
                        <SelectItem
                          key={b.id}
                          value={b.slug}
                          className="font-medium py-3"
                        >
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </aside>

          {/* --- PRODUCT GRID AREA --- */}
          <section className="lg:col-span-9">
            {status === "pending" ? (
              <ProductGridSkeleton count={9} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 border border-dashed border-slate-200 flex flex-col items-center text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <X size={32} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  No product found.
                </h2>
                <p className="text-slate-500 mb-8 max-w-xs">
                  We couldn't find any products matching your filters. Try
                  loosening them up.
                </p>
                <Button
                  onClick={() => {
                    setSelectedCats([]);
                    setSelectedBrand("");
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  variant="outline"
                  className="rounded-full px-8 h-12 font-bold uppercase tracking-widest text-xs border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {hasNextPage && (
                  <div className="flex flex-col items-center gap-4 pt-10 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Showing {products.length} Products
                    </p>
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="h-16 px-16 rounded-full bg-slate-900 text-white font-black hover:bg-primary hover:scale-105 transition-all shadow-2xl shadow-slate-900/20 uppercase tracking-widest text-xs"
                    >
                      {isFetchingNextPage
                        ? "Loading Gears..."
                        : "Load More Collection"}
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-7xl mx-auto px-4 py-24">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
