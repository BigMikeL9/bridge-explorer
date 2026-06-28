import { toBridgeDetailDto } from "@/features/bridge-explorer/api/bridgeDtos";
import { getBridgeDetailAndRecordView } from "@/lib/bridgeRepository";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bridge = await getBridgeDetailAndRecordView(id);

  if (!bridge) {
    return NextResponse.json({ error: "Bridge not found" }, { status: 404 });
  }

  return NextResponse.json(toBridgeDetailDto(bridge));
}
