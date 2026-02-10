"use client";

import { Logo } from "@/components/shared/logo"; // Sesuaikan path Logo Anda
import { cn } from "@/lib/utils";

interface DefaultImageProps {
  className?: string;
  iconClassName?: string;
  logoSize?: number; // Ukuran logo dalam piksel, default 40
  logoOnly?: boolean; // Jika true, hanya tampilkan logo tanpa teks
}

export function DefaultImage({
  className,
  iconClassName,
  logoSize = 40,
  logoOnly = false,
}: DefaultImageProps) {
  return (
    <div
      className={cn(
        "flex aspect-square w-full items-center justify-center bg-secondary transition-colors",
        className,
      )}
    >
      <div className={cn("opacity-20 grayscale", iconClassName)}>
        {/* Menggunakan Logo sebagai fallback icon */}
        <Logo width={logoSize} height={logoSize} logoOnly={logoOnly} />
      </div>

      {/* Opsional: Badge kecil penanda no-image */}
      <span className="absolute bottom-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
        No Image
      </span>
    </div>
  );
}
