"use client";

import { useAuthStore } from "@/app/stores/auth";
import { useCartStore } from "@/app/stores/cart";
import { AddressModal } from "@/components/shared/address-modal";
import { EmptyState } from "@/components/shared/empty-state";
import SmallLogo from "@/components/shared/small-logo";
import { Button } from "@/components/ui/button";
import { useAddressesByUserQuery } from "@/lib/api/addresses";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useCreateAddressMutation } from "@/lib/hooks/use-address";
import { useCheckout } from "@/lib/hooks/use-checkout";
import { useOrderPayment } from "@/lib/hooks/use-order";
import { formatIDR } from "@/lib/utils";
import { AddressFormValues } from "@/lib/validations/address-schema";
import { motion, Variants } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isAuthHydrated, setIsAuthHydrated] = useState(false);

  useEffect(() => {
    setIsAuthHydrated(true);
  }, []);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const userId = user?.id ?? null;

  const {
    data: addressList,
    isPending: isAddressLoading,
    error: addressErrorObj,
  } = useAddressesByUserQuery(userId, { limit: 50 });
  const addresses = addressList?.items ?? [];
  const addressError = addressErrorObj
    ? getErrorMessage(addressErrorObj, "Cannot load address.")
    : null;

  const defaultAddressId = useMemo(() => {
    if (addresses.length === 0) return null;
    const primary = addresses.find((addr) => addr.isPrimary);
    const fallback = primary ?? addresses[0] ?? null;
    return fallback ? fallback.id : null;
  }, [addresses]);

  const effectiveSelectedAddressId = useMemo(() => {
    if (
      selectedAddressId &&
      addresses.some((addr) => addr.id === selectedAddressId)
    ) {
      return selectedAddressId;
    }
    return defaultAddressId;
  }, [addresses, defaultAddressId, selectedAddressId]);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const shipping = items.length > 0 ? 15000 : 0;
  const voucher = 0; // placeholder
  const grandTotal = subtotal + shipping - voucher;
  const totalBooks = items.reduce((sum, item) => sum + item.qty, 0);

  const createAddressMutation = useCreateAddressMutation(userId);

  const handleAddAddress = async (values: AddressFormValues) => {
    if (!userId) {
      toast.error("User not found.");
      return;
    }
    await createAddressMutation.mutateAsync({ ...values, userId });
  };

  // Hooks
  const {
    mutate: startPayment,
    isPending: isPaying,
    error: paymentError,
  } = useOrderPayment();
  const { mutate: checkout, isPending: isCheckoutPending } = useCheckout();

  // Gabungkan status loading
  const isBusy = isCheckoutPending || isPaying;

  const handleCheckout = () => {
    if (items.length === 0 || !effectiveSelectedAddressId || isBusy) return;

    checkout(
      {
        user,
        effectiveSelectedAddressId,
        items,
        shipping: 15000,
        voucher: 0,
      },
      {
        onSuccess: (payload) => {
          const order = payload?.order;
          if (order) {
            toast.success(
              `Order ${order.orderNumber} created! Opening payment...`
            );

            // 🔥 LANJUT KE PEMBAYARAN
            startPayment(order, {
              onSuccess: () => {
                // Setelah popup Midtrans ditutup/selesai, baru redirect
                router.push(`/account/orders/${order.id}`);
              },
              onError: () => {
                // Jika payment gagal, tetap redirect ke detail order
                // agar user bisa klik "Retry Payment" di sana
                router.push(`/account/orders/${order.id}`);
              },
            });
          }
        },
      }
    );
  };

  if (!isAuthHydrated) return null;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 bg-white">
        <h2 className="text-3xl font-serif mb-2 text-slate-900">
          Sign in to checkout
        </h2>
        <p className="text-slate-500 mb-8">
          Secure your latest tech gadgets by logging into your account.
        </p>
        <Link
          href="/login"
          className="px-10 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 selection:bg-blue-100 pb-20">
      {/* Background Decor (Light Mode Subtle Gradients) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] blur-[120px] rounded-full opacity-50" // Warna Emerald Primary Anda dengan opacity rendah
        />
        <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-slate-100 blur-[100px] rounded-full opacity-60" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-16">
        {items.length >= 1 && (
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center lg:text-left"
          >
            <nav className="flex items-center gap-2 text-sm font-medium mb-6 text-slate-400">
              <Link
                href="/cart"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <ShoppingBag size={14} />
                Cart
              </Link>
              <ChevronRight size={12} />
              <span className="text-slate-900">Checkout</span>
              <ChevronRight size={12} />
              <span className="text-slate-300">Payment</span>
            </nav>
            <h1 className="text-6xl font-serif tracking-tight text-slate-900 mb-4">
              Review <span className="italic text-slate-400">Order</span>
            </h1>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-slate-400">
              Authorized Gadget Store — {items.length} Items Selected
            </p>
          </motion.header>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-16"
          >
            {/* 01. Product List */}
            <section>
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-8">
                01 / Bag Contents
              </h2>

              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                {items.length === 0 ? (
                  <div className="p-16">
                    <EmptyState />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <motion.div
                        variants={itemVariants}
                        key={it.id}
                        className="p-8 hover:bg-slate-50/50 transition-colors group"
                      >
                        <div className="flex gap-8 items-center">
                          <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 group-hover:border-blue-200 transition-colors">
                            {it.imageUrl ? (
                              <Image
                                src={it.imageUrl}
                                alt={it.name}
                                width="120"
                                height="120"
                                className="object-contain w-full h-full p-2 transition-transform duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <SmallLogo />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-800 mb-1 leading-tight">
                              {it.name}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm text-slate-400">
                                Qty {it.qty}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="font-mono text-sm text-primary font-bold">
                                {formatIDR(it.price)}
                              </span>
                            </div>
                          </div>
                          <div className="hidden md:block text-right">
                            <p className="font-mono text-xl text-slate-900 tabular-nums font-medium">
                              {formatIDR(it.price * it.qty)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 02. Shipping Address */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                  02 / Destination
                </h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-xs font-bold text-slate-400 hover:text-primary transition-colors border-b border-slate-200 pb-1 hover:cursor-pointer"
                >
                  ADD NEW ADDRESS
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`group relative flex items-start gap-5 p-7 rounded-2xl cursor-pointer transition-all duration-300 border ${effectiveSelectedAddressId === addr.id
                      ? "bg-white border-primary shadow-[0_20px_40px_rgba(37,99,235,0.08)] ring-1 ring-primary"
                      : "bg-white border-slate-200/60 hover:border-slate-300 shadow-sm"
                      }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      checked={effectiveSelectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${effectiveSelectedAddressId === addr.id
                        ? "border-primary bg-primary"
                        : "border-slate-200"
                        }`}
                    >
                      {effectiveSelectedAddressId === addr.id && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-slate-900">
                          {addr.label}
                        </span>
                        {addr.isPrimary && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold tracking-tighter">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        {addr.recipientName} • {addr.street}, {addr.city}{" "}
                        {addr.postalCode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Sidebar Summary */}
          <aside className="lg:col-span-5">
            <div className="sticky top-12 bg-white border border-slate-200/60 rounded-2xl p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
              <h2 className="font-serif text-4xl mb-12 text-slate-900">
                Summary
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between text-slate-400 font-medium italic">
                  <span>Subtotal</span>
                  <span className="text-slate-900 tabular-nums font-mono">
                    {formatIDR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium italic">
                  <span>Shipping Cost</span>
                  <span className="text-slate-900 tabular-nums font-mono">
                    {formatIDR(shipping)}
                  </span>
                </div>

                <div className="pt-10 mt-10 border-t border-slate-100">
                  <div className="flex flex-col gap-2 mb-10">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Total Payable
                    </span>
                    <span className="text-5xl font-serif text-slate-900 tracking-tighter tabular-nums">
                      {formatIDR(grandTotal)}
                    </span>
                  </div>

                  <Button
                    className={`w-full h-20 rounded-[1.5rem] text-xl font-bold transition-all duration-500 shadow-2xl ${isBusy
                      ? "bg-slate-100 text-slate-400"
                      : "bg-primary hover:bg-primary/90 text-white shadow-blue-200 hover:scale-[1.02]"
                      }`}
                    disabled={
                      items.length === 0 ||
                      !effectiveSelectedAddressId ||
                      isBusy
                    }
                    onClick={handleCheckout}
                  >
                    {isBusy ? "Securing Order..." : "Place Order Now"}
                  </Button>
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-8 font-mono tracking-widest uppercase">
                Payment handled via secure gateway
              </p>
            </div>
          </aside>
        </div>
      </div>

      <AddressModal
        show={showAddressModal}
        mode="add"
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  );
}
