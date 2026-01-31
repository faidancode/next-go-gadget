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
import { useCategory } from "@/lib/hooks/use-category";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Product } from "@/types/product";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "higher", label: "Higher Price" },
  { value: "lower", label: "Lower Price" },
  { value: "popular", label: "Most Popular" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function getProductPrice(product: Product) {
  return product.discountPriceCents ?? product.price ?? 0;
}

function sortProducts(list: Product[], sortBy: SortValue) {
  const sorted = [...list];
  switch (sortBy) {
    case "higher":
      return sorted.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    case "lower":
      return sorted.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    case "popular":
      return sorted.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
    case "newest":
    default:
      return sorted.sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
  }
}

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

  const { data: categoryDetail } = useCategory(slug);

  const products = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.items),
    [data],
  );

  const targetCategoryId = categoryDetail?.id ?? null;

  const filtered = useMemo(() => {
    const min = minPrice ? parseInt(minPrice, 10) : undefined;
    const max = maxPrice ? parseInt(maxPrice, 10) : undefined;
    return products.filter((b) => {
      const sameCategory = targetCategoryId
        ? b.categoryId === targetCategoryId
        : true;
      const priceValue = getProductPrice(b);
      const okMin = min === undefined || priceValue >= min;
      const okMax = max === undefined || priceValue <= max;
      return sameCategory && okMin && okMax;
    });
  }, [products, targetCategoryId, minPrice, maxPrice]);

  const sorted = useMemo(
    () => sortProducts(filtered, sortBy),
    [filtered, sortBy],
  );

  const categoryName =
    categoryDetail?.name ?? (slug ? slug.replace(/-/g, " ") : "Kategori");

  return (
    <div className="w-full px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Category
          </p>
          <h1 className="text-2xl font-semibold capitalize text-secondary">
            {categoryName}
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-gray-400">Sort by</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortValue)}
          >
            <SelectTrigger className="min-w-45 border-tertiary bg-tertiary text-sm text-gray-200">
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
          <div className="rounded-lg bg-tertiary p-4">
            <h2 className="font-semibold mb-3 text-secondary text-lg">
              Filter
            </h2>
            <div>
              <p className="text-sm font-semibold mb-2">Price</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-md bg-background p-2 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-md bg-background p-2 text-sm"
                />
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {status === "pending" ? (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : (
            <>
              {sorted.length === 0 ? (
                <div className="rounded-lg bg-tertiary p-6 text-center text-sm text-gray-400">
                  <EmptyState
                    title="No products found in this category"
                    description="We haven't added any products to this category yet."
                    href="/categories"
                    linkText="Back to Categories"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {sorted.map((b) => (
                    <ProductCard key={b.id} product={b} />
                  ))}
                </div>
              )}
              <div className="flex justify-center mt-6">
                {hasNextPage && (
                  <Button
                    variant="secondary"
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
