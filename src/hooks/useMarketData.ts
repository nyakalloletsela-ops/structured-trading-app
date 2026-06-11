"use client"

import { useEffect, useCallback } from "react"
import { useMarketStore, type SymbolAnalysis } from "@/store/marketStore"
import { SYMBOLS } from "@/lib/instruments"
import type { Symbol } from "@/types"

const REFRESH_MS = 15000

/**
 * Loads multi-timeframe analysis for all instruments from the analysis API and
 * keeps the Zustand store fresh on an interval. No fetching inside render.
 */
export function useMarketData() {
  const setAnalysis = useMarketStore((s) => s.setAnalysis)
  const setLoading = useMarketStore((s) => s.setLoading)
  const markUpdated = useMarketStore((s) => s.markUpdated)
  const analyses = useMarketStore((s) => s.analyses)
  const loading = useMarketStore((s) => s.loading)
  const lastUpdated = useMarketStore((s) => s.lastUpdated)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.all(
        SYMBOLS.map(async (symbol: Symbol) => {
          const res = await fetch(`/api/analysis?symbol=${symbol}`, { cache: "no-store" })
          const data = (await res.json()) as SymbolAnalysis
          return { symbol, data }
        }),
      )
      for (const { symbol, data } of results) {
        setAnalysis(symbol, data)
      }
      markUpdated()
    } catch (err) {
      console.error("[v0] market data refresh failed", err)
    } finally {
      setLoading(false)
    }
  }, [setAnalysis, setLoading, markUpdated])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  return { analyses, loading, lastUpdated, refresh }
}
