"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import { User, Receipt, MessageSquare, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const items = [
    { label: "Account", href: "/account", Icon: User },
    { label: "Orders", href: "/account/orders", Icon: Receipt },
    { label: "Reviews", href: "/account/reviews", Icon: MessageSquare },
    { label: "Wishlist", href: "/account/wishlist", Icon: Heart },
    { label: "Address", href: "/account/address", Icon: MapPin },
  ];

  return (
    <div className="w-full px-4">
      <Toaster richColors position="top-center" />
      {!isMounted ? (
        <div className="rounded-lg p-6 text-center text-sm animate-pulse">
          Loading account data...
        </div>
      ) : user ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-semibold">{user?.name || "User"}</div>
                  <div className="text-xs">
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              </div>

              {/* Small screens: horizontal square menu with icons */}
              {/* <nav className="md:hidden flex justify-between gap-1 overflow-x-auto py-1">
                {items.map(({ href, label, Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`shrink-0 w-16 h-16 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-colors ${
                        active
                          ? "bg-secondary text-white border-transparent"
                          : "bg-background/5 border-white/10 hover:bg-tertiary/70"
                      }`}
                    >
                      <span className="text-[9px] font-medium">{label}</span>
                    </Link>
                  );
                })}
              </nav> */}

              {/* md+ screens: vertical menu list */}
              <nav className="mt-2 grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-1">
                {items.map((it) => {
                  const startsWithOrder =
                    it.href === "/account/orders" &&
                    pathname?.startsWith("/account/orders/");
                  const active = pathname === it.href || startsWithOrder;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={`block w-full border  px-3 py-2 rounded transition-colors ${
                        active
                          ? "bg-primary text-white border-primary  "
                          : "border-tertiary"
                      }`}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
          <div className="border-t-2 md:hidden" />
          <section className="md:col-span-8 lg:col-span-9 space-y-4">
            {children}
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-center text-sm ">
          Please login to access your account.
          <Link href="/login">
            <Button className="ml-2" variant="secondary">
              Login
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
