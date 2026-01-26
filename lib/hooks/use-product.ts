import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { resolveNextPage } from "../api/normalizers";
import { getProduct, listProducts } from "../api/product";
import { ProductDetail, ProductListParams } from "@/types/product";

const PAGE_SIZE = 10;
export function useProducts(
  params?: ProductListParams & { enabled?: boolean },
) {
  const {
    enabled = true,
    pageSize = PAGE_SIZE,
    categories,
    minPrice,
    maxPrice,
    sort,
  } = params || {};

  return useInfiniteQuery({
    queryKey: ["products", pageSize, categories, minPrice, maxPrice, sort],
    queryFn: ({ pageParam = 1 }) =>
      listProducts({
        page: pageParam,
        pageSize,
        categories,
        minPrice,
        maxPrice,
        sort,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      resolveNextPage(lastPage.meta, lastPage.items.length, pageSize),
    enabled,
  });
}

export function useProduct(slug?: string, userId?: string) {
  return useQuery({
    queryKey: ["product-detail", userId ?? "guest", slug],
    queryFn: () =>
      slug ? getProduct<ProductDetail>(slug) : Promise.resolve(null),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });
}
