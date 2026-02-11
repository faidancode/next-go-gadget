import { Address } from ".";
import { ApiEnvelope } from "./api";

export type AddressListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type AddressCreateInput = {
  userId: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isPrimary?: boolean;
};

export type AddressUpdateInput = Partial<AddressCreateInput> & {
  isPrimary?: boolean;
};

export type AddressListEnvelope = ApiEnvelope<Address[]>;
