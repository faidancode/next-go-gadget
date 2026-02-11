"use client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getErrorPayload } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";
import {
  AddressFormValues,
  addressSchema,
} from "@/lib/validations/address-schema";
import type { Address } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

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
    mode: "onBlur", // validasi saat field blur
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      reset(toFormValues(initialAddress));
    }
  }, [show, initialAddress, reset]);

  if (!show) return null;

  const onValid = async (values: AddressFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      // Gunakan fungsi utilitas yang kamu punya (mirip resolveFormError di admin)
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

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(
      onValid,
      () => setSubmitError("Please check the fields marked in red."), // Callback jika Zod gagal
    )(event);
  };

  const title = mode === "edit" ? "Edit Address" : "Add Address";
  const submitLabel = mode === "edit" ? "Update" : "Save";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-99 w-[92%] sm:w-130 rounded-md p-5 shadow-xl bg-gray-50 border border-gray-300">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {submitError && (
            <div className="p-3 text-sm text-red-700 bg-red-300 border border-red-400/20 rounded">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs ">Label</label>
              <input
                {...register("label")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.label
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                placeholder="Ex: Home, Office"
              />
              {errors.label && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.label.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs ">Recipient Name</label>
              <input
                {...register("recipientName")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.recipientName
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
              />
              {errors.recipientName && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.recipientName.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs ">Recipient Phone</label>
              <input
                {...register("recipientPhone")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.recipientPhone
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
              />
              {errors.recipientPhone && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.recipientPhone.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs ">Address</label>
              <textarea
                {...register("street")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.street
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                placeholder="Street and house number"
              />
              {errors.street && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.street.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs ">Subdistrict</label>
              <input
                {...register("subdistrict")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.subdistrict
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                placeholder="Subdistrict"
              />
              {errors.subdistrict && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.subdistrict.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs ">District</label>
              <input
                {...register("district")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.district
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                placeholder="District"
              />
              {errors.district && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.district.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs ">City</label>
              <input
                {...register("city")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.city
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                placeholder="ex: Kota Bandung"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs ">Province</label>
              <input
                {...register("province")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border border-black px-3 py-2 text-sm  focus:outline-none",
                  errors.province
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                placeholder="Province"
              />
              {errors.province && (
                <p className="mt-1 text-xs text-red-400 font-medium">
                  {errors.province.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs ">Postal Code</label>
              <input
                {...register("postalCode")}
                className={cn(
                  "mt-1 w-full bg-gray-100 rounded border px-3 py-2 text-sm  focus:outline-none",
                  errors.subdistrict
                    ? "border-red-500"
                    : "border-gray-400 focus:border-primary",
                )}
                type="number"
                placeholder="Kode Pos"
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.postalCode.message}
                </p>
              )}
            </div>
            <Controller
              control={control}
              name="isPrimary"
              render={({ field }) => (
                <div className="sm:col-span-2 flex items-center justify-between py-2">
                  <div className="text-xs text-primary">
                    Set as primary address
                  </div>
                  <Switch
                    id="isPrimary"
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              variant="ghost"
              onClick={() => {
                setSubmitError(null); // Clear the error message
                onClose(); // Close the modal
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
