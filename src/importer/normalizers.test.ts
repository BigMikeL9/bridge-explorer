import { describe, expect, it } from "vitest";
import {
  normalizeBridgeCondition,
  normalizeCoordinate,
  normalizeInspectionDate,
  normalizeRiskFlag,
  normalizeText,
} from "./normalizers";

describe("normalizers", () => {
  it("trims text, removes surrounding single quotes, and converts blanks to null", () => {
    expect(normalizeText(" 'Bridge A' ")).toBe("Bridge A");
    expect(normalizeText("   ")).toBeNull();
  });

  it("normalizes NBI DMS latitude to decimal degrees", () => {
    expect(normalizeCoordinate("40012300", "latitude")).toBeCloseTo(
      40 + 1 / 60 + 23 / 3600
    );
  });

  it("normalizes NBI DMS longitude to negative decimal degrees", () => {
    expect(normalizeCoordinate("075123456", "longitude")).toBeCloseTo(
      -(75 + 12 / 60 + 34.56 / 3600)
    );
  });

  it("normalizes MMYY inspection dates", () => {
    expect(normalizeInspectionDate("1120")?.toISOString()).toBe(
      "2020-11-01T00:00:00.000Z"
    );
    expect(normalizeInspectionDate("1220")?.toISOString()).toBe(
      "2020-12-01T00:00:00.000Z"
    );
    expect(normalizeInspectionDate("121")?.toISOString()).toBe(
      "2021-01-01T00:00:00.000Z"
    );
    expect(normalizeInspectionDate("721")?.toISOString()).toBe(
      "2021-07-01T00:00:00.000Z"
    );
  });

  it("maps bridge condition codes", () => {
    expect(normalizeBridgeCondition("G")).toBe("Good");
    expect(normalizeBridgeCondition("F")).toBe("Fair");
    expect(normalizeBridgeCondition("P")).toBe("Poor");
    expect(normalizeBridgeCondition("x")).toBe("Unknown");
  });

  it("normalizes risk flags", () => {
    expect(normalizeRiskFlag("N")).toBe(false);
    expect(normalizeRiskFlag("")).toBe(false);
    expect(normalizeRiskFlag("Y")).toBe(true);
    expect(normalizeRiskFlag("Y60")).toBe(true);
    expect(normalizeRiskFlag("R")).toBe(true);
  });
});
