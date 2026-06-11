import type { Candle, BOS, CHoCH, OrderBlock, FVG, LiquiditySweep, MarketStructure } from '@/types'
import { detectBOS, detectCHoCH, detectOrderBlocks, detectFVG, detectLiquiditySweeps } from '@/src/strategy/analysis'

export const structureService = {
  analyzeStructure(candles: Candle[], timeframe: 'W' | 'D' | 'H4'): MarketStructure {
    const bos = detectBOS(candles)
    const choch = detectCHoCH(candles)
    const orderBlocks = detectOrderBlocks(candles)
    const fvgs = detectFVG(candles)
    const liquiditySweeps = detectLiquiditySweeps(candles)

    const lastCandle = candles[candles.length - 1]
    const prevCandles = candles.slice(-5)
    const avgClose = prevCandles.reduce((sum, c) => sum + c.close, 0) / prevCandles.length

    let trend: 'BULLISH' | 'BEARISH' | 'RANGING' = 'RANGING'
    if (lastCandle.close > avgClose + 10) {
      trend = 'BULLISH'
    } else if (lastCandle.close < avgClose - 10) {
      trend = 'BEARISH'
    }

    return {
      timeframe,
      trend,
      bos,
      choch,
      orderBlocks,
      fvgs,
      liquiditySweeps,
    }
  },
}
