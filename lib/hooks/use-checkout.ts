import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createIdempotencyKey } from "../utils";
import { toast } from "sonner";
import { useCartStore } from "@/app/stores/cart";
import { getErrorMessage } from "../api/fetcher";
import { checkoutOrder } from "../api/order";

export function useCheckout() {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clear);

  return useMutation({
    // Tambahkan parameter di dalam mutationFn sebagai object
    mutationFn: async ({
      user,
      effectiveSelectedAddressId,
      items,
      shipping,
      voucher,
    }: {
      user: any;
      effectiveSelectedAddressId: string | null;
      items: any[];
      shipping: number;
      voucher: number;
    }) => {
      // Validasi sekarang dilakukan di dalam sini menggunakan parameter yang dikirim
      if (!user || !effectiveSelectedAddressId || items.length === 0) {
        throw new Error("Missing user, address, or items for checkout");
      }

      const result = await checkoutOrder(
        {
          userId: user.id,
          addressId: effectiveSelectedAddressId,
          shippingCents: shipping,
          discountCents: voucher,
        },
        { idempotencyKey: createIdempotencyKey() },
      );

      if (!result) {
        throw new Error("Checkout response is empty");
      }
      return result;
    },
    onSuccess: (payload) => {
      console.log("Checkout successful:", payload);
      const order = payload?.order;
      if (!order) {
        toast.error("Checkout successful but order data not available.");
        return;
      }

      // Pastikan clearCart() diimport atau dipanggil dari store di sini
      clearCart();

      toast.success(`Order ${order.orderNumber} successfully created.`);

      // router.push(`/account/orders/${order.id}`);
      // router.refresh();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Checkout fail."));
    },
  });
}
