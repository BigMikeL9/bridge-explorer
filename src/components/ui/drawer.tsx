import { cn } from "@/lib/utils";
import * as React from "react";

export interface DrawerProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
}

export function Drawer({ open = true, className, ...props }: DrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <aside
      className={cn(
        "border-l border-border bg-surface text-foreground shadow-[0_1px_0_rgba(255,255,255,0.03)]",
        className
      )}
      {...props}
    />
  );
}

export function DrawerHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border px-4 py-3", className)} {...props} />;
}

export function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-sm font-semibold", className)} {...props} />;
}

export function DrawerContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
