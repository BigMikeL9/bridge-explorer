import { toRiskHotspotsResponse } from "@/features/bridge-explorer/api/bridgeDtos";
import { getHotspotScope, listRiskHotspots } from "@/lib/bridgeRepository";
import { parseBridgeQueryParams } from "@/lib/queryParams";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = parseBridgeQueryParams(new URL(request.url).searchParams);
  const hotspots = await listRiskHotspots(query);

  return NextResponse.json(toRiskHotspotsResponse(getHotspotScope(query), hotspots));
}
