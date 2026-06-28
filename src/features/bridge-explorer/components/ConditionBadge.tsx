import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import type { BridgeCondition } from "@/domain/bridge";
import { CheckCircle2, CircleHelp, TriangleAlert } from "lucide-react";

const conditionConfig: Record<
  BridgeCondition,
  {
    label: string;
    tone: "good" | "fair" | "poor" | "neutral";
    tooltip: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }
> = {
  Good: {
    label: "Good",
    tone: "good",
    tooltip: "FHWA/NBI condition is Good; no major condition concern is indicated.",
    icon: CheckCircle2,
  },
  Fair: {
    label: "Fair",
    tone: "fair",
    tooltip: "FHWA/NBI condition is Fair; monitor condition and inspection context.",
    icon: CircleHelp,
  },
  Poor: {
    label: "Poor",
    tone: "poor",
    tooltip: "FHWA/NBI condition is Poor; this bridge may need closer review.",
    icon: TriangleAlert,
  },
  Unknown: {
    label: "Unknown",
    tone: "neutral",
    tooltip: "Condition could not be normalized from the available NBI value.",
    icon: CircleHelp,
  },
};

export function ConditionBadge({ condition }: { condition: BridgeCondition }) {
  const config = conditionConfig[condition];
  const Icon = config.icon;

  return (
    <Tooltip label={config.tooltip}>
      <Badge aria-label={`${config.label} condition`} tabIndex={0} tone={config.tone}>
        <Icon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        {config.label}
      </Badge>
    </Tooltip>
  );
}
