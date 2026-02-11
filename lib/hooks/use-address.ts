import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { Address } from "@/types";
import { toast } from "sonner";
import { AddressCreateInput } from "@/types/address";
import { createAddress } from "../api/addresses";

export function useCreateAddressMutation(
  userId?: string | null,
  options?: UseMutationOptions<Address | null, unknown, AddressCreateInput>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: (created, variables, onMutateResult, context) => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      }
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      options?.onSuccess?.(created, variables, onMutateResult, context);
      toast.success("Address added successfully!");
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
    onMutate: options?.onMutate,
  });
}
