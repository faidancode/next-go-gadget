"use client";

import { BadgeAlert, BadgeCheck, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useConfirmEmail } from "@/lib/hooks/use-auth";
import { Logo } from "@/components/shared/logo";

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
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center my-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
        </CardHeader>

        <CardContent>
          {isPending && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying your email…
            </div>
          )}

          {message && (
            <div
              className={`rounded-md p-3 text-sm flex items-center gap-2 ${
                isSuccess
                  ? "bg-green-200 text-green-900"
                  : "bg-red-200 text-red-900"
              }`}
            >
              {isSuccess ? (
                <BadgeCheck className="h-5 w-5" />
              ) : (
                <BadgeAlert className="h-5 w-5" />
              )}
              {message}
            </div>
          )}
        </CardContent>
      </Card>
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
