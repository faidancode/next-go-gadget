import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@/app/stores/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { getErrorMessage } from "@/lib/api/fetcher";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/auth";
import {
  UpdateProfileFormInput,
  updateProfileInputSchema,
  useUpdateCustomerProfile,
} from "@/lib/api/customers";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AccountView({ user }: { user: User | null }) {
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileFormInput>({
    resolver: zodResolver(updateProfileInputSchema),
    defaultValues: {
      name: user?.name || "",
      password: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useUpdateCustomerProfile();

  const onSubmit = async (values: UpdateProfileFormInput) => {
    if (!user?.id) {
      toast.error("Please log in to update your profile.");
      return;
    }
    try {
      const updated = await updateProfileMutation.mutateAsync(values);
      if (updated) {
        login({
          id: updated.id ?? user.id,
          name: updated.name ?? values.name,
          email: updated.email ?? user.email,
          role: updated.role ?? user.role,
        });
      } else {
        login({
          ...user,
          name: values.name.trim(),
        });
      }
      reset({
        name: updated?.name ?? values.name,
        password: "",
        confirmPassword: "",
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile."));
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold">Account</h1>
      <form
        className="rounded-lg bg-tertiary p-4 space-y-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs">Name</label>
            <Input
              {...register("name")}
              placeholder="Full name"
              autoComplete="name"
            />
            {errors.name?.message && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs">Email</label>
            <Input value={user?.email || ""} disabled readOnly />
          </div>
          <div className="space-y-1">
            <label className="block text-xs">New Password</label>
            <label className="block text-xs text-indigo-500">
              *Leave blank to keep current password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder=""
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
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs">Confirm Password</label>
            <label className="block text-xs text-indigo-500">
              *Confirm the new password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat the new password"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword?.message && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
