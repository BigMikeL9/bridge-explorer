import { describe, expect, it } from "vitest";
import { getHotspotScope } from "./bridgeRepository";

describe("getHotspotScope", () => {
  it("returns county scope when stateCode is selected", () => {
    expect(getHotspotScope({ stateCode: "42" })).toBe("county");
  });

  it("returns state scope when no stateCode is selected", () => {
    expect(getHotspotScope({ stateCode: null })).toBe("state");
  });
});
