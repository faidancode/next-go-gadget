import { ApiEnvelope } from "./api";

export type Review = {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productSlug?: string | null;
  productName?: string | null;
  productImageUrl?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
};



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
  body: string;
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
