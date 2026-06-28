import {
  createBoundsRequiredMapResponse,
  toBridgeMapResponse,
} from "@/features/bridge-explorer/api/bridgeDtos";
import { listMapBridges } from "@/lib/bridgeRepository";
import { MAP_MARKER_LIMIT, parseBridgeQueryParams } from "@/lib/queryParams";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = parseBridgeQueryParams(new URL(request.url).searchParams);

  if (!query.bounds) {
    return NextResponse.json(createBoundsRequiredMapResponse(MAP_MARKER_LIMIT));
  }

  const result = await listMapBridges(query, MAP_MARKER_LIMIT);

  return NextResponse.json(
    toBridgeMapResponse(result.bridges, result.totalCount, MAP_MARKER_LIMIT)
  );
}
