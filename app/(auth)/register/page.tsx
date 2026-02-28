// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { getErrorMessage } from "@/lib/api/fetcher";
import { useRegister } from "@/lib/hooks/use-auth";
import { RegisterFormValues } from "@/lib/validations/auth-schema";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onTouched",
  });

  // Gunakan hook yang baru dibuat
  const { mutate, isPending } = useRegister();

  const handleSubmit: SubmitHandler<RegisterFormValues> = (values) => {
    setServerError(null); // Reset error sebelum mencoba lagi

    mutate(values, {
      onSuccess: () => {
        form.reset();
      },
      onError: (error) => {
        setServerError(getErrorMessage(error, "Failed to register account."));
      },
    });
  };

  return (
    <div className="flex min-h-svh max-w-xl flex-col items-center justify-center gap-6 p-4 md:p-10">
      <RegisterForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={isPending}
        serverError={serverError}
      />
    </div>
  );
}
