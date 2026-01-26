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
import { Menu, ShoppingBag, User as UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "./logo";

export function Navbar() {
  const appName = process.env.APP_NAME || "GoGadget";
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  async function handleLogout() {
    try {
      await apiRequest<{ success: boolean }>(
        "/auth/logout",
        {},
        { method: "POST" },
      );
    } catch {
      // ignore, tetap logout client
    } finally {
      router.replace("/login");
      logout();
      toast.success("You have been logged out.");
    }
  }
  const totalItems = useCartStore(selectTotalItems);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close drawer when navigating to /account
  useEffect(() => {
    if (pathname?.startsWith("/account")) {
      setDrawerOpen(false);
    }
  }, [pathname]);

  const handleCartClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/cart");
  };

  return (
    <div className="flex items-center justify-between mb-4 border-b border-gray-200 p-4 w-full relative">
      <button
        aria-label="Open menu"
        aria-expanded={drawerOpen}
        aria-controls="mobile-drawer"
        onClick={() => setDrawerOpen(true)}
        className="md:hidden rounded-full p-2 hover:bg-tertiary/60"
      >
        <Menu size={20} />
      </button>
      <Link href="/" aria-label="go home">
        <div className="flex items-center gap-2 hover:cursor-pointer">
          <Image
            src="/logo.svg"
            alt={`${appName} Logo`}
            width={28}
            height={50}
          />
          <h1 className="font-bold text-xl md:text-2xl">{appName}</h1>
        </div>
      </Link>

      <div className="hidden md:flex gap-6 lg:gap-8 font-semibold">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={handleCartClick}
          className="relative rounded-full border flex items-center bg-tertiary  p-3 hover:cursor-pointer hover:border-primary hover:text-primary"
        >
          <ShoppingBag size={16} className="hover:text-primary" />
          {user && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        {!user ? (
          <Link
            href="/login"
            className="hidden sm:block rounded-full border hover:border-primary py-2 px-4 md:px-6 font-semibold hover:text-primary"
          >
            Login
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hover:cursor-pointer rounded-full bg-tertiary p-2"
                aria-label="Open account menu"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 bg-tertiary text-white border border-white/10 "
            >
              <DropdownMenuItem
                onSelect={() => {
                  router.push("/account");
                }}
                className=" hover:cursor-pointer"
              >
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  handleLogout();
                }}
                className="hover:cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            id="mobile-drawer"
            className="absolute left-0 top-0 h-full w-64 bg-tertiary shadow-xl p-4 transform transition-transform duration-200 ease-out translate-x-0"
          >
            <div className="mb-4 border-b border-primary/30 pb-4 flex items-center justify-between">
              <Logo />
            </div>
            <nav className="space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded hover:bg-primary/30"
                onClick={() => setDrawerOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="block px-3 py-2 rounded hover:bg-primary/30"
                onClick={() => setDrawerOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/categories"
                className="block px-3 py-2 rounded hover:bg-primary/30"
                onClick={() => setDrawerOpen(false)}
              >
                Categories
              </Link>
            </nav>
            {!user && (
              <div className="mt-4">
                <Link
                  href="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="block text-center rounded-full bg-tertiary border border-primary text-white font-semibold py-2"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
