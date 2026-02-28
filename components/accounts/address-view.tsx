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
import { Briefcase, Edit3, Home, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: {
  myAddresses: Address[];
  onOpenAdd: () => void;
  onEdit: (addr: Address) => void;
  onDelete: (addr: Address) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">
            Shipping <span className="text-primary italic">Addresses</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage where your premium gear gets delivered.
          </p>
        </div>
        <Button
          onClick={onOpenAdd}
          className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-primary transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
          <span className="font-bold uppercase tracking-widest text-[10px]">
            Add New Address
          </span>
        </Button>
      </div>

      {myAddresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <MapPin size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myAddresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "group relative p-6 rounded-[2.5rem] border-2 transition-all duration-300",
                addr.isPrimary
                  ? "border-primary bg-emerald-50/30 shadow-xl shadow-emerald-100/20"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100",
              )}
            >
              {addr.isPrimary && (
                <div className="absolute -top-3 left-8 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  Default Address
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl",
                      addr.isPrimary
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {addr.label?.toLowerCase() === "office" ? (
                      <Briefcase size={18} />
                    ) : (
                      <Home size={18} />
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">
                    {addr.label || "Home"}
                  </h3>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(addr)}
                    className="p-2 hover:bg-white hover:text-primary rounded-lg transition-colors text-slate-400"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(addr)}
                    className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-slate-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                {/* <p className="font-bold text-slate-800">{addr.receiverName}</p>
                <p className="text-xs text-slate-500 font-medium">
                  {addr.phoneNumber}
                </p> */}
                <p className="text-sm text-slate-600 leading-relaxed mt-3 pr-4">
                  {addr.street}, {addr.city}, {addr.province} {addr.postalCode}
                </p>
              </div>

              {!addr.isPrimary && (
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5">
                  <Star size={12} />
                  Set as Default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
