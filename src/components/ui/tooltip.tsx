import { cn } from "@/lib/utils";
import * as React from "react";

export interface TooltipProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ label, children, className }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-max max-w-72 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-left text-xs leading-5 text-popover-foreground shadow-[0_10px_24px_rgb(0_0_0/0.28)] group-hover:block group-focus-within:block"
      >
        {label}
      </span>
    </span>
  );
}
