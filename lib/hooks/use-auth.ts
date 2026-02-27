// hooks/use-auth.ts
import { useAuthStore } from "@/app/stores/auth";
import { useCartStore } from "@/app/stores/cart";
import { apiRequest, getErrorMessage } from "@/lib/api/fetcher";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getCartByUser,
  getCartCount,
  mapServerCartItemsToLocal,
} from "../api/cart";
import {
  LoginFormValues,
  RegisterFormValues,
  RequestPasswordResetInput,
} from "../validations/auth-schema";
import { CartItem } from "@/types/cart";
import { User } from "@/types/user";

type RegisterResponse = {
  message?: string;
};

// --- tipe respons sesuai API kamu ---
type LoginSuccessData = {
  role: string;
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
  };
  cart?: {
    items?: CartItem[] | null;
  } | null;
};

type LoginResponse = {
  ok: boolean;
  data: LoginSuccessData | null;
  meta: unknown;
  error: unknown;
};

async function registerUser(payload: RegisterFormValues) {
  return apiRequest<RegisterResponse>("/auth/register", {
    email: payload.email,
    first_name: payload.firstName,
    last_name: payload.lastName,
    password: payload.password,
    passwordConfirmation: payload.passwordConfirmation,
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("Registration successful! Please confirm your email.");
      router.push("/login?registered=1");
    },
  });
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      return apiRequest(`/auth/email-confirmation/verify?token=${token}`, {
        method: "GET",
      });
    },
  });
}

export function useResendEmailConfirmation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiRequest("/auth/email-confirmation/request", { email }),
    onSuccess: () => {
      toast.success(
        "If the email is registered, a confirmation message has been sent.",
      );
    },
    onError: (error) => {
      const message = getErrorMessage(error, "An unexpected error occurred.");
      toast.error("Failed", { description: message });
    },
  });
}

async function loginUser(payload: LoginFormValues) {
  return apiRequest<LoginSuccessData>("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
}

export function useLogin() {
  const router = useRouter();
  const authLogin = useAuthStore((state) => state.login);
  const cartStore = useCartStore.getState();

  const fetchCartTotalAndSync = async (userId: string) => {
    const cartData = await getCartByUser(); // dari API
    const serverItems = cartData?.items ?? [];
    const mappedItems = mapServerCartItemsToLocal(serverItems);
    useCartStore.getState().replaceAll(mappedItems); // update store sekaligus totalItems
  };

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (response) => {
      if (!response.ok || !response.data) throw new Error("Failed to login.");
      console.log(response.data);
      const { user, role } = response.data;
      if (!user?.email || !user?.id || !user?.name)
        throw new Error("Invalid response from server.");
      // 1. Map & Simpan User ke Zustand
      const mappedUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role,
      };
      authLogin(mappedUser);

      // 2. Sinkronisasi Keranjang (Hydration)
      try {
        const [serverCart, count] = await Promise.all([
          getCartByUser(),
          getCartCount(),
        ]);

        const normalized = mapServerCartItemsToLocal(serverCart?.items ?? []);

        if (normalized.length > 0) {
          cartStore.replaceAll(normalized);
        } else {
          cartStore.clear();
        }
        fetchCartTotalAndSync;
      } catch (error) {
        console.error("Cart sync failed:", error);
      }

      // 3. Redirect
      router.push("/");
      router.refresh();
    },
  });
}

type ResestPasswordResponseData = {
  success: boolean;
  emailSent?: boolean;
  message?: string;
};

async function requestReset(payload: RequestPasswordResetInput) {
  return apiRequest<ResestPasswordResponseData>(
    "/auth/password-reset/request",
    {
      email: payload.email,
    },
  );
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: requestReset,
  });
}

export type ResetPasswordApiPayload = {
  token: string;
  password: string; // Menyesuaikan dengan nama field di UI
};

async function resetPassword(payload: ResetPasswordApiPayload) {
  return apiRequest<{
    success: boolean;
    message: string;
  }>("/auth/password-reset/confirm", {
    token: payload.token,
    newPassword: payload.password, // Mapping ke key yang diharapkan API
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}
