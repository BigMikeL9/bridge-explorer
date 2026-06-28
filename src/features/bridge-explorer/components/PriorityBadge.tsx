import { Badge } from "@/components/ui/badge";
import type { PriorityLevel } from "@/domain/bridge";
import { AlertCircle, ArrowDownCircle, Gauge, Siren } from "lucide-react";

const priorityConfig: Record<
  PriorityLevel,
  {
    label: string;
    tone: "critical" | "high" | "medium" | "low";
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }
> = {
  Critical: {
    label: "Critical",
    tone: "critical",
    icon: Siren,
  },
  High: {
    label: "High",
    tone: "high",
    icon: AlertCircle,
  },
  Medium: {
    label: "Medium",
    tone: "medium",
    icon: Gauge,
  },
  Low: {
    label: "Low",
    tone: "low",
    icon: ArrowDownCircle,
  },
};

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Badge tone={config.tone}>
      <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
      {config.label}
    </Badge>
  );
}
