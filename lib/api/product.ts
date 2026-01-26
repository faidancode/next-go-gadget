import { Product, ProductListParams } from "@/types/product";
import { apiRequest, buildQueryString } from "./fetcher";
import { ListResult, toListResult, unwrapSingle } from "./normalizers";

const PRODUCTS_ENDPOINT = "/products";

export async function listProducts<TProduct extends Product = Product>(
  params?: ProductListParams,
): Promise<ListResult<TProduct>> {
  const query = buildQueryString({
    page: params?.page,
    pageSize: params?.pageSize,
    search: params?.search,
    categories: params?.categories,
    category: params?.category ?? params?.categories?.[0],
    minPrice: params?.minPrice,
    maxPrice: params?.maxPrice,
    sort: params?.sort,
  });

  const endpoint = query ? `${PRODUCTS_ENDPOINT}?${query}` : PRODUCTS_ENDPOINT;
  const payload = await apiRequest<unknown>(endpoint);
  return toListResult<TProduct>(payload);
}

export async function getProduct<TProduct extends Product = Product>(
  idOrSlug: string,
  options?: { userId?: string },
): Promise<TProduct | null> {
  if (!idOrSlug) return null;
  const query = buildQueryString({ userId: options?.userId });
  const endpoint = query
    ? `${PRODUCTS_ENDPOINT}/${idOrSlug}?${query}`
    : `${PRODUCTS_ENDPOINT}/${idOrSlug}`;
  const payload = await apiRequest<unknown>(endpoint);
  return unwrapSingle<TProduct>(payload);
}
