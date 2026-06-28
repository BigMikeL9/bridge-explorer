import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  parseBridgeQueryParams,
} from "./queryParams";

describe("parseBridgeQueryParams", () => {
  it("parses shared filters", () => {
    const params = parseBridgeQueryParams(
      new URLSearchParams(
        "search= River &stateCode=42&countyCode=003&bridgeCondition=Poor&priorityLevel=Critical&minAge=50&maxAge=90&minAdt=10000&maxAdt=30000"
      )
    );

    expect(params).toMatchObject({
      search: "river",
      stateCode: "42",
      countyCode: "003",
      bridgeCondition: "Poor",
      priorityLevel: "Critical",
      minAge: 50,
      maxAge: 90,
      minAdt: 10000,
      maxAdt: 30000,
    });
  });

  it("falls back when sortBy is invalid", () => {
    const params = parseBridgeQueryParams(
      new URLSearchParams("sortBy=DROP_TABLE&sortDirection=asc")
    );

    expect(params.sortBy).toBe("priorityLevel");
    expect(params.sortDirection).toBe("asc");
  });

  it("uses pagination defaults and caps page size", () => {
    const defaults = parseBridgeQueryParams(new URLSearchParams());
    const capped = parseBridgeQueryParams(new URLSearchParams("pageSize=500"));

    expect(defaults.page).toBe(DEFAULT_PAGE);
    expect(defaults.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(capped.pageSize).toBe(MAX_PAGE_SIZE);
  });

  it("parses valid map bounds", () => {
    const params = parseBridgeQueryParams(
      new URLSearchParams("north=42&south=40&east=-74&west=-80")
    );

    expect(params.bounds).toEqual({
      north: 42,
      south: 40,
      east: -74,
      west: -80,
    });
  });

  it("rejects incomplete bounds", () => {
    const params = parseBridgeQueryParams(new URLSearchParams("north=42"));

    expect(params.bounds).toBeNull();
  });
});
