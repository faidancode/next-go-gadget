import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Asumsi menggunakan shadcn/ui

interface LinkButtonProps {
  href: string;
  text: string;
  className?: string;
}

const LinkButton = ({ href, text, className }: LinkButtonProps) => {
  return (
    <Button
      variant="ghost"
      asChild
      className={`group text-primary border border-gray-200 hover:text-primary hover:bg-primary/10 ${className}`}
    >
      <Link href={href} className="flex items-center gap-1">
        {text}
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>
  );
};

export default LinkButton;
