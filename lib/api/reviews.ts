import type { ApiEnvelope } from "@/types/api";
import { z } from "zod";
import { apiRequest } from "./fetcher";
import { ListResult, toListResult } from "./normalizers";
import { Review } from "@/types/review";

// ============================================
// SCHEMAS
// ============================================

const reviewSchema = z.object({
  id: z.string(),
  productId: z.string().optional().nullable(),
  productSlug: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
  productImageUrl: z.string().optional().nullable(),
  rating: z.number(),
  title: z.string().optional().nullable(),
  comment: z.string().optional().nullable(),
  createdAt: z.string(),
});

const userReviewsEnvelopeSchema = z.object({
  data: z.object({
    reviews: z.array(reviewSchema).default([]),
    user: z
      .object({
        id: z.string(),
        name: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
        averageRating: z.number().optional().nullable(),
        totalReviews: z.number().optional().nullable(),
      })
      .optional()
      .nullable(),
    ratingCounts: z.record(z.string(), z.number()).optional().nullable(),
  }),
  meta: z.record(z.string(), z.unknown()).optional().nullable(),
});

// ============================================
// TYPES
// ============================================

export type ReviewWithProduct = z.infer<typeof reviewSchema>;

export type ReviewEligibilityReason =
  | "ELIGIBLE"
  | "UNAUTHENTICATED"
  | "ALREADY_REVIEWED"
  | "NOT_PURCHASED";

export type ReviewEligibility = {
  eligible: boolean;
  alreadyReviewed: boolean;
  reason?: ReviewEligibilityReason;
};

// Data types (without envelope wrapper)
type ReviewEligibilityData = {
  eligible: boolean;
  reason?: ReviewEligibilityReason;
};

export type CreateReviewPayload = {
  rating: number;
  comment: string;
  title?: string;
};

export type ProductMeta = {
  id: string;
  title: string;
  coverUrl: string;
  authorName: string | null;
  averageRating: number;
  totalReviews: number;
};

export type ProductReview = Review & {
  userName: string | null;
};

export type RatingCount = {
  rating: number;
  count: number;
};

export type ProductReviewsPageData = {
  product: ProductMeta;
  reviews: ProductReview[];
  ratingCounts: RatingCount[];
};

export type ProductReviewsApiResponse = ApiEnvelope<ProductReviewsPageData>;

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get reviews by user ID
 */
export async function listReviewsByUser(
  userId: string,
  params?: {
    page?: number;
    limit?: number;
    sorter?: string;
    ratingFilter?: number | string;
  },
): Promise<ListResult<ReviewWithProduct>> {
  if (!userId) {
    return { items: [], meta: {}, raw: null };
  }

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;

  const payload = await apiRequest<unknown>(
    `/reviews?page=${page}&limit=${limit}`,
  );

  // Try parsing with schema first
  const parsedEnvelope = userReviewsEnvelopeSchema.safeParse(payload);

  if (parsedEnvelope.success) {
    return {
      items: parsedEnvelope.data.data.reviews,
      meta: parsedEnvelope.data.meta ?? {},
      raw: payload,
    };
  }

  // Fallback to generic parser
  const parsed = toListResult<ReviewWithProduct>(payload);
  const items = parsed.items
    .map((item) => {
      const result = reviewSchema.safeParse(item);
      return result.success ? result.data : null;
    })
    .filter(Boolean) as ReviewWithProduct[];

  return { ...parsed, items };
}

/**
 * Check if user is eligible to review a product
 */
export async function checkReviewEligibility(
  slug: string,
): Promise<ReviewEligibility> {
  if (!slug) {
    throw new Error("Slug is required to check eligibility.");
  }

  // apiRequest returns ApiEnvelope<ReviewEligibilityData>
  const response = await apiRequest<ReviewEligibilityData>(
    `/products/${slug}/reviews/eligibility`,
  );

  if (!response?.ok || !response?.data) {
    throw new Error("Failed to check review eligibility.");
  }

  const { eligible, reason } = response.data;

  return {
    eligible: eligible ?? false,
    reason,
    alreadyReviewed: reason === "ALREADY_REVIEWED",
  };
}

/**
 * Create a new review for a product
 */
export async function createReview(
  slug: string,
  payload: CreateReviewPayload,
): Promise<ApiEnvelope<unknown>> {
  if (!slug) {
    throw new Error("Slug is required to create a review.");
  }

  return apiRequest<unknown>(`/products/${slug}/reviews`, payload, {
    method: "POST",
  });
}

/**
 * Get paginated reviews for a product
 */
export async function getProductReviews(
  slug: string,
  params: {
    page: number;
    limit: number;
    sort?: string;
    rating?: number;
  },
): Promise<ApiEnvelope<ProductReviewsPageData>> {
  const query = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.sort && { sort: params.sort }),
    ...(params.rating && { rating: params.rating.toString() }),
  });

  // apiRequest returns ApiEnvelope<ProductReviewsPageData>
  return apiRequest<ProductReviewsPageData>(
    `/products/${slug}/reviews?${query.toString()}`,
  );
}
