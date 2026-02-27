"use client";

import { Product } from "@/types/product"; // Pastikan path benar
import { Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { DefaultImage } from "./default-image";
import { ReactNode } from "react";

interface ProductCardProps {
  product: Product;
  actions?: ReactNode;
}

export function ProductCard({ product, actions }: ProductCardProps) {
  const hasDiscount = !!product.discountPriceCents;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-slate-50/50 m-2 rounded-[1.5rem] flex items-center justify-center"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <DefaultImage />
        )}

        {/* Badge Discount */}
        {hasDiscount && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-[9px] font-black tracking-widest text-white shadow-lg shadow-red-200 uppercase">
            Sale
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 pt-3">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {product.categoryName || "Gadget"}
          </p>
          {product.ratingAvg > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-bold text-slate-600">
                {product.ratingAvg}
              </span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.slug}`} className="mb-3">
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="mt-auto flex flex-col gap-0.5">
          {hasDiscount ? (
            <>
              <span className="text-[11px] font-medium text-slate-400 line-through">
                {formatIDR(product.price)}
              </span>
              <span className="text-base font-black text-primary">
                {formatIDR(product.discountPriceCents!)}
              </span>
            </>
          ) : (
            <span className="text-base font-black text-slate-900">
              {formatIDR(product.price)}
            </span>
          )}
        </div>

        {/* Actions Button */}
        {actions && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
