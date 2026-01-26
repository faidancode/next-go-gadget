import { PaginationMeta } from "@/types";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { unwrapSingle } from "./normalizers";
import { Brand, BrandListResponse } from "@/types/brand";

const CATEGORY_ENDPOINT = "/brands";

export async function getBrands(
  page: number,
  pageSize: number,
): Promise<BrandListResponse> {
  const query = buildQueryString({ page, pageSize });
  const path = query ? `/brands?${query}` : "/brands";

  console.log({ path });
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
  const payload = await apiRequest<unknown>(`${CATEGORY_ENDPOINT}/${slugOrId}`);
  return unwrapSingle<Brand>(payload);
}
