"use client";

import { useCategories } from "@/lib/hooks/use-category";
import { LayoutGrid, ArrowRight, Loader2, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CategoriesPage() {
  const { data, isLoading, isError, refetch } = useCategories();
  const categories = data?.data ?? [];

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. Page Header with Hero-like feel */}
      <section className="relative w-full bg-white border-b border-slate-100 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
              <LayoutGrid size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Categories
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6">
              Full <span className="text-primary italic">Catalog</span>{" "}
              Categories.
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Navigate through our specialized tech departments. From
              high-performance components to daily peripherals, we've organized
              everything for your setup.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Main Grid Section */}
      <section className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {isLoading ? (
          /* Loading State: Grid of Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-[2.5rem] bg-white border border-slate-100 animate-pulse shadow-sm"
              />
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-red-100 shadow-xl shadow-red-900/5">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Failed to load the catalog
            </h3>
            <p className="text-slate-500 mb-8">
              Connectivity issues. Please check your network.
            </p>
            <button
              onClick={() => refetch()}
              className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* Data State: Interactive Large Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative flex flex-col h-72 overflow-hidden rounded-[2.5rem] border border-white bg-white p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2 shadow-sm"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Icon Area */}
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-primary group-hover:rotate-12">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        width={48}
                        height={48}
                        className="object-contain group-hover:brightness-0 group-hover:invert transition-all"
                      />
                    ) : (
                      <LayoutGrid
                        className="text-slate-300 group-hover:text-white"
                        size={32}
                      />
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="mt-auto">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-400 uppercase tracking-[0.2em]">
                      Explore Department
                    </p>
                  </div>

                  {/* Floating Action Button */}
                  <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 bg-white">
                    <ArrowRight size={20} className="text-primary" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 3. Help Section
      <section className="container max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">
            Can't find what you're looking for?
          </h2>
          <p className="text-slate-400 mb-8 relative z-10">
            Our customer support is ready to help you find the specific hardware
            you need.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-black rounded-full hover:bg-primary hover:text-white transition-all relative z-10 uppercase text-xs tracking-widest"
          >
            Contact Support
          </Link>
        </div>
      </section> */}
    </main>
  );
}
