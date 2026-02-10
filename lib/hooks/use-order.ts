import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { resolveNextPage } from "../api/normalizers";
import {
  cancelOrderByCustomer,
  getOrderDetail,
  listOrdersByUser,
  markOrderAsCompletedByCustomer
} from "../api/order";

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["order-detail", orderId],
    queryFn: () => getOrderDetail(orderId!),
    enabled: Boolean(orderId),
  });
}

export function userOrders(
  userId: string | null | undefined,
  statusFilter: string
) {
  return useInfiniteQuery({
    queryKey: ["orders", userId, statusFilter],
    queryFn: ({ pageParam = 1 }) => {
      if (!userId) {
        throw new Error("Slug is required to check eligibility.");
      }
      return listOrdersByUser(userId, {
        page: pageParam,
        pageSize: 12,
        status: statusFilter || undefined,
      });
    },
    getNextPageParam: (lastPage) =>
      resolveNextPage(lastPage?.meta, lastPage?.items?.length ?? 0, 12),
    initialPageParam: 1,
    enabled: Boolean(userId),
  });
}

export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markOrderAsCompletedByCustomer(orderId!),
    onSuccess: (updated) => {
      queryClient.setQueryData(["order-detail", orderId], updated);
    },
  });
}

// export function useOrderPayment() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (order: Order) => {
//       // Step 1: Validasi awal
//       if (!order) throw new Error("Order data is not available.");

//       // Step 2: Langsung panggil API untuk dapatkan token (Ganti logic handleMidtrans)
//       const payload = await createMidtransSnapTransaction(order.id);
//       const snapToken = payload?.snapToken;

//       if (!snapToken) {
//         throw new Error("Midtrans payment token is not available.");
//       }

//       // Step 3: Langsung panggil SDK Midtrans
//       // Kita "await" ini agar mutation tetap dalam status 'pending' selama popup terbuka
//       // const result = await payWithMidtransSnap(snapToken);

//       return result;
//     },
//     onSuccess: (result, order) => {
//       // Logic setelah user berinteraksi (Berhasil bayar / Pending / Tutup Popup)
//       toast.success("Payment session finished.");

//       // Sinkronisasi data
//       queryClient.invalidateQueries({ queryKey: ["order-detail", order?.id] });
//     },
//     onError: (err) => {
//       toast.error(getErrorMessage(err, "Payment error."));
//     },
//   });
// }

export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelOrderByCustomer(orderId!),
    onSuccess: (updated) => {
      toast.success("Order has been cancelled");
      queryClient.setQueryData(["order-detail", orderId], updated);
    },
  });
}
