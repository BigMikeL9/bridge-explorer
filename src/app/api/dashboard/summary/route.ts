import { getDashboardSummary } from "@/lib/bridgeRepository";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Dashboard summary request failed", error);
    return NextResponse.json(
      { error: "Unable to load dashboard summary." },
      { status: 500 }
    );
  }
}
