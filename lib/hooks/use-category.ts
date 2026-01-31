import { useQuery } from "@tanstack/react-query";
import { getCategory, getCategories } from "../api/category";

// hooks/use-category.ts
export function useCategories(params?: { scope?: string; limit?: number }) {
  const limit = params?.limit ?? 100;
  const scope = params?.scope ?? "general";

  return useQuery({
    queryKey: ["categories", { scope, limit }],
    queryFn: async () => {
      try {
        const result = await getCategories(1, limit);
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
