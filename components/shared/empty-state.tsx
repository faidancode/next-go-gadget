import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type EmptyStateProps = {
  title?: string;
  description?: string;
  href?: string;
  linkText?: string;
  showButton?: boolean;
};

export function EmptyState({
  title = "Your cart is empty",
  description = "Go find the products you like",
  href = "/shop",
  linkText = "Return to shop",
  showButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center text-gray-500 py-10 gap-2">
      <Image
        src="/empty-cart.svg"
        alt="Empty Cart"
        width={220}
        height={220}
        className="mx-auto mb-6"
      />
      <div>
        <p className="text-secondary text-2xl font-semibold">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {showButton && (
        <Link href={href} className="mt-4">
        <Button variant="secondary">{linkText}</Button>
      </Link>
      )}
    </div>
  );
}
