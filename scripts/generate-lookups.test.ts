import { describe, expect, it } from "vitest";
import {
  buildLookupKey,
  padCountyCode,
  padStateCode,
  parseCountyReferenceCsv,
} from "./generate-lookups";

describe("generate-lookups", () => {
  it("zero-pads state codes", () => {
    expect(padStateCode("1")).toBe("01");
    expect(padStateCode("42")).toBe("42");
  });

  it("zero-pads county codes", () => {
    expect(padCountyCode("3")).toBe("003");
    expect(padCountyCode("37")).toBe("037");
  });

  it("builds composite state-county lookup keys", () => {
    expect(buildLookupKey("42", "3")).toBe("42-003");
    expect(buildLookupKey("6", "37")).toBe("06-037");
  });

  it("parses expected state and county lookups from Census-style CSV", () => {
    const lookups = parseCountyReferenceCsv(`STATEFP,COUNTYFP,COUNTYNAME
42,003,Allegheny County
06,037,Los Angeles County
`);

    expect(lookups.stateLookup["42"]).toBe("Pennsylvania");
    expect(lookups.countyLookup["42-003"]).toBe("Allegheny County");
    expect(lookups.countyLookup["06-037"]).toBe("Los Angeles County");
  });

  it("parses pipe-delimited Census text files", () => {
    const lookups = parseCountyReferenceCsv(`STATE|STATEFP|COUNTYFP|COUNTYNAME
PA|42|003|Allegheny County
`);

    expect(lookups.stateLookup["42"]).toBe("Pennsylvania");
    expect(lookups.countyLookup["42-003"]).toBe("Allegheny County");
  });
});
