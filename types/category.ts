import { PaginationMeta } from "./api";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  totalBooks?: number;
};

export type CategoryListParams = {
  page?: number;
  search?: string;
  sort?: string;
  limit?: number;
};

export type CategoryListResponse = {
  data: Category[];
  meta?: PaginationMeta;
};
