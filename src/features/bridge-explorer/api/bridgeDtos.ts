import type { Bridge } from "@/domain/bridge";
import { MAP_MARKER_LIMIT } from "@/lib/queryParams";

export interface BridgeGridDto {
  id: string;
  structureNumber: string;
  stateCode: string;
  stateName: string;
  countyCode: string;
  countyName: string;
  facilityCarried: string | null;
  location: string | null;
  featureIntersected: string | null;
  averageDailyTraffic: number | null;
  bridgeAge: number | null;
  lastInspectionDate: string | null;
  bridgeCondition: Bridge["bridgeCondition"];
  lowestRating: number | null;
  priorityLevel: Bridge["priorityLevel"];
}

export interface BridgeGridResponse {
  bridges: BridgeGridDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BridgeMapMarkerDto {
  id: string;
  structureNumber: string;
  stateCode: string;
  stateName: string;
  countyCode: string;
  countyName: string;
  latitude: number;
  longitude: number;
  bridgeCondition: Bridge["bridgeCondition"];
  priorityLevel: Bridge["priorityLevel"];
  averageDailyTraffic: number | null;
}

export interface BridgeMapResponse {
  markers: BridgeMapMarkerDto[];
  totalCount: number;
  limit: number;
  wasLimited: boolean;
  requiresBounds: boolean;
}

export interface BridgeDetailDto {
  id: string;
  structureNumber: string;
  stateCode: string;
  stateName: string;
  countyCode: string;
  countyName: string;
  district: string | null;
  facilityCarried: string | null;
  location: string | null;
  featureIntersected: string | null;
  latitude: number | null;
  longitude: number | null;
  hasValidCoordinates: boolean;
  averageDailyTraffic: number | null;
  trafficYear: number | null;
  truckTrafficPercent: number | null;
  futureAverageDailyTraffic: number | null;
  yearBuilt: number | null;
  yearReconstructed: number | null;
  bridgeAge: number | null;
  lastInspectionDate: string | null;
  inspectionFrequencyMonths: number | null;
  nextInspectionDueDate: string | null;
  bridgeCondition: Bridge["bridgeCondition"];
  lowestRating: number | null;
  deckCondition: number | null;
  superstructureCondition: number | null;
  substructureCondition: number | null;
  channelCondition: number | null;
  culvertCondition: number | null;
  structuralEvaluation: number | null;
  priorityLevel: Bridge["priorityLevel"];
  priorityReasons: string[];
  structureLengthMeters: number | null;
  maxSpanLengthMeters: number | null;
  roadwayWidthMeters: number | null;
  deckWidthMeters: number | null;
  deckAreaSqMeters: number | null;
  owner: string | null;
  maintenanceResponsibility: string | null;
  functionalClass: string | null;
  tollStatus: string | null;
  openStatus: string | null;
  scourCritical: string | null;
  fractureCritical: boolean | null;
  improvementCost: number | null;
  improvementYear: number | null;
  viewCount: number;
  lastViewedAt: string | null;
}

export interface RiskHotspotDto {
  scope: "state" | "county";
  stateCode: string;
  stateName: string;
  countyCode: string | null;
  countyName: string | null;
  totalBridgeCount: number;
  criticalCount: number;
  highCount: number;
  poorConditionCount: number;
  riskScore: number;
}

export interface RiskHotspotsResponse {
  scope: "state" | "county";
  hotspots: RiskHotspotDto[];
}

function toDateString(date: Date | null): string | null {
  return date?.toISOString() ?? null;
}

export function toBridgeGridDto(bridge: Bridge): BridgeGridDto {
  return {
    id: bridge.id,
    structureNumber: bridge.structureNumber,
    stateCode: bridge.stateCode,
    stateName: bridge.stateName,
    countyCode: bridge.countyCode,
    countyName: bridge.countyName,
    facilityCarried: bridge.facilityCarried,
    location: bridge.location,
    featureIntersected: bridge.featureIntersected,
    averageDailyTraffic: bridge.averageDailyTraffic,
    bridgeAge: bridge.bridgeAge,
    lastInspectionDate: toDateString(bridge.lastInspectionDate),
    bridgeCondition: bridge.bridgeCondition,
    lowestRating: bridge.lowestRating,
    priorityLevel: bridge.priorityLevel,
  };
}

export function toBridgeGridResponse(
  bridges: Bridge[],
  totalCount: number,
  page: number,
  pageSize: number
): BridgeGridResponse {
  return {
    bridges: bridges.map(toBridgeGridDto),
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export function toBridgeMapMarkerDto(
  bridge: Bridge
): BridgeMapMarkerDto | null {
  if (bridge.latitude === null || bridge.longitude === null) {
    return null;
  }

  return {
    id: bridge.id,
    structureNumber: bridge.structureNumber,
    stateCode: bridge.stateCode,
    stateName: bridge.stateName,
    countyCode: bridge.countyCode,
    countyName: bridge.countyName,
    latitude: bridge.latitude,
    longitude: bridge.longitude,
    bridgeCondition: bridge.bridgeCondition,
    priorityLevel: bridge.priorityLevel,
    averageDailyTraffic: bridge.averageDailyTraffic,
  };
}

export function toBridgeMapResponse(
  bridges: Bridge[],
  totalCount: number,
  limit = MAP_MARKER_LIMIT
): BridgeMapResponse {
  const markers = bridges
    .map(toBridgeMapMarkerDto)
    .filter((marker): marker is BridgeMapMarkerDto => marker !== null);

  return {
    markers,
    totalCount,
    limit,
    wasLimited: totalCount > limit,
    requiresBounds: false,
  };
}

export function createBoundsRequiredMapResponse(
  limit = MAP_MARKER_LIMIT
): BridgeMapResponse {
  return {
    markers: [],
    totalCount: 0,
    limit,
    wasLimited: false,
    requiresBounds: true,
  };
}

export function toBridgeDetailDto(bridge: Bridge): BridgeDetailDto {
  return {
    id: bridge.id,
    structureNumber: bridge.structureNumber,
    stateCode: bridge.stateCode,
    stateName: bridge.stateName,
    countyCode: bridge.countyCode,
    countyName: bridge.countyName,
    district: bridge.district,
    facilityCarried: bridge.facilityCarried,
    location: bridge.location,
    featureIntersected: bridge.featureIntersected,
    latitude: bridge.latitude,
    longitude: bridge.longitude,
    hasValidCoordinates: bridge.hasValidCoordinates,
    averageDailyTraffic: bridge.averageDailyTraffic,
    trafficYear: bridge.trafficYear,
    truckTrafficPercent: bridge.truckTrafficPercent,
    futureAverageDailyTraffic: bridge.futureAverageDailyTraffic,
    yearBuilt: bridge.yearBuilt,
    yearReconstructed: bridge.yearReconstructed,
    bridgeAge: bridge.bridgeAge,
    lastInspectionDate: toDateString(bridge.lastInspectionDate),
    inspectionFrequencyMonths: bridge.inspectionFrequencyMonths,
    nextInspectionDueDate: toDateString(bridge.nextInspectionDueDate),
    bridgeCondition: bridge.bridgeCondition,
    lowestRating: bridge.lowestRating,
    deckCondition: bridge.deckCondition,
    superstructureCondition: bridge.superstructureCondition,
    substructureCondition: bridge.substructureCondition,
    channelCondition: bridge.channelCondition,
    culvertCondition: bridge.culvertCondition,
    structuralEvaluation: bridge.structuralEvaluation,
    priorityLevel: bridge.priorityLevel,
    priorityReasons: bridge.priorityReasons,
    structureLengthMeters: bridge.structureLengthMeters,
    maxSpanLengthMeters: bridge.maxSpanLengthMeters,
    roadwayWidthMeters: bridge.roadwayWidthMeters,
    deckWidthMeters: bridge.deckWidthMeters,
    deckAreaSqMeters: bridge.deckAreaSqMeters,
    owner: bridge.owner,
    maintenanceResponsibility: bridge.maintenanceResponsibility,
    functionalClass: bridge.functionalClass,
    tollStatus: bridge.tollStatus,
    openStatus: bridge.openStatus,
    scourCritical: bridge.scourCritical,
    fractureCritical: bridge.fractureCritical,
    improvementCost: bridge.improvementCost,
    improvementYear: bridge.improvementYear,
    viewCount: bridge.viewCount,
    lastViewedAt: toDateString(bridge.lastViewedAt),
  };
}

export function toRiskHotspotsResponse(
  scope: "state" | "county",
  hotspots: RiskHotspotDto[]
): RiskHotspotsResponse {
  return { scope, hotspots };
}
