import { Brands } from "@/components/home/brand-list";
import { Categories } from "@/components/home/category-list";
import { NewRelease } from "@/components/home/new-release-list";
// Import HeroSlider nanti di sini
// import { HeroSlider } from "@/components/home/hero-slider";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background font-sans overflow-x-hidden">
      {/* 1. HERO SECTION (Wajib untuk Gadget Store) */}
      {/* Di sini tempat slider promo besar atau banner flagship produk */}
      <section className="w-full">
        {/* <HeroSlider /> */}
        {/* Placeholder Hero jika belum ada komponennya */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative w-full h-75 md:h-125 rounded-[2.5rem] bg-slate-900 overflow-hidden flex items-center shadow-2xl shadow-emerald-900/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070')] bg-cover bg-center opacity-40 mix-blend-overlay" />
            <div className="relative z-10 px-8 md:px-16 max-w-2xl">
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
                Limited Edition
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                Elevate Your{" "}
                <span className="text-primary italic">Digital</span> Experience.
              </h1>
              <button className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
                Shop Current Deals
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full gap-12 md:gap-20 py-12 md:py-20">
          {/* Categories - Diletakkan di atas sebagai navigasi cepat */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Categories />
          </section>

          {/* New Release - Produk Utama */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <NewRelease />
          </section>

          {/* Brands - Sebagai Trust Signals di bagian bawah */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Brands />
          </section>
        </div>
      </div>
    </main>
  );
}
