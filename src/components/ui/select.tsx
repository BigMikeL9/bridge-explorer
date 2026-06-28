import { cn } from "@/lib/utils";
import * as React from "react";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-8 w-full appearance-none rounded-md border border-input bg-[var(--surface-elevated)] px-3 pr-8 text-sm text-foreground outline-none transition-colors hover:border-[var(--border-strong)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-muted-surface disabled:text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";
