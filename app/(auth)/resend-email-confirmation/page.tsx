"use client";

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
import { useResendEmailConfirmation } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  ResendEmailInput,
  resendEmailSchema,
} from "@/lib/validations/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

export default function ResendEmailConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResendEmailContent />
    </Suspense>
  );
}

function ResendEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // string | null
  const form = useForm<ResendEmailInput>({
    defaultValues: {
      email: email ?? "",
    },
    resolver: zodResolver(resendEmailSchema),
  });

  const { mutate, isPending } = useResendEmailConfirmation();

  type ResendMessage = {
    message: string;
    variant: "success" | "warning" | "info" | "error";
  };

  const [alert, setAlert] = useState<ResendMessage | null>(null);

  const onSubmit = (data: ResendEmailInput) => {
    setAlert(null);

    mutate(data.email, {
      onSuccess: () => {
        setAlert({
          variant: "success",
          message:
            "If the email is registered, a confirmation message has been sent.",
        });
      },
      onError: (error) => {
        setAlert({
          variant: "error",
          message: getErrorMessage(error),
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <Logo />
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Verify your email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              We&apos;ll send a new activation link to your inbox.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5">
          {alert && (
            <Alert
              variant={alert.variant}
              className="animate-in fade-in zoom-in duration-300"
            >
              {alert.message}
            </Alert>
          )}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className={cn(
                  form.formState.errors.email && "text-destructive",
                )}
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@gadgetstore.com"
                className={cn(
                  "bg-background/50",
                  form.formState.errors.email &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isPending}
                {...form.register("email")}
              />
              {form.formState.errors.email?.message && (
                <p className="text-[0.7rem] font-medium text-destructive">
                  {form.formState.errors.email.message}
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
                  Sending link...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <p className="text-center text-[0.8rem] leading-relaxed text-muted-foreground italic">
              Didn&apos;t receive the email? Please check your{" "}
              <strong>spam folder</strong> or try again in a few minutes.
            </p>

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
