import Link from "next/link";
import { EmptyState } from "../shared/empty-state";

export type OrderStatusSummary = "paid" | "pending" | "cancelled";

export type OrderListItem = {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatusSummary;
};

export function OrdersView({
  orders,
  formatIDR,
}: {
  orders: OrderListItem[];
  formatIDR: (n: number) => string;
}) {
  return (
    <div>
      <h1 className="text-lg font-semibold text-secondary">Orders</h1>
      {orders.length}
      <div className="rounded-lg bg-tertiary p-4 mt-4">
        {orders.length === 0 ? (
          <EmptyState title="You don't have any order yet" />
        ) : (
          <div className="space-y-2">
            {orders.map((t) => (
              <div
                key={t.id}
                className="grid grid-cols-2 sm:grid-cols-5 items-center gap-2 rounded border border-white/10 p-3"
              >
                <div className="text-xs sm:text-sm font-semibold">
                  {t.orderNumber || t.id}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {new Date(t.date).toLocaleDateString()}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-secondary">
                  {formatIDR(t.total)}
                </div>
                <div className="text-xs sm:text-sm">
                  <span
                    className={`capitalize rounded-full px-2 py-0.5 text-[10px] sm:text-xs ${
                      t.status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : t.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <div className="hidden sm:block text-right">
                  <Link
                    className="text-xs underline text-secondary hover:text-secondary/80"
                    href={`/account/orders/${t.id}`}
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
