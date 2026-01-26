"use client";

import { Product } from "@/types/product"; // Pastikan path benar
import { Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { DefaultImage } from "./default-image";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = !!product.discountPriceCents;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <DefaultImage />
        )}
        {hasDiscount && (
          <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
            SALE
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="mb-1">
          <h3 className="line-clamp-1 text-sm font-semibold group-hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm">{product.categoryName}</p>

        <div className="mt-auto flex flex-col">
          {hasDiscount ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatIDR(product.price / 100)}
              </span>
              <span className="text-sm font-bold text-primary">
                {formatIDR(product.discountPriceCents! / 100)}
              </span>
            </>
          ) : (
            <span className="text-sm font-bold">
              {formatIDR(product.price / 100)}
            </span>
          )}
        </div>

        <Button size="sm" className="mt-4 w-full gap-2 rounded-lg py-1 text-xs">
          <ShoppingCart className="h-3 w-3" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
