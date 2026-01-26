import { useQuery } from "@tanstack/react-query";
import { getBrand, getBrands } from "../api/brand";

// hooks/use-Brand.ts
export function useBrands(params?: { scope?: string; pageSize?: number }) {
  const pageSize = params?.pageSize ?? 100;
  const scope = params?.scope ?? "general";

  return useQuery({
    queryKey: ["Brands", { scope, pageSize }],
    queryFn: async () => {
      try {
        const result = await getBrands(1, pageSize);
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
