import { useQuery } from "@tanstack/react-query";
import { getBrand, getBrands } from "../api/brand";

// hooks/use-Brand.ts
export function useBrands(params?: { scope?: string; limit?: number }) {
  const limit = params?.limit ?? 100;
  const scope = params?.scope ?? "general";

  return useQuery({
    queryKey: ["Brands", { scope, limit }],
    queryFn: async () => {
      try {
        const result = await getBrands(1, limit);
        return result;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useBrand(slug: string) {
  return useQuery({
    queryKey: ["Brand-detail", slug],
    queryFn: () => (slug ? getBrand(slug) : Promise.resolve(null)),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 10,
  });
}
