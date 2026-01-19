"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BadgeAlert,
  BadgeCheck,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

// --- Import Komponen Custom ---
// Asumsikan impor ini tersedia di proyek Anda
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/api/fetcher"; //
import { useResetPassword } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/validations/auth-schema";
import { Logo } from "@/components/shared/logo";
import { Alert } from "@/components/shared/alert";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenError, setTokenError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      setTokenError("Reset token not found on URL.");
    } else {
      setTokenError(null);
    }
  }, [token]);

  const { mutate, isPending, isError, error, isSuccess } = useResetPassword();

  const onSubmit: SubmitHandler<ResetPasswordInput> = (data) => {
    if (!token) return;

    mutate(
      {
        token,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success("Password reset successful. Redirecting to login...");
          setTimeout(() => {
            router.push("/login?resetPasswordSuccess=1");
          }, 3000);
        },
        onError: (err: any) => {
          const code = err?.code ?? err?.response?.data?.code;
          if (code === "RESET_TOKEN_EXPIRED") {
            toast.error(
              "Reset link expired. Please request a new password reset.",
            );
          } else {
            toast.error(getErrorMessage(err, "Failed to reset password."));
          }
        },
      },
    );
  };

  const { errors } = form.formState;

  // Menentukan pesan tampilan berdasarkan status mutasi
  let displayMessage = tokenError;
  if (isError) {
    displayMessage = getErrorMessage(error, "Failed reset password.");
  } else if (isSuccess) {
    displayMessage =
      "Password successfully reset! You will be redirected to Login.";
  }

  // Loader state jika token belum siap
  if (!token && !tokenError) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <Logo />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Reset your password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Secure your account with a new, strong password.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            {/* New Password Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className={cn(errors.password && "text-destructive")}
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "bg-background/50 pr-10",
                    errors.password &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  disabled={isPending}
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className={cn(errors.confirmPassword && "text-destructive")}
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={cn(
                  "bg-background/50",
                  errors.confirmPassword &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isPending}
                {...form.register("confirmPassword")}
              />
              {errors.confirmPassword?.message && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 shadow-lg shadow-primary/20"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Save New Password"
              )}
            </Button>

            <div className="flex justify-center border-t border-border/40 pt-6">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft
                  size={14}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      {/* Suspense diperlukan karena useSearchParams() digunakan di Client Component */}
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4 md:p-10">
        <ResetPasswordContent />
      </div>
    </Suspense>
  );
}
