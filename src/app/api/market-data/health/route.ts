import { marketDataProvider } from "@/services/marketDataProvider"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/market-data/health
 *
 * Check if MT5 bridge is connected and responding.
 *
 * Returns:
 *   {
 *     connected: boolean,
 *     bridgeUrl: string,
 *     timestamp: string
 *   }
 */
export async function GET() {
  try {
    const isHealthy = await marketDataProvider.isHealthy()

    return NextResponse.json(
      {
        connected: isHealthy,
        bridgeUrl: process.env.NEXT_PUBLIC_MT5_BRIDGE_URL || "http://127.0.0.1:5001",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in /api/market-data/health:", error)
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
