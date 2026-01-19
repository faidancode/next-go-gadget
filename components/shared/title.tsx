"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type TitleProps = {
  children: ReactNode;
  className?: string;
  noSpacing?: boolean;
};

export function Title({
  children,
  className,
  noSpacing = false,
}: TitleProps) {
  const spacing = noSpacing ? "" : "mb-4";

  return (
    <h1
      className={cn(
        "text-2xl font-semibold text-secondary",
        spacing,
        className
      )}
    >
      {children}
    </h1>
  );
}
