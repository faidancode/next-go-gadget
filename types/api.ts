export type ApiEnvelope<T> = {
  data: T;
  meta: Record<string, unknown>;
  error: Record<string, unknown>;
  ok: boolean;
};

export type PaginationMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
};
