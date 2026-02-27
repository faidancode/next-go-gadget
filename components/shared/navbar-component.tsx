"use client";

import { useAuthStore } from "@/app/stores/auth";
import { selectTotalItems, useCartStore } from "@/app/stores/cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/api/fetcher";
import { Menu, ShoppingBag, User as UserIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const appName = process.env.APP_NAME || "GoGadget";
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const totalItems = useCartStore(selectTotalItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await apiRequest<{ success: boolean }>(
        "/auth/logout",
        {},
        { method: "POST" },
      );
    } catch {
      // ignore
    } finally {
      router.replace("/login");
      logout();
      toast.success("You have been logged out.");
    }
  }

  useEffect(() => {
    if (pathname?.startsWith("/account")) setDrawerOpen(false);
  }, [pathname]);

  const handleCartClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/cart");
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-[oklch(0.648_0.2_131.684)] p-1.5 rounded-xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={22}
                height={22}
                className="brightness-0 invert"
              />
            </div>
            <span className="font-serif italic text-xl tracking-tighter text-slate-900">
              {appName}
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Shop", "Categories"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[oklch(0.648_0.2_131.684)]",
                pathname === (item === "Home" ? "/" : `/${item.toLowerCase()}`)
                  ? "text-[oklch(0.648_0.2_131.684)]"
                  : "text-slate-500",
              )}
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCartClick}
            className="relative p-2.5 text-slate-600 hover:bg-slate-50 rounded-full transition-all border border-transparent hover:border-slate-100"
          >
            <ShoppingBag size={20} />
            {user && totalItems > 0 && (
              <span className="absolute top-1 right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {!user ? (
            <Link
              href="/login"
              className="hidden sm:block px-6 py-2 rounded-full text-sm font-bold bg-primary text-white transition-transform active:scale-95 shadow-md shadow-emerald-100"
            >
              Login
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-100 transition-all">
                  <UserIcon size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 p-2 rounded-2xl border-slate-100 shadow-xl"
              >
                <DropdownMenuItem
                  onSelect={() => router.push("/account")}
                  className="rounded-xl py-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-700 font-medium"
                >
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="rounded-xl py-3 cursor-pointer focus:bg-red-50 focus:text-red-600 font-medium"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Drawer with Framer Motion */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl p-6 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-serif italic text-2xl tracking-tighter text-slate-900">
                  {appName}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {["Home", "Shop", "Categories"].map((item) => (
                  <Link
                    key={item}
                    href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-4 rounded-2xl text-lg font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </nav>

              {!user && (
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-4 rounded-2xl text-center font-bold bg-primary text-white shadow-lg shadow-emerald-100"
                >
                  Sign In
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
