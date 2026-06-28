import { toBridgeGridResponse } from "@/features/bridge-explorer/api/bridgeDtos";
import { listBridges } from "@/lib/bridgeRepository";
import { parseBridgeQueryParams } from "@/lib/queryParams";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const query = parseBridgeQueryParams(new URL(request.url).searchParams);
  const result = await listBridges(query);

  return NextResponse.json(
    toBridgeGridResponse(
      result.bridges,
      result.totalCount,
      query.page,
      query.pageSize
    )
  );
}
