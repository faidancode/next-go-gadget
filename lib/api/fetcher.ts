import { ApiEnvelope } from "@/types/api";

// =====================
// Configuration
// =====================

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
};

export type ApiRequestInit = RequestInit & {
  raw?: boolean;
};

const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function shouldSkipRefresh(path: string) {
  return NO_REFRESH_PATHS.some((p) => path.startsWith(p));
}

// =====================
// Error
// =====================

export class ApiError<TBody = unknown> extends Error {
  status: number;
  body?: TBody;

  constructor(status: number, message: string, body?: TBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function extractCode(body: unknown): string {
  if (!body) return "";
  if (typeof body === "string") return body;

  if (typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.code === "string") return record.code;
    if (
      record.error &&
      typeof record.error === "object" &&
      typeof (record.error as any).code === "string"
    ) {
      return (record.error as any).code;
    }
  }

  return "";
}

function extractMessage(body: unknown): string {
  if (!body) return "";
  if (typeof body === "string") return body;

  if (typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (
      record.error &&
      typeof record.error === "object" &&
      typeof (record.error as any).message === "string"
    ) {
      return (record.error as any).message;
    }
  }

  return "";
}

function isRequestOptions(value: unknown): value is ApiRequestInit {
  return (
    typeof value === "object" &&
    value !== null &&
    ("method" in value ||
      "headers" in value ||
      "cache" in value ||
      "credentials" in value)
  );
}

// =====================
// Low-level fetch
// =====================

async function apiFetch(
  path: string,
  options: ApiRequestInit & { __retry?: boolean } = {},
) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
    headers: {
      "X-Client-Type": "web-customer",
      ...(options.headers || {}),
    },
  });

  // 1. Handle Refresh Token (Tetap sama)
  if (res.status === 401 && !options.__retry && !shouldSkipRefresh(path)) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch(path, { ...options, __retry: true });
    }
  }

  // 2. Handle Error Response
  if (!res.ok) {
    const rawBody = await res.text(); // Ambil teksnya SEKALI saja
    let body: any;

    try {
      body = JSON.parse(rawBody); // Coba parse manual
    } catch {
      body = rawBody; // Kalau bukan JSON, biarkan jadi string
    }

    const message = extractMessage(body) || res.statusText || "Request failed";
    throw new ApiError(res.status, message, body);
  }

  // 3. Handle Success Response
  if (options.raw) return res;

  // Hati-hati: res.json() di sini aman karena res.ok bernilai true
  // dan stream-nya belum pernah dibaca di atas.
  return res.json();
}

// =====================
// MAIN FETCHER (🔥)
// =====================

export async function apiRequest<T>(
  path: string,
  bodyOrOptions?: unknown,
  maybeOptions: ApiRequestInit = {},
): Promise<ApiEnvelope<T>> {
  const options = isRequestOptions(bodyOrOptions)
    ? bodyOrOptions
    : maybeOptions;

  const body = isRequestOptions(bodyOrOptions) ? undefined : bodyOrOptions;

  const isFormData = body instanceof FormData;

  const method = options.method ?? (body ? "POST" : "GET");

  const res = await apiFetch(path, {
    ...options,
    method,
    body: body
      ? isFormData
        ? body
        : typeof body === "string"
          ? body
          : JSON.stringify(body)
      : undefined,
    headers: {
      ...(isFormData ? {} : DEFAULT_HEADERS),
      ...(options.headers || {}),
    },
  });

  return res as ApiEnvelope<T>;
}

// =====================
// Helpers
// =====================

export function unwrapEnvelope<T>(
  envelope: ApiEnvelope<T>,
  fallback = "Request failed",
): T {
  if (envelope.ok) return envelope.data;

  const message =
    typeof envelope.error?.message === "string"
      ? envelope.error.message
      : fallback;

  throw new ApiError(400, message, envelope.error);
}

export function buildQueryString(params?: Record<string, unknown>) {
  if (!params) return "";

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }

  return search.toString();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    return res.ok;
  } catch {
    return false;
  }
}
//================================
// Error Helpers
// ============================================

export type ApiErrorPayload = {
  message: string;
  status?: number;
  body?: unknown;
  fieldErrors?: Record<string, string[]>;
};

type MaybeErrorBody = {
  message?: unknown;
  error?: unknown;
  errors?: unknown;
};

/**
 * Extract error message from ApiError or generic Error
 */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  // Handle ApiError
  if (error instanceof ApiError) {
    const message = extractMessage(error.body);
    return message || error.message || fallback;
  }

  // Handle generic Error
  if (error instanceof Error) {
    return error.message || fallback;
  }

  // Handle string
  if (typeof error === "string") {
    return error;
  }

  return fallback;
}

export function getErrorCode(
  error: unknown,
  fallback = "Something went wrong",
): string {
  // Handle ApiError
  if (error instanceof ApiError) {
    const message = extractCode(error.body);
    return message || error.message || fallback;
  }

  // Handle generic Error
  if (error instanceof Error) {
    return error.message || fallback;
  }

  // Handle string
  if (typeof error === "string") {
    return error;
  }

  return fallback;
}

/**
 * Extract detailed error payload with field errors
 */
export function getErrorPayload(
  error: unknown,
  fallback = "Something went wrong",
): ApiErrorPayload {
  // Handle ApiError
  if (error instanceof ApiError) {
    const body = error.body;
    const message = extractMessage(body) || error.message || fallback;
    const fieldErrors = extractFieldErrors(body);

    return {
      message,
      status: error.status,
      body,
      fieldErrors,
    };
  }

  // Handle generic Error
  if (error instanceof Error) {
    return { message: error.message || fallback };
  }

  // Handle string
  if (typeof error === "string") {
    return { message: error };
  }

  return { message: fallback };
}

/**
 * Extract field validation errors from error body
 */
function extractFieldErrors(
  body: unknown,
): Record<string, string[]> | undefined {
  if (!body || typeof body !== "object") return undefined;

  const record = body as Record<string, unknown>;

  // Check for errors array (common validation format)
  if (Array.isArray(record.errors)) {
    const fieldErrors: Record<string, string[]> = {};

    for (const err of record.errors) {
      if (typeof err === "object" && err !== null) {
        const error = err as Record<string, unknown>;
        const field = error.field || error.path;
        const message = error.message;

        if (typeof field === "string" && typeof message === "string") {
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(message);
        }
      }
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
  }

  // Check for fieldErrors object
  if (record.fieldErrors && typeof record.fieldErrors === "object") {
    return record.fieldErrors as Record<string, string[]>;
  }

  return undefined;
}
