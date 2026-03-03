"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react"; // Pastikan Anda punya lucide-react

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getErrorPayload } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";
import {
  AddressFormValues,
  addressSchema,
} from "@/lib/validations/address-schema";
import type { Address } from "@/types";

const defaultValues: AddressFormValues = {
  label: "",
  recipientName: "",
  recipientPhone: "",
  street: "",
  subdistrict: "",
  district: "",
  city: "",
  province: "",
  postalCode: "",
  isPrimary: false,
};

function toFormValues(address?: Address | null): AddressFormValues {
  if (!address) return { ...defaultValues };
  return {
    label: address.label ?? "",
    recipientName: address.recipientName ?? "",
    recipientPhone: address.recipientPhone ?? "",
    street: address.street ?? "",
    subdistrict: address.subdistrict ?? "",
    district: address.district ?? "",
    city: address.city ?? "",
    province: address.province ?? "",
    postalCode: address.postalCode ?? "",
    isPrimary: address.isPrimary ?? false,
  };
}

export type AddressModalMode = "add" | "edit";

type AddressModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  mode: AddressModalMode;
  initialAddress?: Address | null;
};

export function AddressModal({
  show,
  onClose,
  onSubmit,
  mode,
  initialAddress,
}: AddressModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues,
    mode: "onBlur",
  });

  // --- TAMBAHKAN DI SINI ---
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("❌ Zod Validation Errors:", errors);
    }
  }, [errors]);
  // -------------------------

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      reset(toFormValues(initialAddress));
      setSubmitError(null);
    }
  }, [show, initialAddress, reset]);

  const onValid = async (values: AddressFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const payload = getErrorPayload(error);
      setSubmitError(payload.message);

      if (payload.fieldErrors) {
        Object.entries(payload.fieldErrors).forEach(([field, messages]) => {
          setError(field as keyof AddressFormValues, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      }
    }
  };

  const title = mode === "edit" ? "Edit Address" : "Add New Address";
  const submitLabel = mode === "edit" ? "Update Address" : "Save Address";

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-100"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl  text-slate-900">{title}</h3>
                <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-1">
                  Shipping Information
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onValid, () =>
                setSubmitError("Please check the fields marked in red."),
              )}
              className="p-8 pt-4 space-y-6"
            >
              {submitError && (
                <div className="p-4 text-xs font-mono text-red-600 bg-red-50 border border-red-100 rounded-2xl">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Label & Recipient Tetap Sama */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Address Label
                  </label>
                  <input
                    {...register("label")}
                    placeholder="e.g. Home, Office"
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:ring-2",
                      errors.label
                        ? "border-red-300 focus:ring-red-100"
                        : "focus:border-blue-600 focus:ring-blue-50",
                    )}
                  />
                  {errors.label && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.label.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Recipient Name
                  </label>
                  <input
                    {...register("recipientName")}
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.recipientName && "border-red-300",
                    )}
                  />
                  {errors.recipientName && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.recipientName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Phone Number
                  </label>
                  <input
                    {...register("recipientPhone")}
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.recipientPhone && "border-red-300",
                    )}
                  />
                  {errors.recipientPhone && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.recipientPhone.message}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Street Address
                  </label>
                  <textarea
                    {...register("street")}
                    rows={2}
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 resize-none",
                      errors.street && "border-red-300",
                    )}
                  />
                  {errors.street && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                {/* --- FIXED: SUBDISTRICT ADDED --- */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Subdistrict (Kecamatan)
                  </label>
                  <input
                    {...register("subdistrict")}
                    placeholder="Kecamatan"
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.subdistrict && "border-red-300",
                    )}
                  />
                  {errors.subdistrict && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.subdistrict.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    District (Kabupaten)
                  </label>
                  <input
                    {...register("district")}
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.district && "border-red-300",
                    )}
                  />
                  {errors.district && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.district.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    City
                  </label>
                  <input
                    {...register("city")}
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.city && "border-red-300",
                    )}
                  />
                  {errors.city && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Province
                  </label>
                  <input
                    {...register("province")}
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.province && "border-red-300",
                    )}
                  />
                  {errors.province && (
                    <p className="text-[10px] text-red-500 font-medium ml-1">
                      {errors.province.message}
                    </p>
                  )}
                </div>

                {/* --- FIXED: POSTAL CODE ERROR DISPLAY --- */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                    Postal Code
                  </label>
                  <input
                    {...register("postalCode")}
                    maxLength={5} // Bantu user agar tidak ngetik kepanjangan
                    className={cn(
                      "w-full bg-slate-50 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50",
                      errors.postalCode && "border-red-300",
                    )}
                  />
                  {/* Pesan error spesifik "Postal code cannot exceed 5 characters" akan muncul di sini */}
                  {errors.postalCode && (
                    <p className="text-[10px] text-red-500 font-bold italic ml-1 ring-red-50">
                      ⚠️ {errors.postalCode.message}
                    </p>
                  )}
                </div>

                <Controller
                  control={control}
                  name="isPrimary"
                  render={({ field }) => (
                    <div className="sm:col-span-2 flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-900">
                          Set as Primary
                        </span>
                        <span className="text-[10px] text-blue-600/70 font-medium">
                          Use this as your default shipping destination
                        </span>
                      </div>
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-xl px-6 h-12 text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-8 h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
