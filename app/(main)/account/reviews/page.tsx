"use client";

import { useAuthStore } from "@/app/stores/auth";
import { DefaultImage } from "@/components/shared/default-image";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useReviewsByUser } from "@/lib/hooks/use-review";
import { ReviewListItem } from "@/lib/validations/review-schema";
import { Review } from "@/types/review";
import { Star } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

function formatDate(date: string | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderStars(count: number) {
  const max = 5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => (
        <Star
          key={idx}
          size={14}
          className={idx < count ? "text-amber-500" : "text-gray-600"}
          strokeWidth={1.6}
          fill={idx < count ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewListItem }) {
  return (
    <Link
      href={review.productSlug ? `/products/${review.productSlug}` : "#"}
      className={`block rounded-lg border  p-4 gap-3 ${review.productSlug ? "hover:border-primary transition-colors" : ""
        }`}
    >
      <div className="flex gap-3">
        {review.productImageUrl ? (
          <img
            src={review.productImageUrl}
            alt={review.productName ?? "product cover"}
            className="w-16 h-24 rounded-lg bg-background object-cover"
          />
        ) : (
          <DefaultImage
            className="w-16 rounded"
            logoSize={16}
            logoOnly={true}
          />
        )}
        <div className="flex-1 space-y-1">
          <div className="font-semibold line-clamp-2">
            {review.productName ?? "product name unavailable"}
          </div>
          <div className="flex items-center gap-2">
            {renderStars(Math.round(review.rating))}
            <span className="text-xs ">{formatDate(review.createdAt)}</span>
          </div>
          {review.title ? (
            <div className="text-xs font-semibold ">{review.title}</div>
          ) : null}
          <div className="text-xs  leading-5">
            {review.comment ?? "No comment"}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const {
    data,
    isLoading,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useReviewsByUser(userId);

  const reviews = useMemo<ReviewListItem[]>(() => {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
  }, [data]);

  const stats = useMemo(() => {
    const firstPage = data?.pages?.[0];
    const ratingCounts =
      (
        firstPage?.raw as {
          data?: {
            ratingCounts?: Record<string, number>;
            totalReviews?: number;
            averageRating?: number;
          };
        }
      )?.data?.ratingCounts ?? {};
    const totalReviews =
      (firstPage?.raw as { data?: { totalReviews?: number } })?.data
        ?.totalReviews ?? 0;
    const averageRating =
      (firstPage?.raw as { data?: { averageRating?: number } })?.data
        ?.averageRating ?? null;
    return { ratingCounts, totalReviews, averageRating };
  }, [data]);

  const errorMessage = error
    ? getErrorMessage(error, "Failed to load reviews.")
    : null;

  if (!user) {
    return (
      <div className="py-4 text-sm">Please login to see your reviews.</div>
    );
  }

  return (
    <>
      <h1 className="text-lg font-semibold ">My Reviews</h1>

      {errorMessage && (
        <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {errorMessage}
        </div>
      )}

      {(isLoading || isFetching) && reviews.length === 0 && (
        <div className="py-4 text-sm">Loading reviews...</div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3">
        <div className="rounded-lg border  p-4 space-y-3">
          <div className="text-base font-semibold ">Your review stats</div>
          <div className="flex items-center justify-between">
            <div>
              <div className=" text-sm">Total reviews</div>
              <div className="text-2xl font-bold ">
                {stats.totalReviews ?? 0}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {[5, 4, 3, 2, 1].map((score) => {
              const count = stats.ratingCounts?.[String(score)] ?? 0;
              return (
                <div
                  key={score}
                  className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-3 text-sm ">
                    <div className="flex gap-2">
                      {score}
                      {renderStars(score)}
                    </div>
                    <div className="text-sm font-semibold">{count} reviews</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {reviews.length === 0 && !(isLoading || isFetching) ? (
          <div className="py-4 text-sm">
            You have not written any reviews yet.
          </div>
        ) : (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="px-6"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}

      {isFetching && reviews.length > 0 && !isFetchingNextPage && (
        <div className="mt-2 text-center text-xs">Syncing reviews...</div>
      )}
    </>
  );
}
