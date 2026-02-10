"use client";

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
import { formatIDR } from "@/lib/utils";
import { Order } from "@/types/order";
import { OrderItem } from "@/types/order-item";
import Link from "next/link";
import { useMemo, useState } from "react";

const statusLabels: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-300 text-gray-700 border-gray-300",
  PAID: "bg-blue-300 text-blue-700 border-blue-300",
  PROCESSING: "bg-amber-300 text-amber-800 border-amber-300",
  SHIPPED: "bg-purple-300 text-purple-700 border-purple-300",
  DELIVERED: "bg-emerald-300 text-emerald-700 border-emerald-300",
  COMPLETED: "bg-green-300 text-green-800 border-green-300",
  CANCELLED: "bg-red-300 text-red-700 border-red-300",
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

function formatDate(date: string | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderOrderItems(order: Order, formatter: (n: number) => string) {
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const itemsToShow = items.slice(0, 1);
  const remaining = Math.max(0, items.length - itemsToShow.length);

  return (
    <div className="space-y-2">
      {itemsToShow.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-3">
          <div className="flex-1 pr-3">
            <div className="text-sm font-semibold">{item.nameSnapshot}</div>
            <div className="text-xs">
              {item.quantity} x {formatter(item.unitPrice)}
            </div>
          </div>
          <div className="text-sm font-semibold">
            {formatter(item.subtotal)}
          </div>
        </div>
      ))}
      {remaining > 0 ? (
        <div className="text-white">
          + {remaining} another book{remaining > 1 ? "s" : ""}
        </div>
      ) : null}
    </div>
  );
}

function OrderCard({
  order,
  formatter,
}: {
  order: Order;
  formatter: (n: number) => string;
}) {
  const statusKey = (order.status || "").toUpperCase();
  const label = statusLabels[statusKey] ?? order.status ?? "Unknown";
  const orderDate = order.placedAt || order.createdAt;
  const badgeStyle =
    STATUS_STYLES[statusKey] ?? "border-gray-700 bg-gray-100 text-gray-800";

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block rounded-lg bg-tertiary border p-4 space-y-3 transition-colors"
    >
      <div className="flex items-start justify-between border-b pb-2">
        <div className="text-sm">{formatDate(orderDate)}</div>

        <div className="items-end space-y-2 text-right">
          <div
            className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase inline-block ${badgeStyle}`}
          >
            {label}
          </div>
        </div>
      </div>

      {order.items?.length ? (
        <div className="space-y-2">{renderOrderItems(order, formatter)}</div>
      ) : null}

      <div className="flex items-center justify-end">
        <div className="text-right">
          <div className="text-xs">Total</div>
          <div className="text-lg font-bold">{formatter(order.totalPrice)}</div>
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const PAGE_SIZE = 10;
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
  console.log({ data });

  const orders = useMemo<Order[]>(() => {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
  }, [data]);

  const errorMessage = error
    ? getErrorMessage(error, "Cannot load order.")
    : null;

  if (!user) {
    return (
      <div className="py-4 text-sm">Silakan login untuk melihat pesanan.</div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Orders</h1>
        </div>
        <div>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="min-w-45 border-tertiary bg-tertiary text-sm">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-3 rounded border border-red-200 bg-red-100 p-3 text-xs text-red-600">
          {errorMessage}
        </div>
      )}
      {(isLoading || isFetching) && orders.length === 0 && (
        <div className="py-4 text-sm">Loading Order...</div>
      )}
      <div className="space-y-3">
        {orders.length === 0 && !(isLoading || isFetching) ? (
          <EmptyState title="You don't have any order yet" />
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} formatter={formatIDR} />
          ))
        )}
      </div>
      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="secondary"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="px-6"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
      {isFetching && orders.length > 0 && !isFetchingNextPage && (
        <div className="mt-2 text-center text-xs">Synchronizing...</div>
      )}
    </>
  );
}
