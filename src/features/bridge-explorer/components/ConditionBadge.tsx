import { Badge } from "@/components/ui/badge";
import type { BridgeCondition } from "@/domain/bridge";
import { CheckCircle2, CircleHelp, TriangleAlert } from "lucide-react";

const conditionConfig: Record<
  BridgeCondition,
  {
    label: string;
    tone: "good" | "fair" | "poor" | "neutral";
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }
> = {
  Good: {
    label: "Good",
    tone: "good",
    icon: CheckCircle2,
  },
  Fair: {
    label: "Fair",
    tone: "fair",
    icon: CircleHelp,
  },
  Poor: {
    label: "Poor",
    tone: "poor",
    icon: TriangleAlert,
  },
  Unknown: {
    label: "Unknown",
    tone: "neutral",
    icon: CircleHelp,
  },
};

export function ConditionBadge({ condition }: { condition: BridgeCondition }) {
  const config = conditionConfig[condition];
  const Icon = config.icon;

  return (
    <Badge tone={config.tone}>
      <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
      {config.label}
    </Badge>
  );
}
