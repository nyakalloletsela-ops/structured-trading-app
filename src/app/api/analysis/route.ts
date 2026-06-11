import { NextResponse } from "next/server"
import { analyzeSymbol } from "@/services/analysisService"
import { SYMBOLS } from "@/lib/instruments"
import type { Symbol } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbolParam = searchParams.get("symbol") as Symbol | null

  if (symbolParam && SYMBOLS.includes(symbolParam)) {
    const result = analyzeSymbol(symbolParam)
    return NextResponse.json(result)
  }

  // Default: analyze all instruments
  const results = SYMBOLS.map((s) => analyzeSymbol(s))
  return NextResponse.json({ results })
}
