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
import { cn, formatDate, formatIDR } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  Truck,
} from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* --- NAVIGATION --- */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          asChild
          className="rounded-full hover:bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]"
        >
          <Link href="/account/orders" className="flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Orders
          </Link>
        </Button>
      </div>

      {/* --- LOADING & ERROR STATES --- */}
      {(isLoading || isFetching) && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            Retrieving Details...
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest text-center">
          {errorMessage}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* --- HEADER CARD: ORDER INFO --- */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                  Transaction Details
                </p>
                <h1 className="text-2xl font-black tracking-tighter uppercase">
                  #{order.orderNumber || order.id.slice(0, 8)}
                </h1>
                <div className="flex items-center gap-2 mt-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <Calendar size={14} />
                  {formatDate(order.placedAt)}
                </div>
              </div>
              <div
                className={cn(
                  "px-6 py-2 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.2em] text-center inline-block shadow-lg",
                  badgeStyle,
                )}
              >
                {label}
              </div>
            </div>
            {/* Decorative background circle */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* --- PENDING ACTION BANNER --- */}
          {statusKey === "PENDING" && (
            <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <AlertCircle size={28} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-black text-orange-900 uppercase tracking-tight text-sm">
                  Payment Required
                </h3>
                <p className="text-orange-800/80 text-xs font-medium mt-1 leading-relaxed">
                  Complete your payment to process this order. We're holding
                  your items for a limited time.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest h-12">
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {/* --- ITEMS CARD --- */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
              <Box size={14} /> Purchased Items
            </h3>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="py-5 first:pt-0 last:pb-0 flex items-center gap-5 group"
                >
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="shrink-0 relative overflow-hidden rounded-2xl border border-slate-200/70"
                  >
                    {item.productImageUrl ? (
                      <Image
                        src={item.productImageUrl}
                        alt={item.nameSnapshot}
                        width={64}
                        height={72}
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-slate-50 flex items-center justify-center">
                        <SmallLogo />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="hover:text-primary transition-colors"
                    >
                      <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">
                        {item.productName || item.nameSnapshot}
                      </p>
                    </Link>
                    <p className="text-xs text-slate-400 font-bold mt-1">
                      {item.quantity} ×{" "}
                      <span className="text-slate-600">
                        {formatIDR(item.unitPrice)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm tracking-tight">
                      {formatIDR(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* --- DELIVERY INFO --- */}
            <div className="bg-white border border-slate-200/70 rounded-2xl p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                <Truck size={14} /> Shipping Info
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Tracking Number
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1 font-mono">
                    {order.receiptNo || "Not Available Yet"}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    Delivery Address
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                    {addressText || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* --- PAYMENT DETAIL --- */}
            <div className="bg-white border border-slate-200/70 rounded-2xl p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                <CreditCard size={14} /> Payment Detail
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Method
                  </span>
                  <span className="font-black text-slate-900 uppercase tracking-tighter">
                    {order.paymentMethod || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Subtotal
                  </span>
                  <span className="font-bold text-slate-700">
                    {formatIDR(order.subtotalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-xs pb-4 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">
                    Shipping
                  </span>
                  <span className="font-bold text-slate-700">
                    {formatIDR(order.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-black uppercase tracking-widest text-slate-900">
                    Total
                  </span>
                  <span className="text-xl font-black text-primary tracking-tighter">
                    {formatIDR(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- CONFIRMATION CARD --- */}
          {canMarkCompleted && (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="font-black text-emerald-900 uppercase tracking-tight text-sm">
                  Order Arrived?
                </h3>
                <p className="text-emerald-800/70 text-xs font-medium mt-1">
                  Please confirm the receipt of your package to complete the
                  transaction.
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                disabled={updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate()}
              >
                {updateStatusMutation.isPending
                  ? "Updating..."
                  : "Confirm Delivery"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
