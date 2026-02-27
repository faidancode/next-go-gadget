"use client";

import { DefaultImage } from "@/components/shared/default-image";
import SmallLogo from "@/components/shared/small-logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/fetcher";
import {
  useCancelOrder,
  useOrder,
  useUpdateOrder,
} from "@/lib/hooks/use-order";
import { formatDate, formatIDR } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

const statusLabels: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-amber-100 text-amber-800 border-amber-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const paramValue = params?.id;
  const orderId = Array.isArray(paramValue) ? paramValue[0] : paramValue;

  const { data, isLoading, error, isFetching } = useOrder(orderId);

  const updateStatusMutation = useUpdateOrder(orderId);

  const { mutate: cancelOrder, isPending: isCancelOrderLoading } =
    useCancelOrder(orderId);
  const actionError = error
    ? getErrorMessage(error, "Failed to update order status.")
    : null;

  const order = data ?? null;
  const address = order?.addressSnapshot;

  // const {
  //   mutate: retryPayment,
  //   isPending: isRetryPaymentLoading,
  //   error: errorOrderPayment,
  //   reset,
  // } = useOrderPayment();

  const canMarkCompleted = useMemo(() => {
    const status = order?.status?.toUpperCase();
    return status === "DELIVERED";
  }, [order?.status]);
  const addressText = useMemo(() => {
    if (!address) return "";
    const parts = [
      address.street,
      address.subdistrict,
      address.district,
      address.city,
      address.province,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
    return [address.recipientName, parts, address.recipientPhone]
      .filter(Boolean)
      .join(" • ");
  }, [address]);

  const errorMessage = error
    ? getErrorMessage(error, "Cannot load order detail.")
    : null;

  const statusKey = (order?.status || "").toUpperCase();
  const label = statusLabels[statusKey] ?? order?.status ?? "Unknown";
  const badgeStyle = STATUS_STYLES[statusKey] ?? " bg-gray-100 text-gray-800";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" asChild>
          <Link href="/account/orders">&larr; Back to Orders</Link>
        </Button>
      </div>

      {(isLoading || isFetching) && (
        <div className="rounded-lg p-4 text-sm">Load order detail...</div>
      )}

      {errorMessage && (
        <div className="rounded border border-red-200 bg-red-300 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
      {actionError && (
        <div className="rounded border border-red-200 bg-red-300 p-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {!isLoading && !order && !errorMessage && (
        <div className="rounded-lg p-6 text-center text-sm">
          Order not found.
        </div>
      )}

      {order && (
        <div className="flex flex-col gap-4">
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">{order.orderNumber || order.id}</div>
              <div
                className={`px-3 py-1 rounded-full border text-sm font-semibold uppercase inline-block ${badgeStyle}`}
              >
                {label}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Order Date</div>
              <div className="text-sm font-bold">
                {formatDate(order.placedAt)}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="text-base font-bold">Items</div>
            <div className="space-y-2">
              {order.items?.map((item, index) => {
                const isLast = index === (order.items?.length ?? 1) - 1;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between ${
                      isLast ? "" : "border-b border-tertiary pb-2"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Link href={`/products/${item.productSlug}`}>
                        <div className="col-span-2 hover:cursor-pointer">
                          {item.productCoverUrl ? (
                            <Image
                              src={item.productCoverUrl}
                              alt={item.productName}
                              width="48"
                              height="56"
                              className="object-cover rounded"
                            />
                          ) : (
                            <SmallLogo/>
                          )}
                        </div>
                      </Link>
                      <div className="flex flex-col">
                        <Link href={`/products/${item.productSlug}`}>
                          <div className="text-sm font-bold hover:text-primary hover:cursor-pointer">
                            {(item as { productName?: string }).productName ??
                              item.nameSnapshot}
                          </div>
                        </Link>
                        <div className="text-sm">
                          {item.quantity} x {formatIDR(item.unitPrice)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold">
                      {formatIDR(item.subtotal)}
                    </div>
                  </div>
                );
              })}
              {(!order.items || order.items.length === 0) && (
                <div className="text-sm ">No items in this order.</div>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="text-base font-bold">Delivery Info</div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Receipt No</div>
              <div className="text-sm font-bold">{order.receiptNo || "-"}</div>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">Address</div>
              <div className="text-sm text-right flex-1">
                {addressText || "-"}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="text-base font-bold">Detail Payment</div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Payment Method</div>
              <div className="text-sm font-bold">
                {order.paymentMethod || "-"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Payment Status</div>
              <div className="text-sm font-bold">
                {order.paymentStatus || "-"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Subtotal</div>
              <div className="text-sm font-bold">
                {formatIDR(order.subtotalPrice)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Shipping</div>
              <div className="text-sm font-bold">
                {formatIDR(order.shippingPrice)}
              </div>
            </div>
            <div className="flex items-center justify-between border-t  pt-2 mt-4">
              <div className="text-lg font-semibold">Total</div>
              <div className="text-lg font-bold">
                {formatIDR(order.totalPrice)}
              </div>
            </div>
          </div>

          {statusKey === "PENDING" && (
            <div className="overflow-hidden rounded-2xl p-4 shadow-sm">
              {/* Alert Banner */}
              <div className="flex items-start gap-3 bg-orange-200 p-4 rounded-lg">
                <div className="mt-0.5 text-orange-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-orange-900">
                    Payment Pending
                  </p>
                  <p className="text-xs md:text-sm leading-relaxed text-orange-800/80">
                    Your order is not completed yet. Please confirm your payment
                    to finalize the purchase.
                  </p>
                </div>
              </div>

              {/* Action Area */}
              {/* <div className="pt-4 space-y-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full h-11 text-sm font-semibold transition-all active:scale-[0.98]"
                  disabled={isRetryPaymentLoading || isCancelOrderLoading}
                  onClick={() => retryPayment(order)}
                  aria-busy={isRetryPaymentLoading}
                >
                  {isRetryPaymentLoading ? "Processing..." : "Continue Payment"}
                </Button>
                {order.paymentStatus === "UNPAID" && (
                  <div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outlineDestructive"
                          className="w-full h-10 font-semibold  text-red-500 hover:text-red-600 transition-colors"
                          disabled={
                            isRetryPaymentLoading || isCancelOrderLoading
                          }
                          aria-busy={isCancelOrderLoading}
                        >
                          {isCancelOrderLoading
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-gray-800">
                            Cancel this order?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Order will be cancelled. This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full border border-white/10 hover:border-gray-600">
                            No, Stay
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-full bg-secondary hover:text-gray-50 hover:bg-red-400"
                            onClick={() => cancelOrder(orderId)}
                          >
                            Yes, Cancel Order
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div> */}
            </div>
          )}

          {canMarkCompleted && (
            <div className="space-y-2">
              <div className="text-sm">Already received your package?</div>
              <div className="rounded-lg border border-tertiary p-3 space-y-2">
                <div className="text-sm">
                  Mark as completed once the order has arrived.
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate()}
                >
                  {updateStatusMutation.isPending
                    ? "Updating..."
                    : "Confirm Delivery"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
