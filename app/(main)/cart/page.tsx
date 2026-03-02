"use client";

import {
  Minus,
  Plus,
  Shield,
  ShoppingBag,
  Trash,
  Trash2,
  UserIcon
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useAuthStore } from "@/app/stores/auth";
import { useCartStore } from "@/app/stores/cart";
import { Button } from "@/components/ui/button";
import {
  useDecrementCartItem,
  useIncrementCartItem,
  useRemoveCartItem,
  useUpdateCartQty,
} from "@/lib/hooks/use-cart";

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
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const {
    inc: incLocal,
    dec: decLocal,
    remove: removeLocal,
    replaceAll,
  } = useCartStore();

  const incrementItem = useIncrementCartItem();
  const decrementItem = useDecrementCartItem();
  const removeItem = useRemoveCartItem();
  const updateQty = useUpdateCartQty();

  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

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

  const commitQtyInput = async (itemId: string, currentQty: number) => {
    const rawValue = qtyInputs[itemId];
    if (!rawValue) return clearQtyInput(itemId);

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) return clearQtyInput(itemId);

    const nextQty = Math.max(1, Math.trunc(parsed));
    if (nextQty === currentQty) return clearQtyInput(itemId);

    if (user) {
      updateQty.mutate({ productId: itemId, qty: nextQty });
    } else {
      replaceAll(
        items.map((it) => (it.id === itemId ? { ...it, qty: nextQty } : it)),
      );
    }
    clearQtyInput(itemId);
  };

  /* ============================
     HANDLERS (Logic)
  ============================ */
  const handleDecrement = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item && item.qty > 1) {
      if (user) decrementItem.mutate(itemId);
      else decLocal(itemId);
    } else {
      handleRemove(itemId);
    }
  };

  const handleIncrement = (itemId: string) => {
    if (user) incrementItem.mutate(itemId);
    else incLocal(itemId);
  };

  const handleRemove = (itemId: string) => {
    if (user) removeItem.mutate(itemId);
    else removeLocal(itemId);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
          <UserIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Please login</h2>
        <p className="text-slate-500 mb-8 max-w-xs">
          You need to be logged in to manage your cart and proceed to checkout.
        </p>
        <Link href="/login">
          <Button className="rounded-full px-10 py-6 bg-primary hover:opacity-90 shadow-lg shadow-emerald-100 transition-all">
            Login to your Account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {items.length >= 1 && (
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {items.length} Items
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-12">
          <ShoppingBag size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium mb-6">
            Your shopping cart is empty
          </p>
          <Link href="/shop">
            <Button
              variant="outline"
              className="rounded-full px-8 border-slate-200 hover:bg-slate-50"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((it, index) => (
              <div
                key={it.id}
                className="group bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Image */}
                  <Link href={`/products/${it.slug}`} className="shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-50">
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 p-2 text-center uppercase font-bold">
                          {it.name}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link
                          href={`/products/${it.slug}`}
                          className="font-bold text-slate-900 hover:text-primary transition-colors sm:text-lg"
                        >
                          {it.name}
                        </Link>
                        <p className="text-primary font-bold mt-1">
                          {formatIDR(it.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(it.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Subtotal for this item (Desktop only) */}
                      <div className="hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Subtotal
                        </p>
                        <p className="font-semibold text-slate-700">
                          {formatIDR(it.price * it.qty)}
                        </p>
                      </div>

                      {/* Qty Controls */}
                      <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDecrement(it.id)}
                          className="h-8 w-8 rounded-xl hover:bg-white hover:shadow-sm"
                        >
                          {it.qty === 1 ? (
                            <Trash size={14} className="text-red-500" />
                          ) : (
                            <Minus size={14} />
                          )}
                        </Button>
                        <input
                          type="number"
                          className="w-10 bg-transparent text-center text-sm font-bold focus:outline-none"
                          value={qtyInputs[it.id] ?? it.qty.toString()}
                          onChange={(e) =>
                            handleQtyInputChange(it.id, e.target.value)
                          }
                          onBlur={() => commitQtyInput(it.id, it.qty)}
                        />
                        <button
                          onClick={() => handleIncrement(it.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Side: Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">
                    Calculated at next step
                  </span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatIDR(subtotal)}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full py-7 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-emerald-100 hover:opacity-90 active:scale-[0.98] transition-all">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Shield size={12} />
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
