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
    <div className={cn("grid gap-6", className)} {...props}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <Logo />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Create an account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Join {appName} and get the latest tech gear
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5">
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            {/* Row for First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="firstName"
                  className={cn(errors.firstName && "text-destructive")}
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className={cn(
                    "bg-background/50",
                    errors.firstName &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  disabled={isLoading}
                  {...register("firstName")}
                />
                {errors.firstName?.message && (
                  <p className="text-[0.7rem] font-medium text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="lastName"
                  className={cn(errors.lastName && "text-destructive")}
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className={cn(
                    "bg-background/50",
                    errors.lastName &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                  disabled={isLoading}
                  {...register("lastName")}
                />
                {errors.lastName?.message && (
                  <p className="text-[0.7rem] font-medium text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
                placeholder="m@example.com"
                className={cn(
                  "bg-background/50",
                  errors.email &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isLoading}
                {...register("email")}
              />
              {errors.email?.message && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className={cn(errors.password && "text-destructive")}
              >
                Password
              </Label>
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
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="grid gap-2">
              <Label
                htmlFor="passwordConfirmation"
                className={cn(
                  errors.passwordConfirmation && "text-destructive",
                )}
              >
                Confirm Password
              </Label>
              <Input
                id="passwordConfirmation"
                type="password"
                className={cn(
                  "bg-background/50",
                  errors.passwordConfirmation &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isLoading}
                {...register("passwordConfirmation")}
              />
              {errors.passwordConfirmation?.message && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {errors.passwordConfirmation.message}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </div>

          <div className="flex justify-center border-t border-border/40 pt-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to showroom
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="px-8 text-center text-[0.75rem] leading-relaxed text-muted-foreground">
        By creating an account, you agree to our{" "}
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
