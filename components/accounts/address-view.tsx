import type { Address } from "@/types";
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

type AddressViewProps = {
  myAddresses: Address[];
  onOpenAdd: () => void;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
};

export function AddressView({
  myAddresses,
  onOpenAdd,
  onEdit,
  onDelete,
}: AddressViewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold ">Address</h1>
        <Button onClick={onOpenAdd}>Add Address</Button>
      </div>
      {myAddresses.length === 0 ? (
        <div className="rounded-lg bg-tertiary p-4 text-sm">
          No address yet.
        </div>
      ) : (
        <div className="space-y-3">
          {myAddresses.map((addr) => (
            <div key={addr.id} className="rounded-md border bg-tertiary p-4">
              <div className="flex flex-col items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold ">{addr.label}</span>
                    {addr.isPrimary && (
                      <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col text-xs gap-1">
                    <span>{addr.recipientName}</span>
                    <span className="text-gray-500">{addr.recipientPhone}</span>
                  </div>
                  <div className="mt-1 text-x">
                    {addr.street}, {addr.subdistrict}, {addr.district},{" "}
                    {addr.city}, {addr.province} {addr.postalCode}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onEdit(addr)}
                    className="text-xs font-semibold hover:text-white"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="text-xs font-semibold"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this address?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>{addr.label}</strong> will be permanently
                          deleted. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(addr)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
