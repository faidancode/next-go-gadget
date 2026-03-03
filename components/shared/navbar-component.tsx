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
import {
  BadgeCheck,
  ChevronRight,
  Home,
  LayoutGrid,
  Menu,
  ShoppingBag,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

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
            <span className="italic text-xl tracking-tighter text-slate-900">
              {appName}
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Shop", "Categories", "Brands"].map((item) => (
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
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Drawer with Framer Motion */}
      {/* Mobile Drawer with Framer Motion */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              /* Tambahkan z-index yang lebih tinggi dan pastikan bg-white solid */
              className="fixed left-0 top-0 z-60 h-full w-[85%] max-w-[320px] bg-white opacity-100 shadow-2xl md:hidden flex flex-col border-r border-slate-300"
            >
              {/* Header Drawer */}
              <div className="p-6 bg-white flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-1.5 rounded-lg">
                    <Image
                      src="/logo.svg"
                      alt="Logo"
                      width={18}
                      height={18}
                      className="brightness-0 invert"
                    />
                  </div>
                  <span className="italic text-xl tracking-tighter text-slate-900">
                    {appName}
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 bg-slate-50 text-slate-400 rounded-full hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-8 flex flex-col gap-1 bg-white">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                  Main Menu
                </p>
                {[
                  { name: "Home", href: "/", icon: <Home size={20} /> },
                  {
                    name: "Shop",
                    href: "/shop",
                    icon: <ShoppingBag size={20} />,
                  },
                  {
                    name: "Categories",
                    href: "/categories",
                    icon: <LayoutGrid size={20} />,
                  },
                  {
                    name: "Brands",
                    href: "/brands",
                    icon: <BadgeCheck size={20} />,
                  },
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-bold transition-all duration-200",
                        isActive
                          ? "bg-emerald-50 text-primary shadow-sm shadow-emerald-100/50"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          isActive ? "text-primary" : "text-slate-400",
                        )}
                      >
                        {item.icon}
                      </span>
                      {item.name}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer Area: User Profile / Login */}
              <div className="p-6 mt-auto border-t border-slate-50 bg-white">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm">
                        <UserIcon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 leading-none">
                          My Account
                        </span>
                        <span className="text-xs text-slate-500 mt-1 truncate max-w-37.5">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          router.push("/account");
                          setDrawerOpen(false);
                        }}
                        className="rounded-xl border-slate-200 font-bold text-xs h-11"
                      >
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600 h-11"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-slate-900 text-white shadow-xl shadow-slate-200 transition-transform active:scale-95"
                  >
                    Sign In to Store
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
