"use client";

import { useAuthStore } from "@/app/stores/auth";
import type { CartItem } from "@/app/stores/cart";
import { useCartStore } from "@/app/stores/cart";
import { AddressModal } from "@/components/shared/address-modal";
import { EmptyState } from "@/components/shared/empty-state";
import SmallLogo from "@/components/shared/small-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAddressesByUserQuery } from "@/lib/api/addresses";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useCreateAddressMutation } from "@/lib/hooks/use-address";
import { useCheckout } from "@/lib/hooks/use-checkout";
import { formatIDR } from "@/lib/utils";
import { AddressFormValues } from "@/lib/validations/address-schema";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
    null,
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const userId = user?.id ?? null;

  const {
    data: addressList,
    isPending: isAddressLoading,
    error: addressErrorObj,
  } = useAddressesByUserQuery(userId, { pageSize: 50 });
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
  const totalProducts = items.reduce((sum, item) => sum + item.qty, 0);

  const createAddressMutation = useCreateAddressMutation(userId);

  const handleAddAddress = async (values: AddressFormValues) => {
    if (!userId) {
      toast.error("User not found.");
      return;
    }
    await createAddressMutation.mutateAsync({ ...values, userId });
  };

  // Hooks
  //   const {
  //     mutate: startPayment,
  //     isPending: isPaying,
  //     error: paymentError,
  //   } = useOrderPayment();
  const { mutate: checkout, isPending: isCheckoutPending } = useCheckout();

  // Gabungkan status loading
  //   const isBusy = isCheckoutPending || isPaying;
  const isBusy = isCheckoutPending;

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
            toast.success(`Order ${order.orderNumber} created!`);
            router.push(`/account/orders/${order.id}`);
          }
        },
      },
    );
  };

  if (!isAuthHydrated) {
    return null;
  }

  if (!user) {
    return (
      <div className="w-full text-center py-10">
        <p className="mb-4">Please login.</p>
        <Link
          href="/login"
          className="inline-block rounded-full bg-primary px-5 py-2 font-semibold "
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4">
      {items.length >= 1 && (
        <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      )}

      {/* Cart Items */}
      <h2 className="text-lg font-semibold mb-2">Product List</h2>
      <div className="space-y-3 border rounded-lg p-4">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((it: CartItem, index: number) => (
            <div key={it.id} className="">
              {/* Mobile/Tablet (sm & md): two sides */}
              <div className="flex flex-row gap-3 items-start lg:hidden">
                {/* Left: Image */}
                <div className="w-auto shrink-0">
                  {it.imageUrl ? (
                    <Image
                      src={it.imageUrl}
                      alt={it.name}
                      width="60"
                      height="80"
                      className="object-cover rounded"
                    />
                  ) : (
                    <SmallLogo />
                  )}
                </div>
                {/* Right: Content */}
                <div className="flex-1 w-full">
                  <div className="font-semibold">{it.name}</div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <div>
                      <div className="font-semibold  hidden lg:block">
                        Price
                      </div>
                      <div className="flex text-sm  mt-1 gap-1">
                        <p className="">
                          <span>{formatIDR(it.price)}</span>
                        </p>
                        x {it.qty}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop (lg+): original grid */}
              <div className="hidden lg:grid grid-cols-12 items-center gap-3">
                <div className="col-span-2">
                  {it.imageUrl ? (
                    <Image
                      src={it.imageUrl}
                      alt={it.name}
                      width="280"
                      height="380"
                      className="w-24 h-24 object-cover rounded"
                    />
                  ) : (
                    <SmallLogo />
                  )}
                </div>
                <div className="col-span-4">
                  <div className="font-semibold">{it.name}</div>
                </div>
                <div className="col-span-2 text-center">
                  <div className="font-semibold ">Price</div>
                  <div className="flex flex-row justify-center text-sm  text-center mt-1 gap-1">
                    <p className="">
                      <span>{formatIDR(it.price)}</span>
                    </p>
                    x {it.qty}
                  </div>
                </div>
                <div className="col-span-4 font-semibold text-right">
                  <div className="font-semibold ">Subtotal</div>
                  {formatIDR(it.price * it.qty)}
                </div>
              </div>
              {index !== items.length - 1 && <Separator className="mt-2" />}
            </div>
          ))
        )}
      </div>

      {items.length >= 1 ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8">
            <div className="flex justify-between py-2">
              <h2 className="font-semibold mb-3 text-lg">Address</h2>
              <Button size="sm" onClick={() => setShowAddressModal(true)}>
                Add Address
              </Button>
            </div>
            {addressError && (
              <div className="mb-2 rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
                {addressError}
              </div>
            )}
            {isAddressLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : addresses.length === 0 ? (
              <div>
                <div className="text-sm text-gray-500">No address yet.</div>
              </div>
            ) : (
              <div className="space-y-2 rounded-lg">
                {addresses.map((addr) => {
                  const streetText = addr.street ?? addr.streetline ?? "-";
                  return (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 rounded-lg  p-3 ${
                        effectiveSelectedAddressId === addr.id
                          ? "border border-primary"
                          : "border border-tertiary"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-primary"
                        checked={effectiveSelectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div>
                        <div className="flex items-center gap-2 font-semibold mb-1">
                          <span
                            className={
                              effectiveSelectedAddressId === addr.id ? "" : ""
                            }
                          >
                            {addr.label} | {addr.recipientName}
                          </span>
                          {addr.isPrimary && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ">
                              Primary
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs ${
                            effectiveSelectedAddressId === addr.id
                              ? ""
                              : " text-gray-500"
                          }`}
                        >
                          {streetText}, {addr.subdistrict ?? "-"},{" "}
                          {addr.district ?? "-"}, {addr.city ?? "-"},{" "}
                          {addr.province ?? "-"} {addr.postalCode ?? ""}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="lg:col-span-4">
            <div className="rounded-lg  p-4 space-y-3">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="flex justify-between text-sm">
                <span className="">
                  Total Price ({totalProducts} Product
                  {items.length > 1 ? "s" : ""})
                </span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span>Voucher</span>
                <span>-{formatIDR(voucher)}</span>
              </div> */}
              <div className="flex justify-between text-sm">
                <span className="">Shipping (flat)</span>
                <span>{formatIDR(shipping)}</span>
              </div>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between font-semibold text-xl">
                <span className="">Grand Total</span>
                <span className="">{formatIDR(grandTotal)}</span>
              </div>
              <Button
                className="w-full"
                disabled={
                  items.length === 0 || !effectiveSelectedAddressId || isBusy
                }
                onClick={handleCheckout}
                aria-busy={isBusy}
              >
                {isBusy ? "Processing..." : "Pay Now"}
              </Button>
            </div>
          </aside>
        </div>
      ) : null}

      <AddressModal
        show={showAddressModal}
        mode="add"
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  );
}
