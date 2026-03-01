import { cn } from "@/lib/utils"; // Opsional: gunakan library shadcn/tailwind-merge jika ada
import { DefaultImage } from "./default-image";

interface SmallLogoProps {
  className?: string;
}

export default function SmallLogo({ className }: SmallLogoProps) {
  return (
    <DefaultImage
      // Menggabungkan class default 'w-16 rounded' dengan class dari props
      className={cn("w-16 rounded", className)}
      logoSize={28}
      logoOnly={true}
    />
  );
}