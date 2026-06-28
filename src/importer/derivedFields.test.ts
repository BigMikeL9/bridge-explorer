import { describe, expect, it } from "vitest";
import {
  deriveBridgeAge,
  deriveLowestRating,
  deriveNextInspectionDueDate,
  derivePriority,
} from "./derivedFields";

describe("derivedFields", () => {
  it("uses direct lowest rating when present", () => {
    expect(deriveLowestRating(4, [2, 3, 5])).toBe(4);
  });

  it("falls back to the lowest available structural rating", () => {
    expect(deriveLowestRating(null, [null, 6, 3, 5])).toBe(3);
  });

  it("derives bridge age", () => {
    expect(deriveBridgeAge(1974, 2024)).toBe(50);
  });

  it("derives the next inspection due date", () => {
    expect(
      deriveNextInspectionDueDate(
        new Date(Date.UTC(2020, 10, 1)),
        24
      )?.toISOString()
    ).toBe("2022-11-01T00:00:00.000Z");
  });

  it("assigns Critical priority for major risks", () => {
    expect(
      derivePriority({
        averageDailyTraffic: 1000,
        bridgeAge: 10,
        bridgeCondition: "Fair",
        fractureCritical: false,
        lowestRating: 3,
        scourCritical: false,
      }).priorityLevel
    ).toBe("Critical");
  });

  it("assigns High priority for poor condition or high traffic", () => {
    expect(
      derivePriority({
        averageDailyTraffic: 500,
        bridgeAge: 20,
        bridgeCondition: "Poor",
        fractureCritical: false,
        lowestRating: 6,
        scourCritical: false,
      }).priorityLevel
    ).toBe("High");
  });

  it("assigns Medium priority for fair condition or moderate traffic", () => {
    expect(
      derivePriority({
        averageDailyTraffic: 10000,
        bridgeAge: 5,
        bridgeCondition: "Good",
        fractureCritical: false,
        lowestRating: 7,
        scourCritical: false,
      }).priorityLevel
    ).toBe("Medium");
  });

  it("assigns Low priority when no major risk indicators exist", () => {
    expect(
      derivePriority({
        averageDailyTraffic: 100,
        bridgeAge: 10,
        bridgeCondition: "Good",
        fractureCritical: false,
        lowestRating: 8,
        scourCritical: false,
      }).priorityLevel
    ).toBe("Low");
  });
});
