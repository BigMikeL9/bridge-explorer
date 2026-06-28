import type { BridgeGridResponse } from "@/features/bridge-explorer/api/bridgeDtos";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BridgeGrid } from "./BridgeGrid";

const gridResponse: BridgeGridResponse = {
  bridges: [
    {
      id: "bridge-1",
      structureNumber: "0001",
      stateCode: "42",
      stateName: "Pennsylvania",
      countyCode: "003",
      countyName: "Allegheny",
      facilityCarried: "I-279",
      location: "Pittsburgh",
      featureIntersected: "Allegheny River",
      averageDailyTraffic: 30000,
      bridgeAge: 74,
      lastInspectionDate: "2020-11-01T00:00:00.000Z",
      bridgeCondition: "Poor",
      lowestRating: 4,
      priorityLevel: "Critical",
    },
  ],
  page: 1,
  pageSize: 50,
  totalCount: 1,
  totalPages: 1,
};

vi.mock("@/features/bridge-explorer/api/bridgeQueries", () => ({
  useBridgeGridQuery: () => ({
    data: gridResponse,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

describe("BridgeGrid", () => {
  beforeEach(() => {
    useBridgeExplorerStore.getState().setSelectedBridgeId(null);
  });

  it("selects a bridge when a row is clicked", () => {
    render(<BridgeGrid />);

    fireEvent.click(screen.getByText("0001").closest("tr") as HTMLTableRowElement);

    expect(useBridgeExplorerStore.getState().selectedBridgeId).toBe("bridge-1");
  });

  it("selects a bridge when Enter is pressed on a focused row", () => {
    render(<BridgeGrid />);

    const row = screen.getByText("0001").closest("tr") as HTMLTableRowElement;
    fireEvent.keyDown(row, { key: "Enter" });

    expect(useBridgeExplorerStore.getState().selectedBridgeId).toBe("bridge-1");
  });
});
