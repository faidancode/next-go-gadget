"use client";

import { ReactNode, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAuthStore } from "../stores/auth";

const AUTH_ERROR_CODES = [
  "ACCESS_TOKEN_EXPIRED",
  "ACCESS_TOKEN_INVALID",
  "UNAUTHORIZED",
];

const PUBLIC_ERROR_CODES = [
  "RESET_TOKEN_EXPIRED",
  "RESET_TOKEN_INVALID",
  "LOGIN_FAILED",
  "EMAIL_NOT_VERIFIED",
];

export default function ReactQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const logoutUser = useAuthStore((state) => state.logout);

  const [client] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error: any) => {
          const status =
            error?.status ??
            error?.response?.status ??
            error?.response?.data?.status;

          const code = error?.code ?? error?.response?.data?.code;

          // ⛔️ Bukan auth error → jangan logout
          if (PUBLIC_ERROR_CODES.includes(code)) {
            return;
          }

          // ✅ Auth error → logout
          if (status === 401 && AUTH_ERROR_CODES.includes(code)) {
            logoutUser?.();
            window.location.href = "/login?tokenExpired=1";
          }
        },
      }),

      mutationCache: new MutationCache({
        onError: (error: any) => {
          const status =
            error?.status ??
            error?.response?.status ??
            error?.response?.data?.status;

          const code = error?.code ?? error?.response?.data?.code;

          if (PUBLIC_ERROR_CODES.includes(code)) {
            return;
          }

          if (status === 401 && AUTH_ERROR_CODES.includes(code)) {
            logoutUser?.();
            window.location.href = "/login";
          }
        },
      }),
    });
  });

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
