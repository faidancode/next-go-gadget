import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@/app/stores/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { getErrorMessage } from "@/lib/api/fetcher";
import { toast } from "sonner";
import { useAuthStore } from "@/app/stores/auth";
import {
  UpdateProfileInput,
  updateProfileInputSchema,
  useUpdateCustomerProfile,
} from "@/lib/api/customers";

export function AccountView({ user }: { user: User | null }) {
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileInputSchema),
    defaultValues: {
      name: user?.name ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useUpdateCustomerProfile();

  const onSubmit = async (values: UpdateProfileInput) => {
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
            <Input {...register("name")} placeholder="Full name" />
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
            <Input
              type="password"
              placeholder="Leave blank to keep current password"
              {...register("password")}
            />
            {errors.password?.message && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-xs">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="Repeat the new password"
              {...register("confirmPassword")}
            />
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
