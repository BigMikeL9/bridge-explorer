import type { RiskHotspotsResponse } from "@/features/bridge-explorer/api/bridgeDtos";
import { useBridgeExplorerStore } from "@/features/bridge-explorer/state/useBridgeExplorerStore";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RiskHotspotPanel } from "./RiskHotspotPanel";

let response: RiskHotspotsResponse;

vi.mock("@/features/bridge-explorer/api/bridgeQueries", () => ({
  useRiskHotspotsQuery: () => ({
    data: response,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
}));

describe("RiskHotspotPanel", () => {
  beforeEach(() => {
    useBridgeExplorerStore.getState().hydrate({
      search: "",
      filters: {
        stateCode: null,
        countyCode: null,
        bridgeCondition: null,
        priorityLevel: null,
        minAge: null,
        maxAge: null,
        minAdt: null,
        maxAdt: null,
      },
      sort: {
        sortBy: "priorityLevel",
        sortDirection: "desc",
      },
      pagination: {
        page: 1,
        pageSize: 50,
      },
      mapBounds: null,
      selectedBridgeId: null,
      activeView: "grid",
    });
  });

  it("sets stateCode when a state hotspot is clicked", () => {
    response = {
      scope: "state",
      hotspots: [
        {
          scope: "state",
          stateCode: "42",
          stateName: "Pennsylvania",
          countyCode: null,
          countyName: null,
          totalBridgeCount: 100,
          poorConditionCount: 12,
          highCount: 20,
          criticalCount: 3,
          riskScore: 55,
        },
      ],
    };

    render(<RiskHotspotPanel />);
    fireEvent.click(screen.getByRole("button", { name: /pennsylvania/i }));

    expect(useBridgeExplorerStore.getState().filters.stateCode).toBe("42");
    expect(useBridgeExplorerStore.getState().filters.countyCode).toBeNull();
  });

  it("sets countyCode when a county hotspot is clicked", () => {
    useBridgeExplorerStore.getState().setStateCode("42");
    response = {
      scope: "county",
      hotspots: [
        {
          scope: "county",
          stateCode: "42",
          stateName: "Pennsylvania",
          countyCode: "003",
          countyName: "Allegheny",
          totalBridgeCount: 40,
          poorConditionCount: 8,
          highCount: 9,
          criticalCount: 2,
          riskScore: 32,
        },
      ],
    };

    render(<RiskHotspotPanel />);
    fireEvent.click(screen.getByRole("button", { name: /allegheny/i }));

    expect(useBridgeExplorerStore.getState().filters.stateCode).toBe("42");
    expect(useBridgeExplorerStore.getState().filters.countyCode).toBe("003");
  });
});
