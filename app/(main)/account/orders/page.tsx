"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Package,
  ChevronRight,
  Calendar,
  Search,
  ArrowUpDown,
  Loader2,
  Box,
} from "lucide-react";
import { useAuthStore } from "@/app/stores/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/api/fetcher";
import { userOrders } from "@/lib/hooks/use-order";
import { formatIDR, cn } from "@/lib/utils";
import { Order } from "@/types/order";
import SmallLogo from "@/components/shared/small-logo";
import Image from "next/image";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  PENDING: {
    label: "Pending",
    class: "bg-amber-50 text-amber-600 border-amber-100",
  },
  PAID: { label: "Paid", class: "bg-blue-50 text-blue-600 border-blue-100" },
  PROCESSING: {
    label: "Processing",
    class: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  SHIPPED: {
    label: "Shipped",
    class: "bg-purple-50 text-purple-600 border-purple-100",
  },
  DELIVERED: {
    label: "Delivered",
    class: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  COMPLETED: {
    label: "Completed",
    class: "bg-green-50 text-green-600 border-green-100",
  },
  CANCELLED: {
    label: "Cancelled",
    class: "bg-red-50 text-red-600 border-red-100",
  },
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function OrderCard({ order }: { order: Order }) {
  const status = (order.status || "PENDING").toUpperCase();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const items = order.items || [];
  const firstItem = items[0];
  const remainingCount = items.length - 1;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group block bg-white rounded-2xl border border-slate-200/70 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/20"
    >
      <div className="flex flex-col gap-6">
        {/* Top: Info & Status */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Package size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Order ID
              </p>
              <p className="text-sm font-bold text-slate-900 leading-none mt-1">
                #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
              config.class,
            )}
          >
            {config.label}
          </span>
        </div>

        {/* Middle: Product Snapshot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Placeholder for Product Image - adapt to your logic */}
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-200/70 text-slate-300">
              {firstItem?.productImageUrl ? (
                <Image
                  src={firstItem.productImageUrl}
                  alt={firstItem.nameSnapshot}
                  width={64}
                  height={72}
                  className="object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <SmallLogo className="rounded-2xl" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                {firstItem?.nameSnapshot || "Multiple Products"}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {firstItem?.quantity} item{firstItem?.quantity > 1 ? "s" : ""} •{" "}
                {formatIDR(firstItem?.unitPrice || 0)}
              </p>
              {remainingCount > 0 && (
                <p className="text-[11px] font-bold text-primary mt-1 tracking-tight">
                  + {remainingCount} other product
                  {remainingCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Price
            </p>
            <p className="text-lg font-black text-slate-900 tracking-tighter">
              {formatIDR(order.totalPrice)}
            </p>
          </div>
        </div>

        {/* Bottom: Date & Link */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {new Date(
                order.placedAt || order.createdAt || "",
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            View Details <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const {
    data,
    isLoading,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = userOrders(userId, statusFilter);

  const orders = useMemo(() => {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
  }, [data]);

  const errorMessage = error
    ? getErrorMessage(error, "Cannot load order.")
    : null;

  if (!user) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200/70">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
          Please login to view orders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Order <span className="text-primary italic">History</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage and track your recent transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200/70 min-w-45">
            <ArrowUpDown size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Status:
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-none bg-transparent h-auto p-0 focus:ring-0 text-xs font-bold text-slate-800 shadow-none">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="rounded-2xl shadow-xl border-slate-200/70"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs font-medium rounded-xl py-2 my-1"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* --- ERROR STATE --- */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
          {errorMessage}
        </div>
      )}

      {/* --- CONTENT --- */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200/70 flex flex-col items-center">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Package size={24} className="text-slate-200" />
            </div>
            <p className="text-slate-500 font-bold text-sm">No orders found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* --- PAGINATION --- */}
      {hasNextPage && (
        <div className="mt-12 flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="h-12 px-10 rounded-full bg-white border border-slate-200 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 shadow-sm transition-all"
          >
            {isFetchingNextPage ? (
              <Loader2 className="animate-spin mr-2" size={14} />
            ) : null}
            Load More History
          </Button>
        </div>
      )}
    </div>
  );
}
