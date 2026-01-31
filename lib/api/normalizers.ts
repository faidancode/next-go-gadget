export type PaginationMeta = {
  total?: number;
  totalPages?: number;
  page?: number;
  limit?: number;
  nextPage?: number | null;
  prevPage?: number | null;
  hasNextPage?: boolean;
  [key: string]: unknown;
};

export type ListResult<T> = {
  items: T[];
  meta: PaginationMeta;
  raw: unknown;
};

type AnyRecord = Record<string, unknown>;

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null;
}

function extractMeta(payload: unknown): PaginationMeta {
  if (!isRecord(payload)) return {};
  if (isRecord(payload.meta)) return payload.meta as PaginationMeta;
  if (isRecord(payload.pagination)) return payload.pagination as PaginationMeta;
  if (isRecord(payload.data) && isRecord(payload.data.meta)) {
    return payload.data.meta as PaginationMeta;
  }
  return {};
}

export function toListResult<T>(payload: unknown): ListResult<T> {
  if (!payload) {
    return { items: [], meta: {}, raw: payload };
  }

  const meta = extractMeta(payload);
  let items: T[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else if (isRecord(payload)) {
    if (Array.isArray(payload.data)) {
      items = payload.data as T[];
    } else if (isRecord(payload.data) && Array.isArray(payload.data.items)) {
      items = payload.data.items as T[];
    } else if (Array.isArray(payload.items)) {
      items = payload.items as T[];
    } else if (Array.isArray(payload.results)) {
      items = payload.results as T[];
    } else if (Array.isArray(payload.records)) {
      items = payload.records as T[];
    } else if (Array.isArray(payload.rows)) {
      items = payload.rows as T[];
    }
  }

  return { items, meta, raw: payload };
}

export function unwrapSingle<T>(payload: unknown): T | null {
  if (!payload) return null;
  if (isRecord(payload)) {
    if (payload.data && !Array.isArray(payload.data)) {
      return payload.data as T;
    }
    if (payload.result) {
      return payload.result as T;
    }
    if (payload.item) {
      return payload.item as T;
    }
  }
  return payload as T;
}

export function resolveNextPage(
  meta: PaginationMeta | undefined,
  lastItemsLength: number,
  limit?: number
) {
  if (!meta) return undefined;
  if (typeof meta.nextPage === "number") return meta.nextPage;
  if (meta.hasNextPage === false) return undefined;
  if (meta.hasNextPage && typeof meta.page === "number") {
    return meta.page + 1;
  }
  if (typeof meta.page === "number" && typeof meta.limit === "number" && typeof meta.total === "number") {
    const totalPages = Math.ceil(meta.total / meta.limit);
    if (meta.page < totalPages) return meta.page + 1;
    return undefined;
  }
  if (typeof meta.page === "number" && typeof meta.totalPages === "number") {
    return meta.page < meta.totalPages ? meta.page + 1 : undefined;
  }
  if (typeof meta.page === "number" && limit && lastItemsLength < limit) {
    return undefined;
  }
  if (typeof meta.page === "number") {
    return meta.page + 1;
  }
  if (limit && lastItemsLength < limit) {
    return undefined;
  }
  return undefined;
}
