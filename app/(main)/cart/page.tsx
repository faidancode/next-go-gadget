"use client";

import { Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useAuthStore } from "@/app/stores/auth";
import type { CartItem } from "@/app/stores/cart";
import { useCartStore } from "@/app/stores/cart";
import { CoverPlaceholder } from "@/components/shared/cover-placeholder";
import { EmptyState } from "@/components/shared/empty-state";
import { Title } from "@/components/shared/title";
import { Button } from "@/components/ui/button";
import {
  useDecrementCartItem,
  useIncrementCartItem,
  useRemoveCartItem,
  useUpdateCartQty,
} from "@/lib/hooks/use-cart";
import { Separator } from "@/components/ui/separator";

function formatIDR(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
}

export default function CartPage() {
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = Boolean(user);

  const items = useCartStore((s) => s.items);
  const incLocal = useCartStore((s) => s.inc);
  const decLocal = useCartStore((s) => s.dec);
  const removeLocal = useCartStore((s) => s.remove);
  const replaceAll = useCartStore((s) => s.replaceAll);
  console.log({ items });

  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

  /* ============================
   Cart hooks (API)
============================ */
  const incrementItem = useIncrementCartItem();
  const decrementItem = useDecrementCartItem();
  const removeItem = useRemoveCartItem();
  const updateQty = useUpdateCartQty();

  /* ============================
   Qty input helpers
============================ */
  const handleQtyInputChange = (itemId: string, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, "");
    setQtyInputs((prev) => ({ ...prev, [itemId]: sanitized }));
  };

  const clearQtyInput = (itemId: string) => {
    setQtyInputs((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  /* ============================
   Commit qty input
============================ */
  const commitQtyInput = async (itemId: string, currentQty: number) => {
    const rawValue = qtyInputs[itemId];
    if (!rawValue) return clearQtyInput(itemId);

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return clearQtyInput(itemId);

    const nextQty = Math.max(1, Math.trunc(parsed));
    if (nextQty === currentQty) return clearQtyInput(itemId);

    if (isAuthenticated) {
      updateQty.mutate({ productId: itemId, qty: nextQty });
    } else {
      // Guest → local only
      replaceAll(
        items.map((it) => (it.id === itemId ? { ...it, qty: nextQty } : it)),
      );
    }

    clearQtyInput(itemId);
  };

  /* ============================
   ➖ DECREMENT
============================ */
  const handleDecrement = (itemId: string) => {
    if (isAuthenticated) {
      decrementItem.mutate(itemId);
    } else {
      decLocal(itemId);
    }
  };

  /* ============================
   ➕ INCREMENT
============================ */
  const handleIncrement = (itemId: string) => {
    if (isAuthenticated) {
      incrementItem.mutate(itemId);
    } else {
      incLocal(itemId);
    }
  };

  /* ============================
   🗑️ REMOVE
============================ */
  const handleRemove = (itemId: string) => {
    if (isAuthenticated) {
      removeItem.mutate(itemId);
    } else {
      removeLocal(itemId);
    }
  };

  /* ============================
   Subtotal
============================ */
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  // if (!isAuthHydrated) {
  //   return null;
  // }

  if (!user) {
    return (
      <div className="w-full text-center py-10">
        <p className="mb-4">Please login.</p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-secondary px-5 py-2 font-semibold text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      {items.length >= 1 && <Title>Cart</Title>}

      {/* Cart Items */}
      <div className="space-y-3 border rounded-lg p-4">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((it: CartItem, index) => (
            <div key={it.id} className="rounded-lg bg-tertiary ">
              {/* Mobile/Tablet (sm & md): two sides */}
              <div className="flex flex-row gap-3 items-start lg:hidden">
                {/* Left: Image */}
                <Link href={`products/${it.slug}`}>
                  <div className="w-auto shrink-0 hover:cursor-pointer">
                    {it.imageUrl ? (
                      <Image
                        src={it.imageUrl}
                        alt={it.name}
                        width="120"
                        height="150"
                        className="object-cover rounded"
                      />
                    ) : (
                      <CoverPlaceholder
                        title={it.name}
                        className="w-24 h-32"
                        fontSize="text-sm"
                      />
                    )}
                  </div>
                </Link>
                {/* Right: Content */}
                <div className="flex-1 w-full">
                  <div className="font-semibold">{it.name}</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <div>
                      <div className="font-semibold hidden lg:block">Price</div>
                      <div className="text-sm mt-1">{formatIDR(it.price)}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-semibold hidden lg:block">
                        Quantity
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          onClick={() => handleDecrement(it.id)}
                          className="rounded px-2 py-1"
                        >
                          -
                        </Button>
                        <input
                          type="number"
                          min={1}
                          value={qtyInputs[it.id] ?? it.qty.toString()}
                          onChange={(event) =>
                            handleQtyInputChange(it.id, event.target.value)
                          }
                          onBlur={() => commitQtyInput(it.id, it.qty)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.currentTarget.blur();
                            }
                          }}
                          className="w-16 rounded px-2 py-1 text-center text-sm"
                          aria-label={`Quantity for ${it.name}`}
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleIncrement(it.id)}
                          className="rounded px-2 py-1"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop (lg+): original grid */}
              <div className="hidden lg:grid grid-cols-12 items-center gap-3">
                <Link href={`products/${it.slug}`}>
                  <div className="col-span-2 hover:cursor-pointer">
                    {it.imageUrl ? (
                      <Image
                        src={it.imageUrl}
                        alt={it.name}
                        width="120"
                        height="150"
                        className="object-cover rounded"
                      />
                    ) : (
                      <CoverPlaceholder
                        title={it.name}
                        className="w-24 h-32"
                        fontSize="text-sm"
                      />
                    )}
                  </div>
                </Link>
                <div className="col-span-4">
                  <Link href={`/products/${it.slug}`}>
                    <div className="font-semibold hover:cursor-pointer hover:text-secondary">
                      {it.name}
                    </div>
                  </Link>
                </div>
                <div className="col-span-2 text-center">
                  <div className="font-semibold">Price</div>
                  <div className="text-sm mt-1">{formatIDR(it.price)}</div>
                </div>
                <div className="col-span-2">
                  <div className="font-semibold text-center">Quantity</div>
                  <div className="flex justify-center items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDecrement(it.id)}
                      className="rounded border"
                    >
                      {it.qty === 1 ? (
                        <Trash size={14} className="text-red-800" />
                      ) : (
                        "-"
                      )}
                    </Button>
                    <input
                      type="number"
                      min={1}
                      value={qtyInputs[it.id] ?? it.qty.toString()}
                      onChange={(event) =>
                        handleQtyInputChange(it.id, event.target.value)
                      }
                      onBlur={() => commitQtyInput(it.id, it.qty)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.currentTarget.blur();
                        }
                      }}
                      className="w-16 bg-gray-100 rounded px-2 py-1 text-center text-sm"
                      aria-label={`Quantity for ${it.name}`}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleIncrement(it.id)}
                      className="rounded border"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="col-span-1 font-semibold text-center">
                  <div className="font-semibold">Subtotal</div>
                  {formatIDR(it.price * it.qty)}
                </div>
              </div>
              {index !== items.length - 1 && <Separator className="mt-2" />}
            </div>
          ))
        )}
      </div>

      {items.length >= 1 ? (
        <div className="mt-6 lg:flex lg:justify-end">
          <div className="bg-tertiary p-4 space-y-3 lg:w-1/3  border rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatIDR(subtotal)}</span>
            </div>
            <Link href="/checkout" className="block">
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
