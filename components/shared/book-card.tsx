import { Book } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { CoverPlaceholder } from "./cover-placeholder";
import type { ReactNode } from "react";

function formatIDR(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
}

export function BookCard({
  book,
  actions,
}: {
  book: Book;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-tertiary">
      <Link
        href={`/books/${book.slug}`}
        aria-label={`View details for ${book.title}`}
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            className="h-36 sm:h-40 w-full object-cover"
            loading="lazy"
            width={300}
            height={500}
          />
        ) : (
          <CoverPlaceholder title={book.title} />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-500 capitalize">
            {book.authorName}
          </p>
          <p className="text-white text-sm line-clamp-2">{book.title}</p>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <div>
            <p className="shrink-0 text-xs sm:text-sm font-semibold text-secondary">
              {book.discountPriceCents
                ? formatIDR(book.discountPriceCents)
                : formatIDR(book.priceCents)}
            </p>
            {book.discountPriceCents ? (
              <p className="text-gray-400 text-xs line-through mt-1">
                {formatIDR(book.priceCents)}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-col gap-2 border-t border-white/10 pt-2">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
