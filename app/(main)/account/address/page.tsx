"use client";

import { JSX, useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/app/stores/auth";
import type { Address } from "@/types";
import {
  createAddress,
  deleteCustomerAddress,
  getAddressDetail,
  listAddressesByUser,
  updateCustomerAddress,
} from "@/lib/api/addresses";
import { getErrorMessage } from "@/lib/api/fetcher";
import { resolveNextPage } from "@/lib/api/normalizers";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddressFormValues } from "@/lib/validations/address-schema";
import { AddressView } from "@/components/accounts/address-view";
import { AddressModal } from "@/components/shared/address-modal";

const PAGE_SIZE = 2;

export default function AddressPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);

  const fetchAddresses = useCallback(
    async (
      targetUserId: string,
      pageToLoad = 1,
      mode: "replace" | "append" = "replace",
    ) => {
      if (!targetUserId) return;
      setListError(null);
      if (mode === "append") {
        setIsLoadingMore(true);
      } else {
        setIsListLoading(true);
      }
      try {
        const result = await listAddressesByUser(targetUserId, {
          page: pageToLoad,
          limit: PAGE_SIZE,
        });
        setAddresses((prev) => {
          if (mode === "append") {
            const existingIds = new Set(prev.map((item) => item.id));
            const merged = result.items.filter(
              (item) => !existingIds.has(item.id),
            );
            return [...prev, ...merged];
          }
          return result.items;
        });
        const upcomingPage = resolveNextPage(
          result.meta,
          result.items.length,
          PAGE_SIZE,
        );
        setNextPage(upcomingPage ?? undefined);
        setHasMore(typeof upcomingPage === "number");
      } catch (error) {
        const message = getErrorMessage(error, "Cannot load address.");
        setListError(message);
        toast.error(message);
      } finally {
        if (mode === "append") {
          setIsLoadingMore(false);
        } else {
          setIsListLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      setNextPage(undefined);
      setHasMore(false);
      return;
    }
    fetchAddresses(userId, 1, "replace");
  }, [userId, fetchAddresses]);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleAddAddress = async (values: AddressFormValues) => {
    if (!userId) {
      const message = "User not found.";
      toast.error(message);
      throw new Error(message);
    }
    const payload = {
      ...values,
      userId,
      isPrimary: values.isPrimary,
    };
    try {
      await createAddress(payload);
      toast.success("Address added successfully.");
      await fetchAddresses(userId, 1, "replace");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to add address.");
      toast.error(message);
      throw error;
    }
  };

  const handleUpdateAddress = async (values: AddressFormValues) => {
    if (!userId || !editingAddress) {
      const message = "Invalid Address.";
      toast.error(message);
      throw new Error(message);
    }
    const payload = {
      ...values,
      userId,
      isPrimary: values.isPrimary ?? editingAddress.isPrimary,
    };
    try {
      await updateCustomerAddress(editingAddress.id, payload);
      toast.success("Address updated successfully.");
      await fetchAddresses(userId, 1, "replace");
    } catch (error) {
      const message = getErrorMessage(error, "Failed to update address.");
      toast.error(message);
      throw error;
    }
  };

  const handleModalSubmit = async (values: AddressFormValues) => {
    if (editingAddress) {
      await handleUpdateAddress(values);
    } else {
      await handleAddAddress(values);
    }
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleEdit = async (address: Address) => {
    setDetailLoadingId(address.id);
    try {
      const latest = await getAddressDetail(address.id);
      setEditingAddress(latest ?? address);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleDelete = async (address: Address) => {
    if (!userId) return;
    try {
      await deleteCustomerAddress(address.id, userId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== address.id));
      toast.success("Address deleted successfully.");
      const remaining = addresses.length - 1;
      if (remaining <= PAGE_SIZE && hasMore) {
        await fetchAddresses(userId, 1, "replace");
      }
    } catch (error) {
      const message = getErrorMessage(error, "Failed to delete address.");
      toast.error(message);
    }
  };

  const handleLoadMore = async () => {
    if (!userId || typeof nextPage !== "number") return;
    await fetchAddresses(userId, nextPage, "append");
  };

  let content: JSX.Element;
  if (!userId) {
    content = (
      <div className="rounded-lg bg-tertiary p-4 text-sm">Please Login.</div>
    );
  } else if (isListLoading && addresses.length === 0) {
    content = (
      <div className="rounded-lg bg-tertiary p-4 text-sm">
        Loading Address...
      </div>
    );
  } else {
    content = (
      <AddressView
        myAddresses={addresses}
        onOpenAdd={handleOpenAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <>
      {listError && (
        <div className="mb-3 rounded border border-red-200 bg-red-100 p-3 text-sm text-red-600">
          {listError}
        </div>
      )}
      {content}
      {userId && hasMore && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
      <AddressModal
        show={showModal}
        mode={editingAddress ? "edit" : "add"}
        initialAddress={editingAddress ?? undefined}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />
      {detailLoadingId && (
        <div className="mt-3 text-xs">Loading Address detail...</div>
      )}
    </>
  );
}
