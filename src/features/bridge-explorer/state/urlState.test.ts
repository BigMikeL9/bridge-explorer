import { describe, expect, it, beforeEach } from "vitest";
import { useBridgeExplorerStore } from "./useBridgeExplorerStore";
import {
  defaultBridgeExplorerState,
  hydrateBridgeExplorerState,
  serializeBridgeExplorerState,
  toApiSearchParams,
} from "./urlState";

function resetStore() {
  useBridgeExplorerStore.getState().hydrate(hydrateBridgeExplorerState(new URLSearchParams()));
}

describe("urlState", () => {
  beforeEach(() => {
    resetStore();
  });

  it("serializes relevant state to URL params", () => {
    const params = serializeBridgeExplorerState({
      ...defaultBridgeExplorerState,
      search: "river",
      filters: {
        ...defaultBridgeExplorerState.filters,
        stateCode: "42",
        countyCode: "003",
        bridgeCondition: "Poor",
        minAdt: 10000,
      },
      sort: {
        sortBy: "averageDailyTraffic",
        sortDirection: "desc",
      },
      pagination: {
        page: 2,
        pageSize: 25,
      },
      selectedBridgeId: "bridge-1",
      activeView: "map",
    });

    expect(params.get("search")).toBe("river");
    expect(params.get("stateCode")).toBe("42");
    expect(params.get("countyCode")).toBe("003");
    expect(params.get("bridgeCondition")).toBe("Poor");
    expect(params.get("minAdt")).toBe("10000");
    expect(params.get("sortBy")).toBe("averageDailyTraffic");
    expect(params.get("page")).toBe("2");
    expect(params.get("selectedBridgeId")).toBe("bridge-1");
    expect(params.get("activeView")).toBe("map");
  });

  it("hydrates initial state from URL params", () => {
    const state = hydrateBridgeExplorerState(
      new URLSearchParams(
        "search=deck&stateCode=42&countyCode=003&priorityLevel=High&page=3&pageSize=75&activeView=map&selectedBridgeId=abc"
      )
    );

    expect(state.search).toBe("deck");
    expect(state.filters.stateCode).toBe("42");
    expect(state.filters.countyCode).toBe("003");
    expect(state.filters.priorityLevel).toBe("High");
    expect(state.pagination.page).toBe(3);
    expect(state.pagination.pageSize).toBe(75);
    expect(state.activeView).toBe("map");
    expect(state.selectedBridgeId).toBe("abc");
  });

  it("does not hydrate countyCode without a stateCode", () => {
    const state = hydrateBridgeExplorerState(new URLSearchParams("countyCode=003"));

    expect(state.filters.stateCode).toBeNull();
    expect(state.filters.countyCode).toBeNull();
  });

  it("clears countyCode when stateCode changes", () => {
    const store = useBridgeExplorerStore.getState();

    store.hydrate(
      hydrateBridgeExplorerState(new URLSearchParams("stateCode=42&countyCode=003"))
    );
    useBridgeExplorerStore.getState().setStateCode("36");

    expect(useBridgeExplorerStore.getState().filters.stateCode).toBe("36");
    expect(useBridgeExplorerStore.getState().filters.countyCode).toBeNull();
  });

  it("resets page when search or filters change", () => {
    const store = useBridgeExplorerStore.getState();

    store.hydrate(hydrateBridgeExplorerState(new URLSearchParams("page=4")));
    useBridgeExplorerStore.getState().setSearch("river");
    expect(useBridgeExplorerStore.getState().pagination.page).toBe(1);

    useBridgeExplorerStore.getState().setPage(5);
    useBridgeExplorerStore.getState().setFilter("priorityLevel", "Critical");
    expect(useBridgeExplorerStore.getState().pagination.page).toBe(1);
  });

  it("includes map bounds only when present and requested for API params", () => {
    const withoutBounds = toApiSearchParams(defaultBridgeExplorerState, {
      includeBounds: true,
    });
    const withBounds = toApiSearchParams(
      {
        ...defaultBridgeExplorerState,
        mapBounds: {
          north: 42,
          south: 40,
          east: -74,
          west: -80,
        },
      },
      { includeBounds: true }
    );
    const gridParams = toApiSearchParams(
      {
        ...defaultBridgeExplorerState,
        mapBounds: {
          north: 42,
          south: 40,
          east: -74,
          west: -80,
        },
      },
      { includeBounds: false }
    );

    expect(withoutBounds.has("north")).toBe(false);
    expect(withBounds.get("north")).toBe("42");
    expect(withBounds.get("west")).toBe("-80");
    expect(gridParams.has("north")).toBe(false);
  });
});
