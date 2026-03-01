"use client";

import { useAuthStore } from "@/app/stores/auth";
import { DefaultImage } from "@/components/shared/default-image";
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
import { useToggleWishlist, useWishlist } from "@/lib/hooks/use-wishlist";
import { cn, formatIDR } from "@/lib/utils";
import {
  ReviewFormValues,
  reviewSchema,
} from "@/lib/validations/review-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, InfoIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Product Image */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center p-8 group">
              {product.discountPriceCents && (
                <span className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10 animate-pulse">
                  Sale
                </span>
              )}
              {product.imageUrl ? (

                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={500}
                  height={500}
                  priority
                  className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <DefaultImage />
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="space-y-8">
            {/* Header Info */}
            <section className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  {product.averageRating ? (
                    <div className="flex items-center gap-1">
                      <RatingStars value={product.averageRating} size={16} />
                      <span className="text-sm font-bold text-slate-900 ml-1">
                        {product.averageRating}
                      </span>
                    </div>
                  ) : null}
                  <span className="text-slate-300">|</span>
                  <span className="text-sm font-medium text-slate-500">
                    {product.ratingCount || 0} customer reviews
                  </span>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <p className="text-3xl font-black text-slate-900">
                  {product.discountPriceCents
                    ? formatIDR(product.discountPriceCents)
                    : formatIDR(product.price)}
                </p>
                {product.discountPriceCents && (
                  <p className="text-lg text-slate-400 line-through font-medium">
                    {formatIDR(product.price)}
                  </p>
                )}
              </div>
            </section>

            {/* Action Buttons */}
            <section className="flex flex-col sm:flex-row items-center gap-4 border-y border-slate-100 py-8">
              <Button
                onClick={() => addToCart()}
                disabled={isPendingAddToCart}
                className="w-full sm:flex-1 h-14 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-emerald-100 hover:opacity-90 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingBag size={20} />
                {isPendingAddToCart ? "Adding..." : "Add to Cart"}
              </Button>

              <Button
                variant="outline"
                onClick={() => toggleWishlist()}
                disabled={isPendingAddToWishlist}
                className={cn(
                  "h-14 px-8 rounded-2xl border-slate-200 font-bold transition-all flex items-center gap-2",
                  isWishlisted
                    ? "border-red-100 bg-red-50 text-red-600"
                    : "hover:bg-slate-50",
                )}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "currentColor" : "none"}
                  className={isWishlisted ? "animate-bounce" : ""}
                />
                <span>{isWishlisted ? "Saved" : "Save"}</span>
              </Button>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                Description
              </h2>
              <div className="text-slate-600 leading-relaxed font-medium">
                {product.description ||
                  "No technical specifications available for this product."}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="pt-10 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Reviews</h2>
                {product.reviews.length > 0 && (
                  <Link
                    href={`/products/${slug}/review`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    See all {product.ratingCount} reviews
                  </Link>
                )}
              </div>

              {product.reviews.length === 0 ? (
                <div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">
                    Be the first to review this product.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.reviews.slice(0, 4).map((review) => (
                    <article
                      key={review.id}
                      className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <RatingStars value={review.rating} size={12} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm mb-1">
                        {review.title}
                      </p>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4 italic">
                        "{review.comment}"
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                          {review.userName?.[0] || "C"}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {review.userName || "Customer"}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Review Form Logic */}
            {userId && isEligibleToReview && !hasReviewed && (
              <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-8 text-white">
                <h3 className="text-2xl font-bold mb-2 text-emerald-400">
                  Share your thoughts
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  How is your experience with {product.name}?
                </p>
                {/* ... (Form Review Anda diletakkan di sini dengan styling Dark agar kontras) */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
