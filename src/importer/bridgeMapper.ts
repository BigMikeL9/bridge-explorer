import type { Bridge } from "@/domain/bridge";
import {
  deriveBridgeAge,
  deriveCountyName,
  deriveLowestRating,
  deriveNextInspectionDueDate,
  derivePriority,
  deriveSearchText,
  deriveStateName,
} from "./derivedFields";
import {
  hasValidCoordinates,
  normalizeBridgeCondition,
  normalizeCoordinate,
  normalizeInspectionDate,
  normalizeInteger,
  normalizeNumber,
  normalizeRiskFlag,
  normalizeText,
} from "./normalizers";

export type RawBridgeRow = Record<string, unknown>;

export type BridgeImportRecord = Omit<Bridge, "id">;

export function mapRawBridgeRow(row: RawBridgeRow): BridgeImportRecord | null {
  const structureNumber = normalizeText(row.STRUCTURE_NUMBER_008);
  const stateCode = normalizeText(row.STATE_CODE_001);
  const countyCode = normalizeText(row.COUNTY_CODE_003);

  if (!structureNumber || !stateCode || !countyCode) {
    return null;
  }

  const stateName = deriveStateName(stateCode);
  const countyName = deriveCountyName(stateCode, countyCode);
  const latitude = normalizeCoordinate(row.LAT_016, "latitude");
  const longitude = normalizeCoordinate(row.LONG_017, "longitude");
  const averageDailyTraffic = normalizeInteger(row.ADT_029);
  const yearBuilt = normalizeInteger(row.YEAR_BUILT_027);
  const lastInspectionDate = normalizeInspectionDate(row.DATE_OF_INSPECT_090);
  const inspectionFrequencyMonths = normalizeInteger(row.INSPECT_FREQ_MONTHS_091);
  const bridgeCondition = normalizeBridgeCondition(row.BRIDGE_CONDITION);
  const deckCondition = normalizeInteger(row.DECK_COND_058);
  const superstructureCondition = normalizeInteger(row.SUPERSTRUCTURE_COND_059);
  const substructureCondition = normalizeInteger(row.SUBSTRUCTURE_COND_060);
  const channelCondition = normalizeInteger(row.CHANNEL_COND_061);
  const culvertCondition = normalizeInteger(row.CULVERT_COND_062);
  const structuralEvaluation = normalizeInteger(row.STRUCTURAL_EVAL_067);
  const lowestRating = deriveLowestRating(normalizeInteger(row.LOWEST_RATING), [
    deckCondition,
    superstructureCondition,
    substructureCondition,
    channelCondition,
    culvertCondition,
    structuralEvaluation,
  ]);
  const bridgeAge = deriveBridgeAge(yearBuilt);
  const nextInspectionDueDate = deriveNextInspectionDueDate(
    lastInspectionDate,
    inspectionFrequencyMonths
  );
  const scourCritical = normalizeText(row.SCOUR_CRITICAL_113);
  const fractureCritical = normalizeRiskFlag(row.FRACTURE_CRITICAL_092A);
  const scourRisk = normalizeRiskFlag(scourCritical);
  const priority = derivePriority({
    averageDailyTraffic,
    bridgeAge,
    bridgeCondition,
    fractureCritical,
    lowestRating,
    scourCritical: scourRisk,
  });
  const facilityCarried = normalizeText(row.FACILITY_CARRIED_007);
  const location = normalizeText(row.LOCATION_009);
  const featureIntersected = normalizeText(row.FEATURES_DESC_006A);
  const district = normalizeText(row.HIGHWAY_DISTRICT_002);

  return {
    structureNumber,
    stateCode,
    stateName,
    countyCode,
    countyName,
    district,
    facilityCarried,
    location,
    featureIntersected,
    latitude,
    longitude,
    hasValidCoordinates: hasValidCoordinates(latitude, longitude),
    averageDailyTraffic,
    trafficYear: normalizeInteger(row.YEAR_ADT_030),
    truckTrafficPercent: normalizeNumber(row.TRUCK_ADT_PCT_109),
    futureAverageDailyTraffic: normalizeInteger(row.FUTURE_ADT_114),
    yearBuilt,
    yearReconstructed: normalizeInteger(row.YEAR_RECONSTRUCTED_106),
    bridgeAge,
    lastInspectionDate,
    inspectionFrequencyMonths,
    nextInspectionDueDate,
    bridgeCondition,
    lowestRating,
    deckCondition,
    superstructureCondition,
    substructureCondition,
    channelCondition,
    culvertCondition,
    structuralEvaluation,
    priorityLevel: priority.priorityLevel,
    priorityReasons: priority.priorityReasons,
    structureLengthMeters: normalizeNumber(row.STRUCTURE_LEN_MT_049),
    maxSpanLengthMeters: normalizeNumber(row.MAX_SPAN_LEN_MT_048),
    roadwayWidthMeters: normalizeNumber(row.ROADWAY_WIDTH_MT_051),
    deckWidthMeters: normalizeNumber(row.DECK_WIDTH_MT_052),
    deckAreaSqMeters: normalizeNumber(row.DECK_AREA),
    owner: normalizeText(row.OWNER_022),
    maintenanceResponsibility: normalizeText(row.MAINTENANCE_021),
    functionalClass: normalizeText(row.FUNCTIONAL_CLASS_026),
    tollStatus: normalizeText(row.TOLL_020),
    openStatus: normalizeText(row.OPEN_CLOSED_POSTED_041),
    scourCritical,
    fractureCritical,
    improvementCost: normalizeNumber(row.IMP_COST_096),
    improvementYear: normalizeInteger(row.YEAR_OF_IMP_097),
    viewCount: 0,
    lastViewedAt: null,
    searchText: deriveSearchText([
      structureNumber,
      stateCode,
      stateName,
      countyCode,
      countyName,
      district,
      facilityCarried,
      location,
      featureIntersected,
    ]),
  };
}
