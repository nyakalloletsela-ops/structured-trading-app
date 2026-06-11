import { marketDataProvider } from "@/services/marketDataProvider"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/market-data/cache
 *
 * Get cache statistics.
 *
 * Returns:
 *   {
 *     entries: number,
 *     keys: string[],
 *     size: number (bytes)
 *   }
 */
export async function GET() {
  try {
    const stats = marketDataProvider.getCacheStats()

    return NextResponse.json(
      {
        entries: stats.entries,
        keys: stats.keys,
        size: stats.size,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in /api/market-data/cache:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/market-data/cache/clear
 *
 * Clear cache.
 *
 * Returns:
 *   { cleared: boolean }
 */
export async function POST() {
  try {
    marketDataProvider.clearCache()

    return NextResponse.json(
      {
        cleared: true,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in POST /api/market-data/cache:", error)
    return NextResponse.json(
      {
        cleared: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
