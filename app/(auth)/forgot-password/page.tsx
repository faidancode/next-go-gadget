// app/forgot-password/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { Alert } from "@/components/shared/alert";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import {
  RequestPasswordResetInput,
  requestPasswordResetSchema,
} from "@/lib/validations/auth-schema";
import { cn } from "@/lib/utils";

function ForgotPasswordContent() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<RequestPasswordResetInput>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  // ✅ Gunakan hook yang baru
  const { mutate, isPending, isError, error } = useForgotPassword();

  const onSubmit: SubmitHandler<RequestPasswordResetInput> = (data) => {
    mutate(data, {
      onSuccess: (response) => {
        if (response.ok) {
          setIsSuccess(true);
          setMessage(
            response.data?.message ??
              "If your email is registered, a reset link has been sent.",
          );
          setEmailSent(response.data?.emailSent ?? false);
          form.reset();
        } else {
          throw new Error("Reset request failed. Please try again later.");
        }
      },
    });
  };

  const { errors } = form.formState;
  const serverError = isError
    ? getErrorMessage(error, "Failed to connect to server.")
    : null;

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <Logo />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              No worries, we&apos;ll send you reset instructions.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5">
          {/* Status Messages */}
          {(message || serverError) && (
            <div className="space-y-3">
              {message && (
                <Alert variant={emailSent ? "success" : "error"}>
                  {message}
                </Alert>
              )}
              {serverError && <Alert variant="error">{serverError}</Alert>}
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className={cn(errors.email && "text-destructive")}
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gadgetstore.com"
                className={cn(
                  "bg-background/50",
                  errors.email &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isPending || isSuccess}
                {...form.register("email")}
              />
              {errors.email?.message && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 shadow-lg shadow-primary/20"
              disabled={isPending || isSuccess}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

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
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-4">
          Loading...
        </div>
      }
    >
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4 md:p-10">
        <ForgotPasswordContent />
      </div>
    </Suspense>
  );
}
