import type { Bridge } from "@/domain/bridge";
import { db } from "@/lib/db";
import type { BridgeQueryParams, BoundsQuery } from "@/lib/queryParams";
import { MAP_MARKER_LIMIT } from "@/lib/queryParams";
import { Prisma } from "@prisma/client";

export interface BridgeListResult {
  bridges: Bridge[];
  totalCount: number;
}

export interface BridgeMapResult {
  bridges: Bridge[];
  totalCount: number;
}

export interface HotspotRow {
  scope: "state" | "county";
  stateCode: string;
  stateName: string;
  countyCode: string | null;
  countyName: string | null;
  totalBridgeCount: number;
  criticalCount: number;
  highCount: number;
  poorConditionCount: number;
  riskScore: number;
}

export function getHotspotScope(query: Pick<BridgeQueryParams, "stateCode">) {
  return query.stateCode ? "county" : "state";
}

function buildBridgeWhere(
  query: BridgeQueryParams,
  bounds?: BoundsQuery | null
): Prisma.BridgeWhereInput {
  const where: Prisma.BridgeWhereInput = {};

  if (query.search) {
    where.searchText = { contains: query.search, mode: "insensitive" };
  }
  if (query.stateCode) {
    where.stateCode = query.stateCode;
  }
  if (query.countyCode) {
    where.countyCode = query.countyCode;
  }
  if (query.bridgeCondition) {
    where.bridgeCondition = query.bridgeCondition;
  }
  if (query.priorityLevel) {
    where.priorityLevel = query.priorityLevel;
  }
  if (query.minAge !== null || query.maxAge !== null) {
    where.bridgeAge = {
      gte: query.minAge ?? undefined,
      lte: query.maxAge ?? undefined,
    };
  }
  if (query.minAdt !== null || query.maxAdt !== null) {
    where.averageDailyTraffic = {
      gte: query.minAdt ?? undefined,
      lte: query.maxAdt ?? undefined,
    };
  }
  if (bounds) {
    where.hasValidCoordinates = true;
    where.latitude = { gte: bounds.south, lte: bounds.north };
    where.longitude = { gte: bounds.west, lte: bounds.east };
  }

  return where;
}

function buildOrderBy(query: BridgeQueryParams): Prisma.BridgeOrderByWithRelationInput {
  return {
    [query.sortBy]: query.sortDirection,
  };
}

export async function listBridges(
  query: BridgeQueryParams
): Promise<BridgeListResult> {
  const where = buildBridgeWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [bridges, totalCount] = await Promise.all([
    db.bridge.findMany({
      where,
      orderBy: buildOrderBy(query),
      skip,
      take: query.pageSize,
    }),
    db.bridge.count({ where }),
  ]);

  return { bridges: bridges as Bridge[], totalCount };
}

export async function listMapBridges(
  query: BridgeQueryParams,
  limit = MAP_MARKER_LIMIT
): Promise<BridgeMapResult> {
  const where = buildBridgeWhere(query, query.bounds);
  const [bridges, totalCount] = await Promise.all([
    db.bridge.findMany({
      where,
      orderBy: [{ priorityLevel: "asc" }, { averageDailyTraffic: "desc" }],
      take: limit,
    }),
    db.bridge.count({ where }),
  ]);

  return { bridges: bridges as Bridge[], totalCount };
}

export async function getBridgeDetailAndRecordView(
  id: string
): Promise<Bridge | null> {
  try {
    return (await db.bridge.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    })) as Bridge;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
}

export async function listRiskHotspots(
  query: BridgeQueryParams
): Promise<HotspotRow[]> {
  const scope = getHotspotScope(query);
  const stateFilterSql = query.stateCode
    ? Prisma.sql`AND "stateCode" = ${query.stateCode}`
    : Prisma.empty;
  const countyFilterSql = query.countyCode
    ? Prisma.sql`AND "countyCode" = ${query.countyCode}`
    : Prisma.empty;
  const conditionFilterSql = query.bridgeCondition
    ? Prisma.sql`AND "bridgeCondition" = ${query.bridgeCondition}::"BridgeCondition"`
    : Prisma.empty;
  const priorityFilterSql = query.priorityLevel
    ? Prisma.sql`AND "priorityLevel" = ${query.priorityLevel}::"PriorityLevel"`
    : Prisma.empty;
  const ageMinSql =
    query.minAge !== null ? Prisma.sql`AND "bridgeAge" >= ${query.minAge}` : Prisma.empty;
  const ageMaxSql =
    query.maxAge !== null ? Prisma.sql`AND "bridgeAge" <= ${query.maxAge}` : Prisma.empty;
  const adtMinSql =
    query.minAdt !== null
      ? Prisma.sql`AND "averageDailyTraffic" >= ${query.minAdt}`
      : Prisma.empty;
  const adtMaxSql =
    query.maxAdt !== null
      ? Prisma.sql`AND "averageDailyTraffic" <= ${query.maxAdt}`
      : Prisma.empty;
  const searchSql = query.search
    ? Prisma.sql`AND "searchText" ILIKE ${`%${query.search}%`}`
    : Prisma.empty;

  if (scope === "county") {
    return db.$queryRaw<HotspotRow[]>`
      SELECT
        'county' AS scope,
        "stateCode",
        "stateName",
        "countyCode",
        "countyName",
        COUNT(*)::int AS "totalBridgeCount",
        COUNT(*) FILTER (WHERE "priorityLevel" = 'Critical')::int AS "criticalCount",
        COUNT(*) FILTER (WHERE "priorityLevel" = 'High')::int AS "highCount",
        COUNT(*) FILTER (WHERE "bridgeCondition" = 'Poor')::int AS "poorConditionCount",
        (
          COUNT(*) FILTER (WHERE "priorityLevel" = 'Critical') * 3 +
          COUNT(*) FILTER (WHERE "priorityLevel" = 'High') * 2 +
          COUNT(*) FILTER (WHERE "bridgeCondition" = 'Poor')
        )::int AS "riskScore"
      FROM "Bridge"
      WHERE 1 = 1
        ${stateFilterSql}
        ${countyFilterSql}
        ${conditionFilterSql}
        ${priorityFilterSql}
        ${ageMinSql}
        ${ageMaxSql}
        ${adtMinSql}
        ${adtMaxSql}
        ${searchSql}
      GROUP BY "stateCode", "stateName", "countyCode", "countyName"
      ORDER BY "riskScore" DESC, "totalBridgeCount" DESC
      LIMIT 25
    `;
  }

  return db.$queryRaw<HotspotRow[]>`
    SELECT
      'state' AS scope,
      "stateCode",
      "stateName",
      NULL::text AS "countyCode",
      NULL::text AS "countyName",
      COUNT(*)::int AS "totalBridgeCount",
      COUNT(*) FILTER (WHERE "priorityLevel" = 'Critical')::int AS "criticalCount",
      COUNT(*) FILTER (WHERE "priorityLevel" = 'High')::int AS "highCount",
      COUNT(*) FILTER (WHERE "bridgeCondition" = 'Poor')::int AS "poorConditionCount",
      (
        COUNT(*) FILTER (WHERE "priorityLevel" = 'Critical') * 3 +
        COUNT(*) FILTER (WHERE "priorityLevel" = 'High') * 2 +
        COUNT(*) FILTER (WHERE "bridgeCondition" = 'Poor')
      )::int AS "riskScore"
    FROM "Bridge"
    WHERE 1 = 1
      ${conditionFilterSql}
      ${priorityFilterSql}
      ${ageMinSql}
      ${ageMaxSql}
      ${adtMinSql}
      ${adtMaxSql}
      ${searchSql}
    GROUP BY "stateCode", "stateName"
    ORDER BY "riskScore" DESC, "totalBridgeCount" DESC
    LIMIT 25
  `;
}
