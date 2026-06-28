import { cn } from "@/lib/utils";
import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "good" | "fair" | "poor" | "critical" | "high" | "medium" | "low";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-border bg-muted-surface text-muted-foreground",
  good: "border-[var(--condition-good-border)] bg-[var(--condition-good-bg)] text-[var(--condition-good-text)]",
  fair: "border-[var(--condition-fair-border)] bg-[var(--condition-fair-bg)] text-[var(--condition-fair-text)]",
  poor: "border-[var(--condition-poor-border)] bg-[var(--condition-poor-bg)] text-[var(--condition-poor-text)]",
  critical: "border-[var(--priority-critical-border)] bg-[var(--priority-critical-bg)] text-[var(--priority-critical-text)]",
  high: "border-[var(--priority-high-border)] bg-[var(--priority-high-bg)] text-[var(--priority-high-text)]",
  medium: "border-[var(--priority-medium-border)] bg-[var(--priority-medium-bg)] text-[var(--priority-medium-text)]",
  low: "border-[var(--priority-low-border)] bg-[var(--priority-low-bg)] text-[var(--priority-low-text)]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
