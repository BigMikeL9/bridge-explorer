"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import type { BridgeDetailDto } from "@/features/bridge-explorer/api/bridgeDtos";
import { useBridgeDetailsQuery } from "@/features/bridge-explorer/api/bridgeQueries";
import { ConditionBadge } from "@/features/bridge-explorer/components/ConditionBadge";
import { PriorityBadge } from "@/features/bridge-explorer/components/PriorityBadge";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import {
  formatBoolean,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatMeters,
  formatNumber,
  formatPercent,
  formatSquareMeters,
} from "@/features/bridge-explorer/utils/formatters";
import { RefreshCw, X } from "lucide-react";
import { useEffect, useRef } from "react";

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-md border border-border">
      <h3 className="border-b border-border bg-muted-surface px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-2 p-3 text-sm">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[128px_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium text-foreground">{value}</dd>
    </div>
  );
}

function LoadingDrawerBody() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="rounded-md border border-border p-3" key={index}>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

function BridgeDetailBody({ bridge }: { bridge: BridgeDetailDto }) {
  return (
    <dl className="space-y-4">
      <DetailSection title="Overview">
        <DetailRow label="Structure" value={bridge.structureNumber} />
        <DetailRow label="Facility" value={bridge.facilityCarried ?? "Unknown"} />
        <DetailRow label="Feature" value={bridge.featureIntersected ?? "Unknown"} />
        <DetailRow label="Location" value={bridge.location ?? "Unknown"} />
        <DetailRow
          label="Jurisdiction"
          value={`${bridge.countyName}, ${bridge.stateName}`}
        />
      </DetailSection>

      <DetailSection title="Condition">
        <DetailRow label="Overall" value={<ConditionBadge condition={bridge.bridgeCondition} />} />
        <DetailRow label="Lowest rating" value={formatNumber(bridge.lowestRating)} />
        <DetailRow label="Deck" value={formatNumber(bridge.deckCondition)} />
        <DetailRow
          label="Superstructure"
          value={formatNumber(bridge.superstructureCondition)}
        />
        <DetailRow
          label="Substructure"
          value={formatNumber(bridge.substructureCondition)}
        />
        <DetailRow label="Channel" value={formatNumber(bridge.channelCondition)} />
        <DetailRow label="Culvert" value={formatNumber(bridge.culvertCondition)} />
      </DetailSection>

      <DetailSection title="Priority reasons">
        <DetailRow label="Priority" value={<PriorityBadge priority={bridge.priorityLevel} />} />
        {bridge.priorityReasons.length > 0 ? (
          <ul className="col-span-full list-disc space-y-1 pl-5 text-sm">
            {bridge.priorityReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No priority reasons recorded.</p>
        )}
      </DetailSection>

      <DetailSection title="Traffic">
        <DetailRow label="ADT" value={formatNumber(bridge.averageDailyTraffic)} />
        <DetailRow label="Traffic year" value={formatNumber(bridge.trafficYear)} />
        <DetailRow
          label="Truck traffic"
          value={formatPercent(bridge.truckTrafficPercent)}
        />
        <DetailRow
          label="Future ADT"
          value={formatNumber(bridge.futureAverageDailyTraffic)}
        />
      </DetailSection>

      <DetailSection title="Timeline">
        <DetailRow label="Built" value={formatNumber(bridge.yearBuilt)} />
        <DetailRow
          label="Reconstructed"
          value={formatNumber(bridge.yearReconstructed)}
        />
        <DetailRow
          label="Age"
          value={bridge.bridgeAge === null ? "Unknown" : `${bridge.bridgeAge} years`}
        />
        <DetailRow
          label="Last inspection"
          value={formatDate(bridge.lastInspectionDate)}
        />
        <DetailRow
          label="Next due"
          value={formatDate(bridge.nextInspectionDueDate)}
        />
      </DetailSection>

      <DetailSection title="Geometry">
        <DetailRow label="Latitude" value={formatDecimal(bridge.latitude)} />
        <DetailRow label="Longitude" value={formatDecimal(bridge.longitude)} />
        <DetailRow
          label="Valid coords"
          value={bridge.hasValidCoordinates ? "Yes" : "No"}
        />
        <DetailRow
          label="Structure length"
          value={formatMeters(bridge.structureLengthMeters)}
        />
        <DetailRow label="Max span" value={formatMeters(bridge.maxSpanLengthMeters)} />
        <DetailRow label="Roadway width" value={formatMeters(bridge.roadwayWidthMeters)} />
        <DetailRow label="Deck width" value={formatMeters(bridge.deckWidthMeters)} />
        <DetailRow label="Deck area" value={formatSquareMeters(bridge.deckAreaSqMeters)} />
      </DetailSection>

      <DetailSection title="Ownership / classification">
        <DetailRow label="Owner" value={bridge.owner ?? "Unknown"} />
        <DetailRow
          label="Maintenance"
          value={bridge.maintenanceResponsibility ?? "Unknown"}
        />
        <DetailRow
          label="Functional class"
          value={bridge.functionalClass ?? "Unknown"}
        />
        <DetailRow label="Toll status" value={bridge.tollStatus ?? "Unknown"} />
        <DetailRow label="Open status" value={bridge.openStatus ?? "Unknown"} />
        <DetailRow label="Scour critical" value={bridge.scourCritical ?? "Unknown"} />
        <DetailRow
          label="Fracture critical"
          value={formatBoolean(bridge.fractureCritical)}
        />
        <DetailRow
          label="Improvement cost"
          value={formatCurrency(bridge.improvementCost)}
        />
      </DetailSection>
    </dl>
  );
}

export function BridgeDetailsDrawer() {
  const selectedBridgeId = useBridgeExplorerStore((state) => state.selectedBridgeId);
  const setSelectedBridgeId = useBridgeExplorerStore(
    (state) => state.setSelectedBridgeId
  );
  const query = useBridgeDetailsQuery();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = Boolean(selectedBridgeId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    returnFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedBridgeId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setSelectedBridgeId]);

  useEffect(() => {
    if (!isOpen) {
      returnFocusRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <Drawer
      aria-label="Bridge details"
      className="hidden max-h-[calc(100vh-1px)] w-[380px] shrink-0 overflow-hidden lg:flex lg:flex-col"
      open={isOpen}
    >
      <DrawerHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <DrawerTitle>Bridge Details</DrawerTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            View telemetry is recorded by the detail endpoint.
          </p>
        </div>
        <Button
          aria-label="Close details drawer"
          onClick={() => setSelectedBridgeId(null)}
          ref={closeButtonRef}
          size="icon"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </DrawerHeader>
      <DrawerContent className="min-h-0 flex-1 overflow-auto">
        {query.isLoading ? <LoadingDrawerBody /> : null}
        {query.isError ? (
          <div className="flex flex-col items-start gap-3 rounded-md border border-border p-4">
            <p className="text-sm font-medium">Bridge details could not be loaded.</p>
            <p className="text-sm text-muted-foreground">
              The selected bridge remains open so the request can be retried.
            </p>
            <Button onClick={() => void query.refetch()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : null}
        {query.data ? <BridgeDetailBody bridge={query.data} /> : null}
      </DrawerContent>
    </Drawer>
  );
}
