"use client";

import { Button } from "@/components/ui/button";
import { useBrands } from "@/lib/hooks/use-brand";
import { ChevronRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LinkButton from "../shared/link-button";

export function Brands() {
  const { data, isLoading, isError, refetch } = useBrands();

  const brands = data?.data ?? [];
  const displayed = brands.slice(0, 6);

  return (
    <section className="w-full py-12 md:py-16 bg-slate-50/50 -mx-4 px-4 sm:-mx-8 sm:px-8 rounded-[3rem]">
      {/* Header Section */}
      <div className="flex w-full items-end justify-between mb-10">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Trusted <span className="text-primary italic">Brands</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-md">
            Collaborating with world-class manufacturers to bring you
            excellence.
          </p>
        </div>
        <LinkButton text="View All Brands" href="/brands" />
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-3xl bg-white animate-pulse border border-slate-100 shadow-sm"
            />
          ))
        ) : displayed.length > 0 ? (
          displayed.map((brand) => (
            <Link
              key={brand.id ?? brand.slug}
              href={`/brands/${brand.slug}`}
              className="group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[2rem] border border-transparent bg-white p-8 transition-all duration-500 hover:border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-95 shadow-sm"
            >
              {/* Logo Container */}
              <div className="relative h-12 w-full flex items-center justify-center filter grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110">
                {brand.imageUrl ? (
                  <Image
                    src={brand.imageUrl}
                    fill
                    alt={brand.name}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xl font-black text-slate-200 group-hover:text-primary transition-colors">
                    {brand.name}
                  </span>
                )}
              </div>

              {/* Hover Label */}
              <div className="absolute inset-x-0 bottom-0 py-2 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1">
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                  Explore {brand.name}
                </span>
                <ChevronRight size={10} className="text-white" />
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center">
            <p className="text-slate-400 font-medium italic">
              No brand partners found.
            </p>
          </div>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <div className="mt-8 flex items-center justify-center gap-3 text-red-500">
          <p className="text-sm font-semibold">Failed to load brand data.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="hover:bg-red-50"
          >
            Retry
          </Button>
        </div>
      )}
    </section>
  );
}
