import type { BridgeDetailDto } from "@/features/bridge-explorer/api/bridgeDtos";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BridgeDetailsDrawer } from "./BridgeDetailsDrawer";

const detail: BridgeDetailDto = {
  id: "bridge-1",
  structureNumber: "0001",
  stateCode: "42",
  stateName: "Pennsylvania",
  countyCode: "003",
  countyName: "Allegheny",
  district: "11",
  facilityCarried: "I-279",
  location: "Pittsburgh",
  featureIntersected: "Allegheny River",
  latitude: 40.45,
  longitude: -79.99,
  hasValidCoordinates: true,
  averageDailyTraffic: 30000,
  trafficYear: 2022,
  truckTrafficPercent: 12,
  futureAverageDailyTraffic: 42000,
  yearBuilt: 1950,
  yearReconstructed: 1995,
  bridgeAge: 74,
  lastInspectionDate: "2020-11-01T00:00:00.000Z",
  inspectionFrequencyMonths: 24,
  nextInspectionDueDate: "2022-11-01T00:00:00.000Z",
  bridgeCondition: "Poor",
  lowestRating: 4,
  deckCondition: 5,
  superstructureCondition: 4,
  substructureCondition: 6,
  channelCondition: null,
  culvertCondition: null,
  structuralEvaluation: 5,
  priorityLevel: "Critical",
  priorityReasons: ["Poor condition with high traffic", "Poor condition with scour risk"],
  structureLengthMeters: 75.2,
  maxSpanLengthMeters: 25.5,
  roadwayWidthMeters: 12.3,
  deckWidthMeters: 14.1,
  deckAreaSqMeters: 1050,
  owner: "State highway agency",
  maintenanceResponsibility: "State highway agency",
  functionalClass: "Interstate",
  tollStatus: "Free",
  openStatus: "Open",
  scourCritical: "R",
  fractureCritical: true,
  improvementCost: 1250,
  improvementYear: 2024,
  viewCount: 3,
  lastViewedAt: "2024-01-01T00:00:00.000Z",
};

vi.mock("@/features/bridge-explorer/api/bridgeQueries", () => ({
  useBridgeDetailsQuery: () => ({
    data: detail,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

describe("BridgeDetailsDrawer", () => {
  beforeEach(() => {
    useBridgeExplorerStore.getState().setSelectedBridgeId("bridge-1");
  });

  it("renders priority reasons", () => {
    render(<BridgeDetailsDrawer />);

    expect(screen.getByText("Poor condition with high traffic")).toBeInTheDocument();
    expect(screen.getByText("Poor condition with scour risk")).toBeInTheDocument();
  });
});
