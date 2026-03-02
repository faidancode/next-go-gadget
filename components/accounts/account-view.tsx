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
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ShieldUser } from "lucide-react";

export function AccountView({ user }: { user: any | null }) {
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Split name for initial values
  const nameParts = user?.name?.split(" ") || ["", ""];
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    // Pastikan schema Zod Anda juga diupdate untuk menerima firstName & lastName
    defaultValues: {
      firstName: firstName,
      lastName: lastName,
      password: "",
      confirmPassword: "",
    },
  });

  const updateProfileMutation = useUpdateCustomerProfile();

  const onSubmit = async (values: any) => {
    if (!user?.id) {
      toast.error("Please log in to update your profile.");
      return;
    }

    const fullName = `${values.firstName} ${values.lastName}`.trim();

    try {
      const updated = await updateProfileMutation.mutateAsync({
        ...values,
        name: fullName, // Kirim ke API sebagai satu string 'name'
      });

      login({
        ...user,
        name: fullName,
        email: updated?.email ?? user.email,
      });

      reset({
        firstName: values.firstName,
        lastName: values.lastName,
        password: "",
        confirmPassword: "",
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile."));
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900">
          Account <span className="text-primary italic">Settings</span>
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage your personal information and security preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- PERSONAL INFORMATION SECTION --- */}
        <section className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="p-2 bg-emerald-50 text-primary rounded-lg">
              <ShieldUser size={20} />
            </div>
            <h2 className="font-bold text-slate-800">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                First Name
              </label>
              <Input
                {...register("firstName")}
                placeholder="John"
                className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium"
              />
              {errors.firstName?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {String(errors.firstName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Last Name
              </label>
              <Input
                {...register("lastName")}
                placeholder="Doe"
                className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Input
                  value={user?.email || ""}
                  disabled
                  className="h-12 rounded-xl bg-slate-100 border-none font-medium text-slate-500 pl-10 cursor-not-allowed"
                />
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic ml-1">
                *Email cannot be changed for security reasons.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECURITY SECTION --- */}
        <section className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Lock size={20} />
            </div>
            <h2 className="font-bold text-slate-800">Security</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium pl-10"
                />
                <ShieldCheck
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="h-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 font-medium pl-10"
                />
                <ShieldCheck
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              <span className="font-bold text-amber-600">Tip:</span> Leave the
              password fields blank if you do not wish to change your current
              password. Use a mix of symbols and numbers for better security.
            </p>
          </div>
        </section>

        {/* --- ACTION BAR --- */}
        <div className="flex items-center justify-end pt-4">
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="h-14 px-12 rounded-2xl bg-slate-900 text-white font-black hover:bg-primary hover:scale-105 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-xs"
          >
            {updateProfileMutation.isPending ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
