import type { BridgeCondition, PriorityLevel } from "@/domain/bridge";
import {
  allowedBridgeSortFields,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  type BridgeSortField,
  type SortDirection,
} from "@/lib/queryParams";
import type {
  ActiveBridgeExplorerView,
  BridgeExplorerDataState,
  MapBounds,
} from "./useBridgeExplorerStore";

const bridgeConditions = new Set<BridgeCondition>([
  "Good",
  "Fair",
  "Poor",
  "Unknown",
]);

const priorityLevels = new Set<PriorityLevel>([
  "Critical",
  "High",
  "Medium",
  "Low",
]);

const activeViews = new Set<ActiveBridgeExplorerView>(["grid", "map"]);

export const defaultBridgeExplorerState: BridgeExplorerDataState = {
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
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  mapBounds: null,
  selectedBridgeId: null,
  activeView: "grid",
};

function getText(params: URLSearchParams, key: string): string | null {
  const value = params.get(key)?.trim();
  return value ? value : null;
}

function getNumber(params: URLSearchParams, key: string): number | null {
  const value = getText(params, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPositiveInteger(
  params: URLSearchParams,
  key: string,
  fallback: number
): number {
  const value = getNumber(params, key);
  return value !== null && value >= 1 ? Math.trunc(value) : fallback;
}

function getBridgeCondition(
  params: URLSearchParams
): BridgeCondition | null {
  const value = getText(params, "bridgeCondition");
  return value && bridgeConditions.has(value as BridgeCondition)
    ? (value as BridgeCondition)
    : null;
}

function getPriorityLevel(params: URLSearchParams): PriorityLevel | null {
  const value = getText(params, "priorityLevel");
  return value && priorityLevels.has(value as PriorityLevel)
    ? (value as PriorityLevel)
    : null;
}

function getSortBy(params: URLSearchParams): BridgeSortField {
  const value = getText(params, "sortBy");
  return value && allowedBridgeSortFields.includes(value as BridgeSortField)
    ? (value as BridgeSortField)
    : defaultBridgeExplorerState.sort.sortBy;
}

function getSortDirection(params: URLSearchParams): SortDirection {
  return getText(params, "sortDirection") === "asc" ? "asc" : "desc";
}

function getActiveView(params: URLSearchParams): ActiveBridgeExplorerView {
  const value = getText(params, "activeView");
  return value && activeViews.has(value as ActiveBridgeExplorerView)
    ? (value as ActiveBridgeExplorerView)
    : "grid";
}

function getMapBounds(params: URLSearchParams): MapBounds | null {
  const north = getNumber(params, "north");
  const south = getNumber(params, "south");
  const east = getNumber(params, "east");
  const west = getNumber(params, "west");

  if (north === null || south === null || east === null || west === null) {
    return null;
  }

  if (south > north || west > east) {
    return null;
  }

  return { north, south, east, west };
}

function setOptionalParam(
  params: URLSearchParams,
  key: string,
  value: string | number | null
) {
  if (value !== null && value !== "") {
    params.set(key, String(value));
  }
}

export function hydrateBridgeExplorerState(
  params: URLSearchParams
): BridgeExplorerDataState {
  const stateCode = getText(params, "stateCode");

  return {
    search: getText(params, "search") ?? "",
    filters: {
      stateCode,
      countyCode: stateCode ? getText(params, "countyCode") : null,
      bridgeCondition: getBridgeCondition(params),
      priorityLevel: getPriorityLevel(params),
      minAge: getNumber(params, "minAge"),
      maxAge: getNumber(params, "maxAge"),
      minAdt: getNumber(params, "minAdt"),
      maxAdt: getNumber(params, "maxAdt"),
    },
    sort: {
      sortBy: getSortBy(params),
      sortDirection: getSortDirection(params),
    },
    pagination: {
      page: getPositiveInteger(params, "page", DEFAULT_PAGE),
      pageSize: getPositiveInteger(params, "pageSize", DEFAULT_PAGE_SIZE),
    },
    mapBounds: getMapBounds(params),
    selectedBridgeId: getText(params, "selectedBridgeId"),
    activeView: getActiveView(params),
  };
}

export function serializeBridgeExplorerState(
  state: BridgeExplorerDataState
): URLSearchParams {
  const params = new URLSearchParams();

  setOptionalParam(params, "search", state.search.trim());
  setOptionalParam(params, "stateCode", state.filters.stateCode);
  if (state.filters.stateCode) {
    setOptionalParam(params, "countyCode", state.filters.countyCode);
  }
  setOptionalParam(params, "bridgeCondition", state.filters.bridgeCondition);
  setOptionalParam(params, "priorityLevel", state.filters.priorityLevel);
  setOptionalParam(params, "minAge", state.filters.minAge);
  setOptionalParam(params, "maxAge", state.filters.maxAge);
  setOptionalParam(params, "minAdt", state.filters.minAdt);
  setOptionalParam(params, "maxAdt", state.filters.maxAdt);
  setOptionalParam(params, "sortBy", state.sort.sortBy);
  setOptionalParam(params, "sortDirection", state.sort.sortDirection);
  setOptionalParam(params, "page", state.pagination.page);
  setOptionalParam(params, "pageSize", state.pagination.pageSize);
  setOptionalParam(params, "selectedBridgeId", state.selectedBridgeId);
  setOptionalParam(params, "activeView", state.activeView);

  if (state.mapBounds) {
    setOptionalParam(params, "north", state.mapBounds.north);
    setOptionalParam(params, "south", state.mapBounds.south);
    setOptionalParam(params, "east", state.mapBounds.east);
    setOptionalParam(params, "west", state.mapBounds.west);
  }

  return params;
}

export function toApiSearchParams(
  state: BridgeExplorerDataState,
  options: { includeBounds?: boolean } = {}
): URLSearchParams {
  const params = serializeBridgeExplorerState(state);

  params.delete("selectedBridgeId");
  params.delete("activeView");

  if (!options.includeBounds) {
    params.delete("north");
    params.delete("south");
    params.delete("east");
    params.delete("west");
  }

  return params;
}
