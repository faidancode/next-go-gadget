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
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { Title } from "@/components/shared/title";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "lower", label: "Lowest Price" },
  { value: "higher", label: "Highest Price" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function isSortValue(value: string | null): value is SortValue {
  return (
    value !== null && SORT_OPTIONS.some((option) => option.value === value)
  );
}

function getProductPrice(product: Product) {
  return product.discountPriceCents ?? product.price ?? 0;
}

function sortProducts(list: Product[], sortBy: SortValue) {
  const sorted = [...list];
  switch (sortBy) {
    case "popular":
      return sorted;
    case "higher":
      return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    case "lower":
      return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    case "newest":
    default:
      return sorted.sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
  }
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const requestedSort = searchParams?.get("sortBy");
  const [sortBy, setSortBy] = useState<SortValue>(() =>
    isSortValue(requestedSort) ? requestedSort : "newest",
  );

  useEffect(() => {
    if (isSortValue(requestedSort) && requestedSort !== sortBy) {
      setSortBy(requestedSort);
    }
  }, [requestedSort, sortBy]);

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const min = minPrice ? parseInt(minPrice, 10) : undefined;
  const max = maxPrice ? parseInt(maxPrice, 10) : undefined;

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, status } =
    useProducts({
      limit: PAGE_SIZE,
      categories: selectedCats,
      minPrice: min,
      maxPrice: max,
      sort: sortBy,
    });

  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const categoryOptions = categoriesData?.data ?? [];

  const slugToIdMap = useMemo(() => {
    const map = new Map<string, string>();
    categoryOptions.forEach((category) => {
      if (category.slug && category.id) {
        map.set(category.slug, category.id.toLowerCase());
      }
    });
    return map;
  }, [categoryOptions]);

  const selectedCategoryIds = useMemo(() => {
    return selectedCats
      .map((slug) => slugToIdMap.get(slug))
      .filter((id): id is string => Boolean(id));
  }, [selectedCats, slugToIdMap]);

  const products: Product[] = (data?.pages ?? []).flatMap(
    (p) => p.items as Product[],
  );

  // Satu useMemo untuk proses filter saja (yang mungkin agak berat)
  const filtered = useMemo(() => {
    return products.filter((b) => {
      const categoryId = b.categoryId?.toLowerCase();
      const okCat =
        selectedCategoryIds.length === 0 ||
        (categoryId ? selectedCategoryIds.includes(categoryId) : false);
      const okMin = min === undefined || b.price >= min;
      const okMax = max === undefined || b.price <= max;
      return okCat && okMin && okMax;
    });
  }, [products, selectedCats, min, max]);

  const sorted = useMemo(
    () => sortProducts(filtered, sortBy),
    [filtered, sortBy],
  );

  const toggleCat = (slug: string) => {
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const handleResetFilters = () => {
    setSelectedCats([]);
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="w-full px-4">
      <Title>Shop</Title>
      <div className="mb-4 flex gap-2 sm:flex-row sm:items-center justify-between">
        <div className="flex">
          <h2 className="font-semibold hidden md:block text-lg">Filter</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-end">
          <span className="text-sm text-gray-400">Sort by</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortValue)}
          >
            <SelectTrigger className="min-w-45 border-tertiary text-sm">
              <SelectValue placeholder="Choose order" />
            </SelectTrigger>
            <SelectContent align="end">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="rounded-lg">
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Categories</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {isCategoriesLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-4 rounded bg-background/40 animate-pulse"
                    />
                  ))
                ) : categoryOptions.length > 0 ? (
                  categoryOptions.map((c) => (
                    <label
                      key={c.slug}
                      className="flex items-center gap-2 text-sm text-gray-400"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(c.slug)}
                        onChange={() => toggleCat(c.slug)}
                      />
                      <span>{c.name}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">
                    No Category.{" "}
                    {isCategoriesError && (
                      <button
                        className="underline"
                        onClick={() => refetchCategories()}
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold mb-2">Price</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border rounded-md bg-background p-2 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border rounded-md bg-background p-2 text-sm"
                />
              </div>
            </div>
            <Button className="w-full" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {status === "pending" ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try resetting or loosening the filters to discover available products."
              href="/shop"
              showButton={false}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {sorted.map((b) => (
                  <ProductCard key={b.id} product={b} />
                ))}
              </div>
              <div className="flex justify-center mt-6">
                {hasNextPage && (
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full px-4 py-10 text-center text-sm text-gray-500">
          Loading...
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
