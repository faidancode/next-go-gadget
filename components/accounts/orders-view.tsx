import Link from "next/link";
import { EmptyState } from "../shared/empty-state";
import { Box, Calendar, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatusSummary = "paid" | "pending" | "cancelled" | "completed";

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
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Order <span className="text-primary italic">History</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track and manage your premium tech purchases.
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 hidden sm:block">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Orders:
          </span>
          <span className="ml-2 text-sm font-bold text-slate-900">
            {orders.length}
          </span>
        </div>
      </div>

      {/* --- ORDERS LIST --- */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Package size={24} className="text-slate-200" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No orders found
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              When you buy something, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group block bg-white p-5 sm:p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-emerald-100/20 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info Utama */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Box size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">
                        #{order.orderNumber || order.id.slice(0, 8)}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <Calendar size={12} />
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-50">
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Total Amount
                      </p>
                      <p className="text-sm font-black text-slate-900">
                        {formatIDR(order.total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm",
                          order.status === "paid" ||
                            order.status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : order.status === "pending"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-red-50 text-red-600 border border-red-100",
                        )}
                      >
                        {order.status}
                      </span>
                      <ChevronRight
                        size={18}
                        className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
