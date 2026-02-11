"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { removeProductFromWishlist } from "@/lib/api/wishlists";
import { useAddToCart } from "@/lib/hooks/use-cart";
import { Product } from "@/types/product";
import { ShoppingBag, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type WishlistItemActionsProps = {
  product: Product;
  wishlistItemId: string;
  userId?: string;
  onWishlistMutated?: () => Promise<unknown> | void;
};

export function WishlistItemActions({
  product,
  userId,
  wishlistItemId,
  onWishlistMutated,
}: WishlistItemActionsProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const addToCart = useAddToCart(product);
  const handleAddToCart = () => {
    addToCart.mutate();
  };

  const handleRemoveWishlist = async () => {
    if (!userId) {
      return;
    }
    setIsRemoving(true);
    try {
      await removeProductFromWishlist(product.id);
      await onWishlistMutated?.();
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
    } finally {
      toast.success("Product has been removed from wishlist.");
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            className="w-full justify-center"
            disabled={!userId || isRemoving}
          >
            <Trash size={16} />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm removal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product from your wishlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={!userId || isRemoving}
              onClick={handleRemoveWishlist}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={handleAddToCart}
      >
        <ShoppingBag size={16} />
        Add to cart
      </Button>
    </div>
  );
}
