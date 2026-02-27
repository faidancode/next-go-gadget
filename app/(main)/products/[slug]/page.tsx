"use client";

import { useAuthStore } from "@/app/stores/auth";
import LinkButton from "@/components/shared/link-button";
import { RatingStars } from "@/components/shared/rating-stars";
import { renderStars } from "@/components/shared/render-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api/fetcher";
import { CreateReviewPayload } from "@/lib/api/reviews";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { useProduct } from "@/lib/hooks/use-product";
import {
  useAddReview,
  useCheckReviewEligibility,
} from "@/lib/hooks/use-review";
import {
  useToggleWishlist,
  useWishlist
} from "@/lib/hooks/use-wishlist";
import { formatIDR } from "@/lib/utils";
import {
  ReviewFormValues,
  reviewSchema,
} from "@/lib/validations/review-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, InfoIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      title: "",
      comment: "",
    },
  });

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useProduct(slug, userId ?? "guest");

  const { mutate: addToCart, isPending: isPendingAddToCart } =
    useAddToCart(product);
  const { data: wishlist } = useWishlist(userId);

  const {
    toggleWishlist,
    isWishlisted,
    isPending: isPendingAddToWishlist,
  } = useToggleWishlist(product?.id, wishlist);

  const {
    data: reviewEligibility,
    isLoading: isCheckingEligibility,
    error: eligibilityError,
    refetch: refetchReviewEligibility,
  } = useCheckReviewEligibility(slug, userId);

  const { mutate: mutateReview, isPending: isPendingAddReview } = useAddReview(
    slug,
    userId,
  );

  const hasReviewed =
    reviewEligibility?.alreadyReviewed ||
    reviewEligibility?.reason === "ALREADY_REVIEWED" ||
    false;
  const isEligibleToReview =
    reviewEligibility?.eligible ||
    reviewEligibility?.reason === "ELIGIBLE" ||
    false;

  const handleSubmitReview = (values: ReviewFormValues) => {
    if (!product || !slug) return;
    if (!user) {
      toast.error("Please log in to write a review.");
      return;
    }
    if (!isEligibleToReview || hasReviewed) {
      const message =
        reviewEligibility?.reason ?? "You are not eligible to write a review.";
      toast.error(message);
      return;
    }

    mutateReview(values as CreateReviewPayload);
  };

  const reviewEligibilityMessage = useMemo(() => {
    if (!user) return "Please log in to write a review.";
    if (isCheckingEligibility) return "Checking review eligibility...";
    if (eligibilityError)
      return getErrorMessage(
        eligibilityError,
        "Unable to check review eligibility.",
      );
    if (hasReviewed) return "You already wrote a review for this product.";
    if (!isEligibleToReview) {
      switch (reviewEligibility?.reason) {
        case "NOT_PURCHASED":
          return "You can only review after your purchase is completed.";
        case "UNAUTHENTICATED":
          return "Please log in to write a review.";
        case "ALREADY_REVIEWED":
          return "You already wrote a review for this product.";
        default:
          return (
            reviewEligibility?.reason ??
            "Not eligible yet. Make sure the order is completed and no review was submitted before."
          );
      }
    }
    return null;
  }, [
    eligibilityError,
    hasReviewed,
    isCheckingEligibility,
    isEligibleToReview,
    reviewEligibility?.reason,
    user,
  ]);

  if (isProductLoading) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Loading product details...
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        Product not found.
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Carousel */}
        <div className="lg:col-span-4">
          <div className="overflow-hidden rounded-lg items-center justify-center flex">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={240}
              height={280}
              className="aspect-1 object-cover rounded-lg border border-white shadow-2xl"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-8">
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center mt-1">
                {product.averageRating ? (
                  <RatingStars value={product.averageRating} size={16} />
                ) : null}
                {product.ratingCount ? (
                  <span className="text-sm text-gray-400 ml-2">
                    {product.ratingCount} reviews
                  </span>
                ) : null}
              </div>

              <p className="text-xl font-semibold mt-4">
                {product.discountPriceCents
                  ? formatIDR(product.discountPriceCents)
                  : formatIDR(product.price)}
              </p>
              {product.discountPriceCents ? (
                <p className="text-gray-400 line-through mt-auto">
                  {formatIDR(product.price)}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={() => toggleWishlist()}
                disabled={isPendingAddToWishlist}
                className="font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Heart
                  fill={isWishlisted ? "currentColor" : "none"}
                  strokeWidth={1.5}
                  className={isWishlisted ? "text-red-500" : ""}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>

              <Button
                onClick={() => addToCart()}
                disabled={isPendingAddToCart}
                className="font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                {isPendingAddToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-2">Description</h2>
              <div className="pt-2 text-sm leading-relaxed text-gray-700">
                {product.description || "No description available."}
              </div>
            </div>

            <div className="mt-10">
              <div className="flex justify-between  mb-4">
                <h2 className="text-lg font-semibold">
                  Read Testimonials{" "}
                  {product.ratingCount ? `(${product.ratingCount})` : null}
                </h2>
                {product.reviews.length > 0 && (
                  <LinkButton
                    text="View All"
                    href={`/products/${slug}/review`}
                  />
                )}
              </div>
              {product.reviews.length === 0 ? (
                <div className="text-sm text-gray-500">No testimonial yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* {product.reviews.slice(0, 5).map((r) => ( */}
                  {product.reviews.slice(0, 5).map((review) => {
                    const reviewer = review.userName ?? "Customer";
                    const comment = review.comment ?? "No Comment.";
                    return (
                      <article
                        key={review.id}
                        className="rounded-lg bg-tertiary p-4 border border-gray-200"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-2">
                            <div className="flex ">
                              <RatingStars value={review.rating} size={16} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-secondary"></div>

                        {review.title && (
                          <p className="mt-2 text-sm font-semibold text-gray-300">
                            {review.title}
                          </p>
                        )}
                        <p className="mt-2 text-sm text-gray-400 my-2">
                          {comment}
                        </p>
                        <div className="text-sm font-semibold">{reviewer}</div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                      </article>
                    );
                  })}
                </div>
              )}

              {userId && (
                <div>
                  <div className=" mb-4 mt-8">
                    {isEligibleToReview && !hasReviewed && (
                      <h3 className="text-lg font-semibold text-secondary">
                        Write a Review
                      </h3>
                    )}
                  </div>
                  <div>
                    {reviewEligibilityMessage ? (
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600">
                              Reviews are available once the purchase is
                              completed (1 review per product).
                            </p>
                          </div>
                          {/* <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-secondary"
                            onClick={() => refetchReviewEligibility()}
                            disabled={isCheckingEligibility}
                          >
                            {isCheckingEligibility ? "Checking..." : "Re-check"}
                          </Button> */}
                        </div>

                        <div className="flex gap-2 items-center rounded-md border border-cyan-100 bg-cyan-50 p-3 text-sm text-cyan-700">
                          <InfoIcon />
                          {reviewEligibilityMessage}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-tertiary p-4">
                        <form
                          className="space-y-3"
                          onSubmit={handleSubmit(handleSubmitReview)}
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-sm text-gray-300">
                                Rating
                              </label>
                              <Controller
                                control={control}
                                name="rating"
                                render={({ field }) => (
                                  <Select
                                    value={String(field.value)}
                                    onValueChange={(val) =>
                                      field.onChange(Number(val))
                                    }
                                  >
                                    <SelectTrigger className="bg-background/40 text-sm text-gray-200">
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[5, 4, 3, 2, 1].map((rating) => (
                                        <SelectItem
                                          key={rating}
                                          value={String(rating)}
                                        >
                                          <div className="flex items-center gap-2">
                                            {renderStars(rating)}
                                            <span className="text-xs text-gray-400">
                                              {rating}/5
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.rating?.message && (
                                <p className="text-xs text-destructive">
                                  {errors.rating.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm text-gray-300">
                                Title (optional)
                              </label>
                              <Input
                                {...register("title")}
                                placeholder="Example: A must-read product"
                              />
                              {errors.title?.message && (
                                <p className="text-xs text-destructive">
                                  {errors.title.message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm text-gray-300">
                              Review
                            </label>
                            <textarea
                              {...register("comment")}
                              className="w-full rounded-md border border-border bg-background/40 p-3 text-sm text-gray-200 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                              rows={4}
                              placeholder="Share your experience after reading this product..."
                            />
                            {errors.comment?.message && (
                              <p className="text-xs text-destructive">
                                {errors.comment.message}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-3">
                            <Button
                              type="submit"
                              variant="secondary"
                              disabled={isPendingAddReview}
                              className="min-w-32"
                            >
                              {isPendingAddReview
                                ? "Saving..."
                                : "Submit Review"}
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
    </div>
  );
}
