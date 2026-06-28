import type { BridgeCondition, PriorityLevel } from "@/domain/bridge";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;
export const MAP_MARKER_LIMIT = 1000;

export const allowedBridgeSortFields = [
  "structureNumber",
  "stateCode",
  "countyName",
  "bridgeCondition",
  "priorityLevel",
  "averageDailyTraffic",
  "bridgeAge",
  "lastInspectionDate",
  "lowestRating",
  "viewCount",
  "lastViewedAt",
] as const;

export type BridgeSortField = (typeof allowedBridgeSortFields)[number];
export type SortDirection = "asc" | "desc";

export interface BoundsQuery {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BridgeQueryParams {
  search: string | null;
  stateCode: string | null;
  countyCode: string | null;
  bridgeCondition: BridgeCondition | null;
  priorityLevel: PriorityLevel | null;
  minAge: number | null;
  maxAge: number | null;
  minAdt: number | null;
  maxAdt: number | null;
  sortBy: BridgeSortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
  bounds: BoundsQuery | null;
}

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

function getText(searchParams: URLSearchParams, key: string): string | null {
  const value = searchParams.get(key)?.trim();
  return value ? value : null;
}

function getNumber(searchParams: URLSearchParams, key: string): number | null {
  const value = getText(searchParams, key);
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPositiveInteger(
  searchParams: URLSearchParams,
  key: string,
  fallback: number
): number {
  const parsed = getNumber(searchParams, key);
  if (parsed === null || parsed < 1) {
    return fallback;
  }

  return Math.trunc(parsed);
}

function getBridgeCondition(
  searchParams: URLSearchParams
): BridgeCondition | null {
  const value = getText(searchParams, "bridgeCondition");
  return value && bridgeConditions.has(value as BridgeCondition)
    ? (value as BridgeCondition)
    : null;
}

function getPriorityLevel(searchParams: URLSearchParams): PriorityLevel | null {
  const value = getText(searchParams, "priorityLevel");
  return value && priorityLevels.has(value as PriorityLevel)
    ? (value as PriorityLevel)
    : null;
}

function getSortBy(searchParams: URLSearchParams): BridgeSortField {
  const value = getText(searchParams, "sortBy");
  return value && allowedBridgeSortFields.includes(value as BridgeSortField)
    ? (value as BridgeSortField)
    : "priorityLevel";
}

function getSortDirection(searchParams: URLSearchParams): SortDirection {
  return getText(searchParams, "sortDirection") === "asc" ? "asc" : "desc";
}

function getBounds(searchParams: URLSearchParams): BoundsQuery | null {
  const north = getNumber(searchParams, "north");
  const south = getNumber(searchParams, "south");
  const east = getNumber(searchParams, "east");
  const west = getNumber(searchParams, "west");

  if (north === null || south === null || east === null || west === null) {
    return null;
  }

  if (south > north || west > east) {
    return null;
  }

  return { north, south, east, west };
}

export function parseBridgeQueryParams(
  searchParams: URLSearchParams
): BridgeQueryParams {
  const pageSize = Math.min(
    getPositiveInteger(searchParams, "pageSize", DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE
  );

  return {
    search: getText(searchParams, "search")?.toLowerCase() ?? null,
    stateCode: getText(searchParams, "stateCode"),
    countyCode: getText(searchParams, "countyCode"),
    bridgeCondition: getBridgeCondition(searchParams),
    priorityLevel: getPriorityLevel(searchParams),
    minAge: getNumber(searchParams, "minAge"),
    maxAge: getNumber(searchParams, "maxAge"),
    minAdt: getNumber(searchParams, "minAdt"),
    maxAdt: getNumber(searchParams, "maxAdt"),
    sortBy: getSortBy(searchParams),
    sortDirection: getSortDirection(searchParams),
    page: getPositiveInteger(searchParams, "page", DEFAULT_PAGE),
    pageSize,
    bounds: getBounds(searchParams),
  };
}
