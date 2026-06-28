import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "csv-parse/sync";

type CsvRow = Record<string, string | undefined>;

export interface LookupBuildResult {
  stateLookup: Record<string, string>;
  countyLookup: Record<string, string>;
}

const stateNamesByFips: Record<string, string> = {
  "01": "Alabama",
  "02": "Alaska",
  "04": "Arizona",
  "05": "Arkansas",
  "06": "California",
  "08": "Colorado",
  "09": "Connecticut",
  "10": "Delaware",
  "11": "District of Columbia",
  "12": "Florida",
  "13": "Georgia",
  "15": "Hawaii",
  "16": "Idaho",
  "17": "Illinois",
  "18": "Indiana",
  "19": "Iowa",
  "20": "Kansas",
  "21": "Kentucky",
  "22": "Louisiana",
  "23": "Maine",
  "24": "Maryland",
  "25": "Massachusetts",
  "26": "Michigan",
  "27": "Minnesota",
  "28": "Mississippi",
  "29": "Missouri",
  "30": "Montana",
  "31": "Nebraska",
  "32": "Nevada",
  "33": "New Hampshire",
  "34": "New Jersey",
  "35": "New Mexico",
  "36": "New York",
  "37": "North Carolina",
  "38": "North Dakota",
  "39": "Ohio",
  "40": "Oklahoma",
  "41": "Oregon",
  "42": "Pennsylvania",
  "44": "Rhode Island",
  "45": "South Carolina",
  "46": "South Dakota",
  "47": "Tennessee",
  "48": "Texas",
  "49": "Utah",
  "50": "Vermont",
  "51": "Virginia",
  "53": "Washington",
  "54": "West Virginia",
  "55": "Wisconsin",
  "56": "Wyoming",
  "72": "Puerto Rico",
};

const stateCodeColumns = ["STATEFP", "STATE_CODE", "STATE_CODE_001", "STATE"];
const countyCodeColumns = ["COUNTYFP", "COUNTY_CODE", "COUNTY_CODE_003", "COUNTY"];
const countyNameColumns = ["COUNTYNAME", "COUNTY_NAME", "NAMELSAD", "NAME"];
const stateNameColumns = ["STATE_NAME", "STATENAME"];

export function padStateCode(value: string | number): string {
  return String(value).trim().padStart(2, "0");
}

export function padCountyCode(value: string | number): string {
  return String(value).trim().padStart(3, "0");
}

function normalizeName(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getFirstValue(row: CsvRow, columns: string[]): string | null {
  for (const column of columns) {
    const directValue = normalizeName(row[column]);
    if (directValue) {
      return directValue;
    }

    const matchingKey = Object.keys(row).find(
      (key) => key.toUpperCase() === column.toUpperCase()
    );
    const matchingValue = matchingKey ? normalizeName(row[matchingKey]) : null;
    if (matchingValue) {
      return matchingValue;
    }
  }

  return null;
}

export function buildLookupKey(stateCode: string, countyCode: string): string {
  return `${padStateCode(stateCode)}-${padCountyCode(countyCode)}`;
}

export function buildLookupsFromRows(rows: CsvRow[]): LookupBuildResult {
  const stateLookup: Record<string, string> = {};
  const countyLookup: Record<string, string> = {};

  for (const row of rows) {
    const rawStateCode = getFirstValue(row, stateCodeColumns);
    const rawCountyCode = getFirstValue(row, countyCodeColumns);
    const countyName = getFirstValue(row, countyNameColumns);

    if (!rawStateCode || !rawCountyCode || !countyName) {
      continue;
    }

    const stateCode = padStateCode(rawStateCode);
    const countyCode = padCountyCode(rawCountyCode);
    const stateName =
      getFirstValue(row, stateNameColumns) ?? stateNamesByFips[stateCode];

    if (stateName) {
      stateLookup[stateCode] = stateName;
    }

    countyLookup[`${stateCode}-${countyCode}`] = countyName;
  }

  return {
    stateLookup: sortLookup(stateLookup),
    countyLookup: sortLookup(countyLookup),
  };
}

export function parseCountyReferenceCsv(input: string): LookupBuildResult {
  const delimiter = detectDelimiter(input);
  const rows = parse(input, {
    bom: true,
    columns: true,
    delimiter,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  return buildLookupsFromRows(rows);
}

function detectDelimiter(input: string): string {
  const header = input.split(/\r?\n/, 1)[0] ?? "";
  const candidates = [",", "|", "\t"];

  return candidates
    .map((delimiter) => ({
      delimiter,
      count: header.split(delimiter).length,
    }))
    .sort((left, right) => right.count - left.count)[0]?.delimiter ?? ",";
}

function sortLookup(lookup: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(lookup).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey)
    )
  );
}

export function renderLookupFile(
  exportName: "stateLookup" | "countyLookup",
  lookup: Record<string, string>
): string {
  return `export const ${exportName}: Record<string, string> = ${JSON.stringify(
    lookup,
    null,
    2
  )};\n`;
}

async function writeLookupFiles(inputPath: string) {
  const absoluteInputPath = resolve(inputPath);
  const input = await readFile(absoluteInputPath, "utf8");
  const { stateLookup, countyLookup } = parseCountyReferenceCsv(input);
  const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

  await Promise.all([
    writeFile(
      resolve(rootDir, "src/importer/stateLookup.ts"),
      renderLookupFile("stateLookup", stateLookup)
    ),
    writeFile(
      resolve(rootDir, "src/importer/countyLookup.ts"),
      renderLookupFile("countyLookup", countyLookup)
    ),
  ]);

  return {
    countyCount: Object.keys(countyLookup).length,
    stateCount: Object.keys(stateLookup).length,
  };
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.log("Usage: npm run generate:lookups -- <path-to-census-county-csv>");
    return;
  }

  const result = await writeLookupFiles(inputPath);
  console.log(
    `Generated ${result.stateCount} states and ${result.countyCount} counties.`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
