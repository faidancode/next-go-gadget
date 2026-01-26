import { PaginationMeta } from "./api";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  totalBooks?: number;
};

export type BrandListParams = {
  page?: number;
  search?: string;
  sort?: string;
  pageSize?: number;
};

export type BrandListResponse = {
  data: Brand[];
  meta?: PaginationMeta;
};
