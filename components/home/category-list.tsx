"use client";

import { Button } from "@/components/ui/button";
import { useCategories } from "@/lib/hooks/use-category";
import { ChevronRight, InfoIcon, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LinkButton from "../shared/link-button";

export function Categories() {
  const { data, isLoading, isError, refetch } = useCategories();

  const categories = data?.data ?? [];
  const displayed = categories.slice(0, 6);

  return (
    <section className="w-full py-12 md:py-16">
      {/* Header Section */}
      <div className="flex w-full items-end justify-between mb-10">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Explore <span className="text-primary italic">Categories</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-md">
            Find the best hardware and peripherals tailored to your productivity
            needs.
          </p>
        </div>
        <LinkButton text="Explore All" href="/categories" />
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 rounded-[1.5rem] bg-slate-100 animate-pulse border border-slate-200"
            />
          ))
        ) : displayed.length > 0 ? (
          displayed.map((cat) => (
            <Link
              key={cat.id ?? cat.slug}
              href={`/shop/categories/${cat.slug}`}
              className="group relative flex items-center gap-5 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-emerald-100 active:scale-[0.97]"
            >
              {/* Soft Background Decor on Hover */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Icon Container */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 transition-all duration-500 group-hover:bg-primary group-hover:rotate-6">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    width={36}
                    height={36}
                    alt={cat.name}
                    className="h-9 w-9 object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-0 group-hover:invert"
                  />
                ) : (
                  <LayoutGrid className="h-7 w-7 text-slate-400 transition-colors group-hover:text-white" />
                )}
              </div>

              {/* Text Content */}
              <div className="flex flex-col min-w-0 z-10">
                <span className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">
                  {cat.name}
                </span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5 group-hover:text-slate-500">
                  Browse Collection
                </p>
              </div>

              {/* Arrow on Hover (Mobile friendly) */}
              <div className="ml-auto opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 p-20 text-center bg-slate-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <LayoutGrid className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              There are no categories to display yet.
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-4">
          <InfoIcon size={16} />
          <span className="font-medium">Failed to load categories.</span>
          <button
            className="font-bold underline decoration-2 underline-offset-4 hover:text-red-800 transition-colors"
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
