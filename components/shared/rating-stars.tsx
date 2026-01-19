import { Star } from "lucide-react";

export type RatingStarsProps = {
  value: number;
  size?: number;
  max?: number;
  filledColor?: string;
  emptyColor?: string;
};

export function RatingStars({
  value,
  size = 16,
  max = 5,
  filledColor = "oklch(0.69 0.21 34)",
  emptyColor = "#cbd5e1",
}: RatingStarsProps) {
  const rounded = Math.round(Math.max(0, Math.min(value, max)));
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, idx) => {
        const isFilled = idx < rounded;
        return (
          <Star
            key={idx}
            size={size}
            color={isFilled ? filledColor : emptyColor}
            fill={isFilled ? filledColor : "transparent"}
          />
        );
      })}
    </div>
  );
}
