import { marketDataProvider } from "@/services/marketDataProvider"
import type { Symbol, Timeframe } from "@/types"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/market-data/candles
 *
 * Fetch OHLCV candles from MT5 bridge.
 *
 * Query Parameters:
 *   - symbol: XAUUSD | US500
 *   - tf: H4 | D1 | W1 | H1 | M30
 *   - count: number (default 500, max 5000)
 *
 * Returns:
 *   {
 *     success: boolean,
 *     candles: Candle[],
 *     count: number,
 *     cached: boolean,
 *     error?: string
 *   }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = (searchParams.get("symbol") as Symbol) || "XAUUSD"
    const timeframe = (searchParams.get("tf") as Timeframe) || "H4"
    const count = Math.min(parseInt(searchParams.get("count") || "500"), 5000)

    // Validate parameters
    if (!["XAUUSD", "US500"].includes(symbol)) {
      return NextResponse.json(
        { success: false, error: `Invalid symbol: ${symbol}` },
        { status: 400 },
      )
    }

    if (!["W1", "D1", "H4", "H1", "M30"].includes(timeframe)) {
      return NextResponse.json(
        { success: false, error: `Invalid timeframe: ${timeframe}` },
        { status: 400 },
      )
    }

    if (count < 1 || count > 5000) {
      return NextResponse.json(
        { success: false, error: "Count must be between 1 and 5000" },
        { status: 400 },
      )
    }

    // Fetch candles
    const candles = await marketDataProvider.fetchCandles(symbol, timeframe, count)

    return NextResponse.json(
      {
        success: true,
        symbol,
        timeframe,
        candles,
        count: candles.length,
        cached: false,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in /api/market-data/candles:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
