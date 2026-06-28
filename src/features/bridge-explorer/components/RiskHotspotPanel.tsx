"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskHotspotDto } from "@/features/bridge-explorer/api/bridgeDtos";
import { useRiskHotspotsQuery } from "@/features/bridge-explorer/api/bridgeQueries";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { formatNumber } from "@/features/bridge-explorer/utils/formatters";
import { AlertTriangle, Building2, MapPin, RefreshCw } from "lucide-react";

function HotspotRow({
  hotspot,
  onSelect,
}: {
  hotspot: RiskHotspotDto;
  onSelect: (hotspot: RiskHotspotDto) => void;
}) {
  const label =
    hotspot.scope === "state"
      ? hotspot.stateName
      : (hotspot.countyName ?? "Unknown County");
  const sublabel =
    hotspot.scope === "state"
      ? hotspot.stateCode
      : `${hotspot.stateName} ${hotspot.countyCode ?? ""}`.trim();
  const maxRisk = Math.max(hotspot.riskScore, hotspot.totalBridgeCount, 1);
  const riskWidth = Math.min(100, Math.round((hotspot.riskScore / maxRisk) * 100));

  return (
    <button
      className="cursor-pointer w-full rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-[var(--brand-border)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onSelect(hotspot)}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {hotspot.scope === "state" ? (
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className="truncate text-sm font-semibold">{label}</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
        </div>
        <Badge tone={hotspot.criticalCount > 0 ? "critical" : "high"}>
          {formatNumber(hotspot.riskScore)}
        </Badge>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
        <div
          className="h-full rounded-full bg-[var(--priority-critical-text)]"
          style={{ width: `${riskWidth}%` }}
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1.5">
          <p className="font-mono font-semibold">{formatNumber(hotspot.totalBridgeCount)}</p>
          <p className="text-muted-foreground">Bridges</p>
        </div>
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1.5">
          <p className="font-mono font-semibold">{formatNumber(hotspot.poorConditionCount)}</p>
          <p className="text-muted-foreground">Poor</p>
        </div>
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1.5">
          <p className="font-mono font-semibold">{formatNumber(hotspot.highCount)}</p>
          <p className="text-muted-foreground">High</p>
        </div>
        <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-2 py-1.5">
          <p className="font-mono font-semibold">{formatNumber(hotspot.criticalCount)}</p>
          <p className="text-muted-foreground">Critical</p>
        </div>
      </div>
    </button>
  );
}

export function RiskHotspotPanel() {
  const query = useRiskHotspotsQuery();
  const filters = useBridgeExplorerStore((state) => state.filters);
  const setStateCode = useBridgeExplorerStore((state) => state.setStateCode);
  const setCountyCode = useBridgeExplorerStore((state) => state.setCountyCode);

  const selectHotspot = (hotspot: RiskHotspotDto) => {
    if (hotspot.scope === "state") {
      setStateCode(hotspot.stateCode);
      return;
    }

    if (filters.stateCode !== hotspot.stateCode) {
      setStateCode(hotspot.stateCode);
    }
    setCountyCode(hotspot.countyCode);
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="bg-surface">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--priority-high-text)]" />
          <CardTitle>Risk Hotspots</CardTitle>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {filters.stateCode
            ? "County-level hotspots within the selected state."
            : "State-level hotspots across the national inventory."}
        </p>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-3 pt-0 overflow-auto bg-background">
        <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <Badge tone="critical">
            {query.data?.scope === "county" ? "County scope" : "State scope"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {query.data ? `${query.data.hotspots.length} shown` : "Loading"}
          </span>
        </div>

        {query.isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div className="rounded-lg border border-border bg-surface p-3" key={index}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="mt-3 h-2 w-full" />
              <div className="mt-3 grid grid-cols-4 gap-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            </div>
          ))
        ) : query.isError ? (
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-sm font-medium">Hotspots could not be loaded.</p>
            <Button
              className="mt-3"
              onClick={() => void query.refetch()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : query.data?.hotspots.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
            No hotspots match the current filters.
          </div>
        ) : (
          query.data?.hotspots.map((hotspot) => (
            <HotspotRow
              hotspot={hotspot}
              key={`${hotspot.scope}-${hotspot.stateCode}-${hotspot.countyCode ?? "all"}`}
              onSelect={selectHotspot}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
