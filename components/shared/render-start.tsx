import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function renderStars(count: number) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          className={cn(
            "size-4",
            idx < count ? "text-secondary" : "text-gray-600"
          )}
        />
      ))}
    </div>
  );
}
