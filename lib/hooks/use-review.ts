import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../api/fetcher";
import { resolveNextPage } from "../api/normalizers";
import {
  ProductReviewsApiResponse,
  checkReviewEligibility,
  createReview,
  CreateReviewPayload,
  getProductReviews,
  listReviewsByUser,
  ReviewEligibility,
} from "../api/reviews";

export function useProductReviews(
  slug: string,
  sorter?: string,
  ratingFilter?: string | number,
) {
  return useInfiniteQuery<ProductReviewsApiResponse>({
    queryKey: ["product-reviews", slug, sorter, ratingFilter],
    queryFn: ({ pageParam = 1 }) => {
      return getProductReviews(slug, {
        page: pageParam as number,
        limit: 12,
        sort: sorter,
        rating: ratingFilter === "All" ? undefined : Number(ratingFilter),
      });
    },
    getNextPageParam: (lastPage) =>
      resolveNextPage(lastPage?.meta, lastPage?.data?.reviews?.length ?? 0, 12),
    initialPageParam: 1,
  });
}

export function useReviewsByUser(userId: string | null | undefined) {
  return useInfiniteQuery({
    queryKey: ["user-reviews", userId],
    queryFn: ({ pageParam = 1 }) => {
      if (!userId) {
        throw new Error("Slug is required to check eligibility.");
      }
      return listReviewsByUser(userId, {
        page: pageParam,
        limit: 5,
      });
    },

    getNextPageParam: (lastPage) =>
      resolveNextPage(lastPage?.meta, lastPage?.items?.length ?? 0, 12),
    initialPageParam: 1,
    enabled: Boolean(userId),
  });
}

export function useCheckReviewEligibility(
  slug: string,
  userId: string | null | undefined,
) {
  return useQuery<ReviewEligibility>({
    queryKey: ["review-eligibility", slug, userId],
    queryFn: () => {
      if (!slug) {
        throw new Error("Slug is required to check eligibility.");
      }

      return checkReviewEligibility(slug);
    },
    enabled: Boolean(slug && userId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export function useAddReview(slug: string, userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      if (!slug || !userId) {
        throw new Error("Slug and UserId is required to create a review.");
      }
      return createReview(slug, payload);
    },
    onSuccess: () => {
      toast.success("Thanks for submitting your review!");
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ["product-detail"] });
        queryClient.invalidateQueries({
          queryKey: ["review-eligibility", slug, userId],
        });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add review."));
    },
  });
}
