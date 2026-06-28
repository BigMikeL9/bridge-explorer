import type { Bridge } from "@/domain/bridge";
import { describe, expect, it } from "vitest";
import {
  createBoundsRequiredMapResponse,
  toBridgeDetailDto,
  toBridgeGridDto,
  toBridgeMapResponse,
} from "./bridgeDtos";

const bridge: Bridge = {
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
  lastInspectionDate: new Date(Date.UTC(2020, 10, 1)),
  inspectionFrequencyMonths: 24,
  nextInspectionDueDate: new Date(Date.UTC(2022, 10, 1)),
  bridgeCondition: "Poor",
  lowestRating: 4,
  deckCondition: 5,
  superstructureCondition: 4,
  substructureCondition: 6,
  channelCondition: null,
  culvertCondition: null,
  structuralEvaluation: 5,
  priorityLevel: "High",
  priorityReasons: ["Poor condition"],
  structureLengthMeters: 75.2,
  maxSpanLengthMeters: 25.5,
  roadwayWidthMeters: 12.3,
  deckWidthMeters: 14.1,
  deckAreaSqMeters: null,
  owner: "01",
  maintenanceResponsibility: "01",
  functionalClass: "11",
  tollStatus: "3",
  openStatus: "A",
  scourCritical: "N",
  fractureCritical: false,
  improvementCost: 1250,
  improvementYear: 2024,
  viewCount: 2,
  lastViewedAt: new Date(Date.UTC(2024, 0, 1)),
  searchText: "0001 pennsylvania allegheny",
};

describe("bridge DTO mapping", () => {
  it("maps a flat grid DTO without exposing the full database row", () => {
    const dto = toBridgeGridDto(bridge);

    expect(dto).toEqual({
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
      priorityLevel: "High",
    });
  });

  it("maps a detail DTO with serialized dates", () => {
    const dto = toBridgeDetailDto(bridge);

    expect(dto.countyName).toBe("Allegheny");
    expect(dto.lastInspectionDate).toBe("2020-11-01T00:00:00.000Z");
    expect(dto.lastViewedAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("creates a map response that requires bounds", () => {
    expect(createBoundsRequiredMapResponse()).toMatchObject({
      markers: [],
      totalCount: 0,
      wasLimited: false,
      requiresBounds: true,
    });
  });

  it("maps bounded marker responses and reports limit state", () => {
    expect(toBridgeMapResponse([bridge], 1200, 1000)).toMatchObject({
      totalCount: 1200,
      wasLimited: true,
      requiresBounds: false,
      markers: [
        {
          id: "bridge-1",
          stateCode: "42",
          countyCode: "003",
          latitude: 40.45,
          longitude: -79.99,
        },
      ],
    });
  });
});
