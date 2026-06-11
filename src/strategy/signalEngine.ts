import { detectBOS, detectCHoCH, detectOrderBlocks, detectFVG, detectLiquiditySweeps } from './analysis'
import type { Candle, Signal } from '@/types'

const calculateSignalScore = (indicators: any): number => {
  let score = 0
  let weights = 0
  
  if (indicators.bos) {
    score += indicators.bos.type === 'bullish' ? 25 : -25
    weights += 25
  }
  
  if (indicators.choch) {
    score += indicators.choch.type === 'bullish' ? 20 : -20
    weights += 20
  }
  
  if (indicators.orderBlocks && indicators.orderBlocks.length > 0) {
    const avgType = indicators.orderBlocks[0].type === 'bullish' ? 15 : -15
    score += avgType
    weights += 15
  }
  
  if (indicators.fvgs && indicators.fvgs.length > 0) {
    const avgType = indicators.fvgs[0].type === 'bullish' ? 20 : -20
    score += avgType
    weights += 20
  }
  
  if (indicators.liquiditySweeps && indicators.liquiditySweeps.length > 0) {
    const avgType = indicators.liquiditySweeps[0].type === 'bullish' ? 20 : -20
    score += avgType
    weights += 20
  }
  
  return weights > 0 ? score / weights : 0
}

export const generateSignal = (candles: Candle[], price: number): Signal => {
  const bos = detectBOS(candles)
  const choch = detectCHoCH(candles)
  const orderBlocks = detectOrderBlocks(candles)
  const fvgs = detectFVG(candles)
  const liquiditySweeps = detectLiquiditySweeps(candles)
  
  const indicators = { bos, choch, orderBlocks, fvgs, liquiditySweeps }
  const score = calculateSignalScore(indicators)
  
  let signalType: 'BUY' | 'SELL' | 'NO_TRADE' = 'NO_TRADE'
  
  if (score > 30) {
    signalType = 'BUY'
  } else if (score < -30) {
    signalType = 'SELL'
  }
  
  const confidence = Math.min(Math.abs(score) / 100, 1)
  
  return {
    id: `${Date.now()}-${Math.random()}`,
    symbol: 'XAUUSD',
    type: signalType,
    price,
    timestamp: Date.now(),
    score,
    confidence,
    reason: `Signal based on ${Object.keys(indicators).filter(k => indicators[k as keyof typeof indicators]).length} indicators`,
  }
}
