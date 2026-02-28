"use client";

import { useBrands } from "@/lib/hooks/use-brand"; // Asumsi hook brand Anda
import { Award, ArrowRight, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BrandsPage() {
  const { data, isLoading, isError, refetch } = useBrands();
  const brands = data?.data ?? [];

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Section */}
      <section className="relative w-full bg-slate-900 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(#059669 0.5px, transparent 0.5px)`,
          }}
        />

        <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Authorized Partners
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 leading-none">
            Our <span className="text-primary italic">Official</span> Brands.
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl leading-relaxed">
            We collaborate with world-class tech giants to ensure you get 100%
            authentic products with official warranties.
          </p>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="container max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-3xl bg-white border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group relative flex flex-col items-center justify-center h-40 md:h-48 rounded-[2rem] border border-white bg-white p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-2"
              >
                <div className="relative w-full h-full flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                  {brand.imageUrl ? (
                    <Image
                      src={brand.imageUrl}
                      alt={brand.name}
                      width={120}
                      height={60}
                      className="object-contain max-h-12 md:max-h-16 group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-xl font-black text-slate-200 uppercase tracking-tighter">
                      {brand.name}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    View Shop <ArrowRight size={10} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
