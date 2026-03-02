import type { Address } from "@/types";
import type { ApiEnvelope } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiRequest, buildQueryString } from "./fetcher";
import type { ListResult, PaginationMeta } from "./normalizers";
import {
  AddressCreateInput,
  AddressListEnvelope,
  AddressListParams,
  AddressUpdateInput,
} from "@/types/address";

const ADDRESS_ENDPOINT = "/addresses";

// LIST by user
export async function listAddressesByUser(
  userId: string,
  params?: AddressListParams,
): Promise<ListResult<Address>> {
  if (!userId) return { items: [], meta: {}, raw: null };

  const query = buildQueryString({
    page: params?.page,
    limit: params?.limit,
    search: params?.search,
  });

  const qs = query.toString();
  const endpoint = qs ? `${ADDRESS_ENDPOINT}?${qs}` : `${ADDRESS_ENDPOINT}`;

  const envelope = await apiRequest<AddressListEnvelope>(endpoint);

  const items = Array.isArray(envelope.data) ? envelope.data : [];
  const meta = (envelope.meta ?? {}) as PaginationMeta;

  return {
    items,
    meta,
    raw: envelope,
  };
}

// CREATE
export async function createAddress(
  input: AddressCreateInput,
): Promise<Address | null> {
  const envelope = await apiRequest<Address>(
    `${ADDRESS_ENDPOINT}`,
    input,
  );

  if (!envelope.data) return null;
  return envelope.data;
}

// DETAIL
export async function getAddressDetail(id: string): Promise<Address | null> {
  if (!id) return null;

  const envelope = await apiRequest<Address>(`${ADDRESS_ENDPOINT}/${id}`);

  if (!envelope.data) return null;
  return envelope.data;
}

// UPDATE
export async function updateCustomerAddress(
  id: string,
  input: AddressUpdateInput,
): Promise<Address | null> {
  if (!id) return null;

  const envelope = await apiRequest<Address>(
    `${ADDRESS_ENDPOINT}/${id}`,
    input,
    { method: "PUT" },
  );

  if (!envelope.data) return null;
  return envelope.data;
}

// DELETE
export async function deleteCustomerAddress(
  id: string,
  userId: string,
): Promise<boolean> {
  if (!id || !userId) return false;

  await apiRequest<ApiEnvelope<unknown>>(
    `${ADDRESS_ENDPOINT}/${id}`,
    { userId },
    { method: "DELETE" },
  );

  return true;
}

// React Query helpers
export function useAddressesByUserQuery(
  userId?: string | null,
  params?: AddressListParams,
  options?: UseQueryOptions<ListResult<Address>>,
) {
  return useQuery({
    queryKey: ["addresses", userId ?? "guest", params],
    queryFn: () =>
      userId
        ? listAddressesByUser(userId, params)
        : Promise.resolve({
          items: [],
          meta: {},
          raw: null,
        }),
    enabled: Boolean(userId),
    ...options,
  });
}
