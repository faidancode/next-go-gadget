import { Footer } from "@/components/shared/footer-component";
import { Navbar } from "@/components/shared/navbar-component";
import Script from "next/script";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col pb-6 lg:pb-0">
      <Navbar />
      <main className="flex-1 py-4">{children}</main>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <Footer />
    </div>
  );
}
