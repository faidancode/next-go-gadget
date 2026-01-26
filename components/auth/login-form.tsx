"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Alert } from "@/components/shared/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoginFormValues } from "@/lib/validations/auth-schema";

export type LoginMessage = {
  message: string;
  variant: "success" | "warning" | "info" | "error";
};

type LoginFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: SubmitHandler<LoginFormValues>;
  isLoading?: boolean;
  serverError?: string | null;
  loginMessage?: LoginMessage | null;
  showResend?: boolean;
};

export function LoginForm({
  className,
  form,
  onSubmit,
  isLoading,
  serverError,
  loginMessage,
  showResend = false,
  ...props
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-3 pb-8 text-center">
          <Logo />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to continue shopping.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6">
          {/* Messages Section */}
          {(loginMessage || serverError) && (
            <div className="space-y-3">
              {loginMessage && (
                <Alert variant={loginMessage.variant}>
                  {loginMessage.message}
                </Alert>
              )}
              {serverError && <Alert variant="error">{serverError}</Alert>}
              {showResend && (
                <Link
                  href={`/resend-email-confirmation?email=${encodeURIComponent(form.getValues("email"))}`}
                  className="block text-center text-xs font-medium text-primary hover:underline"
                >
                  Didn&apos;t receive code? Resend verification
                </Link>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            {/* Email Field */}
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
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className={cn(errors.password && "text-destructive")}
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "bg-background/50 pr-10",
                    errors.password &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  disabled={isLoading}
                  {...register("password")}
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
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                New to GoGadget?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent border-muted-foreground/20"
            asChild
          >
            <Link href="/register">Create an account</Link>
          </Button>

          <div className="flex justify-center border-t border-border/40 pt-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="px-8 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
