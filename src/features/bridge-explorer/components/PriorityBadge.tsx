import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import type { PriorityLevel } from "@/domain/bridge";
import { AlertCircle, ArrowDownCircle, Gauge, Siren } from "lucide-react";

const priorityConfig: Record<
  PriorityLevel,
  {
    label: string;
    tone: "critical" | "high" | "medium" | "low";
    tooltip: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }
> = {
  Critical: {
    label: "Critical",
    tone: "critical",
    tooltip:
      "Application-derived priority: lowest rating <= 3, or Poor condition with high traffic, scour risk, or fracture risk.",
    icon: Siren,
  },
  High: {
    label: "High",
    tone: "high",
    tooltip:
      "Application-derived priority for bridges with Poor condition, rating 4, age >= 70, or high traffic.",
    icon: AlertCircle,
  },
  Medium: {
    label: "Medium",
    tone: "medium",
    tooltip:
      "Application-derived priority for bridges with Fair condition, rating 5, age >= 50, or moderate traffic.",
    icon: Gauge,
  },
  Low: {
    label: "Low",
    tone: "low",
    tooltip: "Application-derived priority with no major rule-based risk indicators.",
    icon: ArrowDownCircle,
  },
};

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Tooltip label={config.tooltip}>
      <Badge aria-label={`${config.label} priority`} tabIndex={0} tone={config.tone}>
        <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        {config.label}
      </Badge>
    </Tooltip>
  );
}
