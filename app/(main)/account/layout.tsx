"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth";
import {
  User,
  Receipt,
  MessageSquare,
  Heart,
  MapPin,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

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
    { label: "Profile", href: "/account", icon: <User size={18} /> },
    {
      label: "My Orders",
      href: "/account/orders",
      icon: <Receipt size={18} />,
    },
    {
      label: "Reviews",
      href: "/account/reviews",
      icon: <MessageSquare size={18} />,
    },
    { label: "Wishlist", href: "/account/wishlist", icon: <Heart size={18} /> },
    {
      label: "Addresses",
      href: "/account/address",
      icon: <MapPin size={18} />,
    },
  ];

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Toaster richColors position="top-center" />

      {!user ? (
        /* Empty State / Unauthorized */
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <User size={32} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-500 mb-8 max-w-xs">
            Please login to manage your account and view your orders.
          </p>
          <Link href="/login">
            <Button className="h-12 px-10 rounded-full bg-slate-900 font-bold uppercase tracking-widest text-xs">
              Go to Login
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- SIDEBAR NAV --- */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-28 space-y-8">
              {/* User Brief Card */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-xl">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold truncate text-sm leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-1 uppercase tracking-wider font-black">
                      Member Store
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-1">
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  Account Menu
                </p>
                {items.map((it) => {
                  const isActive =
                    pathname === it.href ||
                    (it.href === "/account/orders" &&
                      pathname?.startsWith("/account/orders/"));

                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cn(
                        "group flex items-center gap-4 px-4 py-4 rounded-lg text-sm font-bold transition-all duration-200",
                        isActive
                          ? "bg-emerald-50 text-primary shadow-sm shadow-emerald-100/50"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-slate-400 group-hover:text-slate-600",
                        )}
                      >
                        {it.icon}
                      </span>
                      {it.label}
                      {isActive && (
                        <ChevronRight size={14} className="ml-auto" />
                      )}
                    </Link>
                  );
                })}

                <button className="mt-4 flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                  <LogOut size={18} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA --- */}
          <main className="lg:col-span-9 min-h-125">
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 md:p-10 border border-slate-200/70">
              {children}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
