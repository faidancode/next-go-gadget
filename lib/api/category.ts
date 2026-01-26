import { PaginationMeta } from "@/types";
import { apiRequest, buildQueryString, unwrapEnvelope } from "./fetcher";
import { unwrapSingle } from "./normalizers";
import { Category, CategoryListResponse } from "@/types/category";

const CATEGORY_ENDPOINT = "/categories";

export async function getCategories(
  page: number,
  pageSize: number,
): Promise<CategoryListResponse> {
  const query = buildQueryString({ page, pageSize });
  const path = query ? `/categories?${query}` : "/categories";

  console.log({ path });
  try {
    const envelope = await apiRequest<Category[]>(path);

    const data = unwrapEnvelope(envelope, "Failed to fetch categories");

    return {
      data,
      meta: envelope.meta as PaginationMeta,
    };
  } catch (error) {
    throw error;
  }
}

export async function getCategory(slugOrId: string): Promise<Category | null> {
  if (!slugOrId) return null;
  const payload = await apiRequest<unknown>(`${CATEGORY_ENDPOINT}/${slugOrId}`);
  return unwrapSingle<Category>(payload);
}
