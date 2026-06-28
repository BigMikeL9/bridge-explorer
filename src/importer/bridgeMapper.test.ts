import { describe, expect, it } from "vitest";
import { mapRawBridgeRow } from "./bridgeMapper";

describe("mapRawBridgeRow", () => {
  it("maps a raw FHWA row to a clean flat Bridge import record", () => {
    const bridge = mapRawBridgeRow({
      STATE_CODE_001: "42",
      HIGHWAY_DISTRICT_002: "11",
      COUNTY_CODE_003: "003",
      FEATURES_DESC_006A: "ALLEGHENY RIVER",
      FACILITY_CARRIED_007: "I-279",
      STRUCTURE_NUMBER_008: "000000000000001",
      LOCATION_009: "PITTSBURGH",
      LAT_016: "40012300",
      LONG_017: "080003000",
      TOLL_020: "3",
      MAINTENANCE_021: "01",
      OWNER_022: "01",
      FUNCTIONAL_CLASS_026: "11",
      YEAR_BUILT_027: "1950",
      ADT_029: "30000",
      YEAR_ADT_030: "2022",
      OPEN_CLOSED_POSTED_041: "A",
      MAX_SPAN_LEN_MT_048: "25.5",
      STRUCTURE_LEN_MT_049: "75.2",
      ROADWAY_WIDTH_MT_051: "12.3",
      DECK_WIDTH_MT_052: "14.1",
      DECK_COND_058: "5",
      SUPERSTRUCTURE_COND_059: "4",
      SUBSTRUCTURE_COND_060: "6",
      CHANNEL_COND_061: "N",
      CULVERT_COND_062: "N",
      STRUCTURAL_EVAL_067: "5",
      DATE_OF_INSPECT_090: "1120",
      INSPECT_FREQ_MONTHS_091: "24",
      FRACTURE_CRITICAL_092A: "Y",
      IMP_COST_096: "1250",
      YEAR_OF_IMP_097: "2024",
      YEAR_RECONSTRUCTED_106: "1995",
      TRUCK_ADT_PCT_109: "12",
      SCOUR_CRITICAL_113: "R",
      FUTURE_ADT_114: "42000",
      BRIDGE_CONDITION: "P",
    });

    expect(bridge).toMatchObject({
      structureNumber: "000000000000001",
      stateCode: "42",
      stateName: "Pennsylvania",
      countyCode: "003",
      countyName: "Allegheny County",
      bridgeCondition: "Poor",
      lowestRating: 4,
      priorityLevel: "Critical",
      hasValidCoordinates: true,
      averageDailyTraffic: 30000,
      fractureCritical: true,
      scourCritical: "R",
      viewCount: 0,
      lastViewedAt: null,
    });
    expect(bridge?.latitude).toBeCloseTo(40 + 1 / 60 + 23 / 3600);
    expect(bridge?.longitude).toBeCloseTo(-(80 + 0 / 60 + 30 / 3600));
    expect(bridge?.lastInspectionDate?.toISOString()).toBe(
      "2020-11-01T00:00:00.000Z"
    );
    expect(bridge?.nextInspectionDueDate?.toISOString()).toBe(
      "2022-11-01T00:00:00.000Z"
    );
    expect(bridge?.searchText).toContain("pennsylvania");
  });

  it("returns null when required identity fields are missing", () => {
    expect(mapRawBridgeRow({ STATE_CODE_001: "42" })).toBeNull();
  });
});
