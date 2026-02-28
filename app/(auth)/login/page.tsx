"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { LoginForm } from "@/components/auth/login-form";
import { getErrorCode, getErrorMessage } from "@/lib/api/fetcher";
import { useLogin } from "@/lib/hooks/use-auth";
import { LoginFormValues } from "@/lib/validations/auth-schema";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
function safeRedirect(path: string | null) {
  if (!path || !path.startsWith("/")) {
    return "/";
  }
  return path;
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const showResend = emailNotConfirmed;
  const { mutate: login, isPending, error } = useLogin(); // Menggunakan hook baru

  const emailNotConfirmedMessage = emailNotConfirmed
    ? {
        message:
          "Your email is not confirmed yet. Please verify your email to continue. If you haven't received it or the link has expired, click the link below. ",
        variant: "warning" as const,
      }
    : null;

  type LoginMessageConfig = {
    message: string;
    variant: "success" | "warning" | "info" | "error";
  };

  const LOGIN_MESSAGES: Record<string, LoginMessageConfig> = {
    registered: {
      message: "Registration successful, please confirm your email.",
      variant: "success",
    },
    emailVerified: {
      message: "Your email has been verified. Please log in.",
      variant: "success",
    },
    tokenExpired: {
      message: "Session expired. Please login again.",
      variant: "warning",
    },
    resetPasswordSuccess: {
      message: "Password reset successful. Please login.",
      variant: "success",
    },
    next: {
      message: "Please login to continue.",
      variant: "info",
    },
  };

  const loginMessage = useMemo(() => {
    if (!searchParams) return null;

    for (const [key, config] of Object.entries(LOGIN_MESSAGES)) {
      if (key === "next") {
        if (searchParams.get("next")) {
          return config;
        }
        continue;
      }

      if (searchParams.get(key) === "1") {
        return config;
      }
    }

    return null;
  }, [searchParams]);

  const form = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const router = useRouter();
  const handleSubmit: SubmitHandler<LoginFormValues> = (values) => {
    setServerError(null);
    login(values, {
      onSuccess: () => {
        if (nextPath) {
          router.replace(safeRedirect(nextPath));
        } else {
          router.replace("/"); // fallback
        }
      },
      onError: (error) => {
        const code = getErrorCode(error);
        console.log({ code });
        if (code === "EMAIL_NOT_CONFIRMED") {
          setEmailNotConfirmed(true);
          setServerError(null);
          return;
        }

        setEmailNotConfirmed(false);
        setServerError(getErrorMessage(error, "Failed to login."));
      },
    });
  };

  const nextPath = searchParams?.get("next");

  return (
    <div className="flex min-h-svh max-w-xl flex-col items-center justify-center gap-6 p-4 md:p-10">
      <LoginForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={isPending}
        serverError={serverError}
        loginMessage={emailNotConfirmedMessage ?? loginMessage}
        showResend={showResend}
      />
    </div>
  );
}
