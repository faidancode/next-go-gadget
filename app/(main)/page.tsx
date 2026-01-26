import { Brands } from "@/components/home/brand-list";
import { Categories } from "@/components/home/category-list";
import { NewRelease } from "@/components/home/new-release-list";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background font-sans">
      {/* Container utama dengan max-width */}
      <div className="w-full max-w-7-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Wrapper dengan gap antar section yang konsisten */}
        <div className="flex flex-col w-full gap-2 md:gap-8">
          <section>
            <Categories />
          </section>

          <section>
            <Brands />
          </section>
          <section>
            <NewRelease />
          </section>
        </div>
      </div>
    </main>
  );
}
