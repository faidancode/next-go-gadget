import { PaginationMeta } from "@/types";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { unwrapSingle } from "./normalizers";
import { Brand, BrandListResponse } from "@/types/brand";

const BRAND_ENDPOINT = "/brands";

export async function getBrands(
  page: number,
  limit: number,
): Promise<BrandListResponse> {
  const query = buildQueryString({ page, limit });
  const path = query ? `/brands?${query}` : "/brands";

  try {
    const envelope = await apiRequest<Brand[]>(path);

    const data = unwrapEnvelope(envelope, "Failed to fetch brands");

    return {
      data,
      meta: envelope.meta as PaginationMeta,
    };
  } catch (error) {
    throw error;
  }
}

export async function getBrand(slugOrId: string): Promise<Brand | null> {
  if (!slugOrId) return null;
  const payload = await apiRequest<unknown>(`${BRAND_ENDPOINT}/${slugOrId}`);
  return unwrapSingle<Brand>(payload);
}
