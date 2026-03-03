"use client";

import { useState } from "react";
import Link from "next/link";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

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
    <div
      className={cn("grid gap-8 w-full max-w-100 mx-auto", className)}
      {...props}
    >
      <Card className="border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-emerald-950/5 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-4 pb-6 text-center pt-10">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
              Welcome <span className="text-primary italic">Back</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Enter your credentials to access your tech hub.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 pb-10">
          {/* Messages Section */}
          {(loginMessage || serverError) && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {loginMessage && (
                <Alert
                  variant={loginMessage.variant}
                  className={cn(
                    "rounded-2xl transition-all",
                    loginMessage.variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    loginMessage.variant === "warning" && "border-amber-100 bg-amber-50 text-amber-700",
                    loginMessage.variant === "info" && "border-blue-100 bg-blue-50 text-blue-700"
                  )}
                >
                  {loginMessage.message}
                </Alert>
              )}

              {serverError && (
                <Alert variant="error" className="rounded-2xl">
                  {serverError}
                </Alert>
              )}

              {showResend && (
                <Link
                  href={`/resend-email-confirmation?email=${encodeURIComponent(form.getValues("email"))}`}
                  className="mt-3 block text-center text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                >
                  Resend verification code
                </Link>
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5"
            noValidate
          >
            {/* Email Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className={cn(
                  "text-xs font-black uppercase tracking-widest ml-1",
                  errors.email ? "text-red-500" : "text-slate-400",
                )}
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gadgetstore.com"
                className={cn(
                  "h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all",
                  errors.email && "border-red-500 focus-visible:ring-red-500",
                )}
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between ml-1">
                <Label
                  htmlFor="password"
                  className={cn(
                    "text-xs font-black uppercase tracking-widest",
                    errors.password ? "text-red-500" : "text-slate-400",
                  )}
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-black uppercase text-primary hover:opacity-80 tracking-wider"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "h-12 rounded-2xl bg-slate-50 border-slate-200 pr-11 focus:bg-white transition-all",
                    errors.password &&
                    "border-red-500 focus-visible:ring-red-500",
                  )}
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-2 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400">New Partner?</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
            asChild
          >
            <Link href="/register">Create an Account</Link>
          </Button>

          <div className="flex justify-center pt-2">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Home
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="px-8 text-center text-[10px] font-bold uppercase tracking-tighter leading-relaxed text-slate-400">
        Secured session. By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="text-slate-600 hover:text-primary underline-offset-4 decoration-2"
        >
          Terms
        </Link>{" "}
        &{" "}
        <Link
          href="/privacy"
          className="text-slate-600 hover:text-primary underline-offset-4 decoration-2"
        >
          Privacy
        </Link>
      </p>
    </div>
  );
}
