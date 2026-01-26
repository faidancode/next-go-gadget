import { useQuery } from "@tanstack/react-query";
import { getCategory, getCategories } from "../api/category";

// hooks/use-category.ts
export function useCategories(params?: { scope?: string; pageSize?: number }) {
  const pageSize = params?.pageSize ?? 100;
  const scope = params?.scope ?? "general";

  return useQuery({
    queryKey: ["categories", { scope, pageSize }],
    queryFn: async () => {
      try {
        const result = await getCategories(1, pageSize);
        return result;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category-detail", slug],
    queryFn: () => (slug ? getCategory(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
}
