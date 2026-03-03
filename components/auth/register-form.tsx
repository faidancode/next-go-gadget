"use client";

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
import { cn } from "@/lib/utils";
import { RegisterFormValues } from "@/lib/validations/auth-schema";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Alert } from "../shared/alert";

type RegisterFormProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  form: UseFormReturn<RegisterFormValues>;
  onSubmit: SubmitHandler<RegisterFormValues>;
  isLoading?: boolean;
  serverError?: string | null;
};

export function RegisterForm({
  className,
  form,
  onSubmit,
  isLoading,
  serverError,
  ...props
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const passwordValue = watch("password");
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "GoGadget";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className={cn("grid gap-8 w-full max-w-2xl mx-auto", className)}
      {...props}
    >
      <Card className="border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-2xl shadow-emerald-950/5 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="space-y-4 pb-1 text-center pt-3">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
              Create <span className="text-primary italic">Account</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Join {appName} to unlock exclusive tech deals.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 pb-10">
          {serverError && (
            <Alert
              variant="error"
              className="rounded-2xl animate-in fade-in zoom-in-95"
            >
              {serverError}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5"
            noValidate
          >

            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className={cn(
                  "text-xs font-black uppercase tracking-widest ml-1",
                  errors.name ? "text-red-500" : "text-slate-400",
                )}
              >
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className={cn(
                  "h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-300 placeholder:font-light transition-all",
                  errors.name && "border-red-500 focus-visible:ring-red-500",
                )}
                disabled={isLoading}
                {...register("name")}
              />
              {errors.name?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="phone"
                className={cn(
                  "text-xs font-black uppercase tracking-widest ml-1",
                  errors.email ? "text-red-500" : "text-slate-400",
                )}
              >
                Handphone
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="ex: 6282112345678"
                className={cn(
                  "h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-300 placeholder:font-light transition-all",
                  errors.phone && "border-red-500 focus-visible:ring-red-500",
                )}
                disabled={isLoading}
                {...register("phone")}
              />
              {errors.phone?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {errors.phone.message}
                </p>
              )}
            </div>
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
                placeholder="m@example.com"
                className={cn(
                  "h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white placeholder:text-slate-300 placeholder:font-light transition-all",
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
              <Label
                htmlFor="password"
                className={cn(
                  "text-xs font-black uppercase tracking-widest ml-1",
                  errors.password ? "text-red-500" : "text-slate-400",
                )}
              >
                Password
              </Label>
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

            {/* Password Confirmation Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="passwordConfirmation"
                className={cn(
                  "text-xs font-black uppercase tracking-widest ml-1",
                  errors.passwordConfirmation
                    ? "text-red-500"
                    : "text-slate-400",
                )}
              >
                Confirm Password
              </Label>
              <Input
                id="passwordConfirmation"
                type="password"
                className={cn(
                  "h-12 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white transition-all",
                  errors.passwordConfirmation &&
                  "border-red-500 focus-visible:ring-red-500",
                )}
                disabled={isLoading}
                {...register("passwordConfirmation")}
              />
              {errors.passwordConfirmation?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {errors.passwordConfirmation.message}
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center mt-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline ml-1">
                Login
              </Link>
            </p>
          </div>

          <div className="flex justify-center pt-2 border-t border-slate-200">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="px-8 text-center text-[10px] font-bold uppercase tracking-tighter leading-relaxed text-slate-400">
        By joining, you agree to our{" "}
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
