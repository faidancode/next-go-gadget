"use client";

import { BadgeCheck, Link, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useConfirmEmail } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate, isPending, isSuccess, isError, error } = useConfirmEmail();

  useEffect(() => {
    if (!token) {
      setLocalError("Invalid verification link.");
      return;
    }

    mutate(token, {
      onSuccess: () => {
        setTimeout(() => {
          router.replace("/login?emailVerified=1");
        }, 3000);
      },
    });
  }, [token, mutate, router]);

  let message = null;
  if (localError) message = localError;
  else if (isError)
    message = getErrorMessage(
      error,
      "Verification link is invalid or expired.",
    );
  else if (isSuccess) message = "Email successfully verified. Redirecting…";

  return (
    <div className="flex min-h-svh items-center justify-center px-4 bg-[radial-gradient(circle_at_bottom,var(--tw-gradient-stops))] from-slate-50 via-white to-white">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card className="border-slate-100 bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
          {/* Progress bar tipis untuk loading state */}
          {isPending && (
            <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-primary animate-progress-loading" />
            </div>
          )}

          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-105 duration-300">
                <Logo />
              </div>
            </div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900">
              Email Verification
            </CardTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">
              Secure Authentication System
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-12">
            {isPending && (
              <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in fade-in duration-500">
                <div className="relative">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/20" strokeWidth={3} />
                  <Loader2 className="h-10 w-10 animate-spin text-primary absolute top-0 left-0 animation-duration-[1.5s]" strokeWidth={3} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
                  Validating Token...
                </p>
              </div>
            )}

            {message && (
              <div
                className={cn(
                  "rounded-2xl p-6 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-500",
                  isSuccess
                    ? "bg-emerald-50/50 border border-emerald-100"
                    : "bg-red-50/50 border border-red-100"
                )}
              >
                <div className={cn(
                  "p-3 rounded-full shadow-sm",
                  isSuccess ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {isSuccess ? (
                    <BadgeCheck className="h-8 w-8" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="h-8 w-8" strokeWidth={2.5} />
                  )}
                </div>

                <div className="space-y-1">
                  <p className={cn(
                    "text-sm font-black uppercase tracking-tight",
                    isSuccess ? "text-emerald-900" : "text-red-900"
                  )}>
                    {isSuccess ? "Success!" : "Verification Failed"}
                  </p>
                  <p className={cn(
                    "text-xs font-medium leading-relaxed",
                    isSuccess ? "text-emerald-700/80" : "text-red-700/80"
                  )}>
                    {message}
                  </p>
                </div>

                {isSuccess && (
                  <Button
                    asChild
                    className="mt-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all"
                  >
                    <Link href="/login">Continue to Login</Link>
                  </Button>
                )}

              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
          © 2026 GadgetStore Ecosystem
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <div className="flex min-h-svh items-center justify-center p-4">
        <VerifyEmailContent />
      </div>
    </Suspense>
  );
}
