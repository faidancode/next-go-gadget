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
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
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
    <div className="flex min-h-svh items-center justify-center px-4 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-slate-50 via-white to-white">
      <Card className="w-full max-w-md border-slate-200/80 bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        {/* Visual Accent di bagian atas card */}
        <div className="h-2 bg-linear-to-r from-primary/20 via-primary to-primary/20" />

        <CardHeader className="space-y-4 pb-6 text-center pt-10">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/5 rounded-2xl">
              <Logo />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              Verify your email
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-slate-400 leading-relaxed">
              We&apos;ll send a new activation link <br /> to your inbox.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-8 pb-10">
          {alert && (
            <Alert
              variant={alert.variant}
              className={cn(
                "animate-in fade-in zoom-in duration-300 rounded-xl border-none",
                alert.variant === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              )}
            >
              <div className="flex items-center gap-2">
                <span className=" capitalize tracking-tight">{alert.message}</span>
              </div>
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
                  "text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors",
                  form.formState.errors.email ? "text-destructive" : "text-slate-400"
                )}
              >
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@gadgetstore.com"
                  className={cn(
                    "pl-12 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold",
                    form.formState.errors.email && "border-destructive focus-visible:ring-destructive/10"
                  )}
                  disabled={isPending}
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email?.message && (
                <p className="text-[10px] font-black uppercase tracking-tight text-destructive ml-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 mt-2 rounded-2xl bg-slate-900 hover:bg-black shadow-xl shadow-slate-200 font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Resend Link"
              )}
            </Button>
          </form>

          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-center text-[10px] leading-relaxed text-slate-400 font-bold uppercase tracking-wider">
                Didn&apos;t receive the email? <br />
                Check your <span className="text-slate-900">spam folder</span> or try again.
              </p>
            </div>

            <div className="flex justify-center border-t border-slate-100 pt-6">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all"
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
