import type { BridgeCondition, PriorityLevel } from "@/domain/bridge";
import { countyLookup } from "./countyLookup";
import { stateLookup } from "./stateLookup";

export interface PriorityInput {
  averageDailyTraffic: number | null;
  bridgeAge: number | null;
  bridgeCondition: BridgeCondition;
  fractureCritical: boolean | null;
  lowestRating: number | null;
  scourCritical: boolean;
}

export interface PriorityResult {
  priorityLevel: PriorityLevel;
  priorityReasons: string[];
}

export function deriveStateName(stateCode: string | null): string {
  return stateCode ? (stateLookup[stateCode] ?? "Unknown State") : "Unknown State";
}

export function deriveCountyName(
  stateCode: string | null,
  countyCode: string | null
): string {
  return stateCode && countyCode
    ? (countyLookup[`${stateCode}-${countyCode}`] ?? "Unknown County")
    : "Unknown County";
}

export function deriveBridgeAge(
  yearBuilt: number | null,
  asOfYear = new Date().getFullYear()
): number | null {
  if (!yearBuilt || yearBuilt <= 0 || yearBuilt > asOfYear) {
    return null;
  }

  return asOfYear - yearBuilt;
}

export function deriveNextInspectionDueDate(
  lastInspectionDate: Date | null,
  inspectionFrequencyMonths: number | null
): Date | null {
  if (!lastInspectionDate || !inspectionFrequencyMonths) {
    return null;
  }

  const nextDate = new Date(lastInspectionDate);
  nextDate.setUTCMonth(nextDate.getUTCMonth() + inspectionFrequencyMonths);
  return nextDate;
}

export function deriveLowestRating(
  directLowestRating: number | null,
  structuralRatings: Array<number | null>
): number | null {
  if (directLowestRating !== null) {
    return directLowestRating;
  }

  const availableRatings = structuralRatings.filter(
    (rating): rating is number => rating !== null
  );

  return availableRatings.length > 0 ? Math.min(...availableRatings) : null;
}

export function derivePriority(input: PriorityInput): PriorityResult {
  const reasons: string[] = [];
  const hasHighTraffic =
    input.averageDailyTraffic !== null && input.averageDailyTraffic >= 25000;
  const hasMediumTraffic =
    input.averageDailyTraffic !== null && input.averageDailyTraffic >= 10000;
  const isPoor = input.bridgeCondition === "Poor";
  const isFair = input.bridgeCondition === "Fair";
  const hasScourRisk = input.scourCritical;
  const hasFractureRisk = input.fractureCritical === true;

  if (input.lowestRating !== null && input.lowestRating <= 3) {
    reasons.push("Lowest rating is 3 or below");
  }
  if (isPoor && hasHighTraffic) {
    reasons.push("Poor condition with high traffic");
  }
  if (isPoor && hasScourRisk) {
    reasons.push("Poor condition with scour risk");
  }
  if (isPoor && hasFractureRisk) {
    reasons.push("Poor condition with fracture-critical risk");
  }

  if (reasons.length > 0) {
    return { priorityLevel: "Critical", priorityReasons: reasons };
  }

  if (isPoor) {
    reasons.push("Poor condition");
  }
  if (input.lowestRating === 4) {
    reasons.push("Lowest rating is 4");
  }
  if (input.bridgeAge !== null && input.bridgeAge >= 70) {
    reasons.push("Bridge age is 70 years or older");
  }
  if (hasHighTraffic) {
    reasons.push("Average daily traffic is 25,000 or higher");
  }

  if (reasons.length > 0) {
    return { priorityLevel: "High", priorityReasons: reasons };
  }

  if (isFair) {
    reasons.push("Fair condition");
  }
  if (input.lowestRating === 5) {
    reasons.push("Lowest rating is 5");
  }
  if (input.bridgeAge !== null && input.bridgeAge >= 50) {
    reasons.push("Bridge age is 50 years or older");
  }
  if (hasMediumTraffic) {
    reasons.push("Average daily traffic is 10,000 or higher");
  }

  if (reasons.length > 0) {
    return { priorityLevel: "Medium", priorityReasons: reasons };
  }

  return { priorityLevel: "Low", priorityReasons: [] };
}

export function deriveSearchText(parts: Array<string | number | null>): string {
  return parts
    .filter((part): part is string | number => part !== null && part !== "")
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
