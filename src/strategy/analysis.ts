import type { Candle, OrderBlock, FVG, BOS, CHoCH, LiquiditySweep } from '@/types'

const detectBOS = (candles: Candle[]): BOS | null => {
  if (candles.length < 3) return null
  
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const prevPrev = candles[candles.length - 3]
  
  const isBullishBOS = last.high > prevPrev.high && prev.low < prevPrev.low
  const isBearishBOS = last.low < prevPrev.low && prev.high > prevPrev.high
  
  if (isBullishBOS) {
    return {
      timestamp: last.timestamp,
      price: last.high,
      type: 'bullish',
    }
  }
  
  if (isBearishBOS) {
    return {
      timestamp: last.timestamp,
      price: last.low,
      type: 'bearish',
    }
  }
  
  return null
}

const detectCHoCH = (candles: Candle[]): CHoCH | null => {
  if (candles.length < 5) return null
  
  const recent = candles.slice(-5)
  const highs = recent.map(c => c.high)
  const lows = recent.map(c => c.low)
  
  const maxHigh = Math.max(...highs.slice(0, -1))
  const minLow = Math.min(...lows.slice(0, -1))
  
  const lastCandle = recent[recent.length - 1]
  
  if (lastCandle.high > maxHigh && lastCandle.low > minLow) {
    return {
      timestamp: lastCandle.timestamp,
      price: lastCandle.high,
      type: 'bullish',
    }
  }
  
  if (lastCandle.low < minLow && lastCandle.high < maxHigh) {
    return {
      timestamp: lastCandle.timestamp,
      price: lastCandle.low,
      type: 'bearish',
    }
  }
  
  return null
}

const detectOrderBlocks = (candles: Candle[], threshold: number = 0.02): OrderBlock[] => {
  const orderBlocks: OrderBlock[] = []
  
  for (let i = 2; i < candles.length; i++) {
    const prev = candles[i - 1]
    const curr = candles[i]
    
    const priceChange = Math.abs(curr.close - prev.close) / prev.close
    
    if (priceChange > threshold) {
      orderBlocks.push({
        timestamp: prev.timestamp,
        price: prev.close,
        type: curr.close > prev.close ? 'bullish' : 'bearish',
        size: prev.volume,
      })
    }
  }
  
  return orderBlocks.slice(-5)
}

const detectFVG = (candles: Candle[]): FVG[] => {
  const fvgs: FVG[] = []
  
  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1]
    const curr = candles[i]
    const next = candles[i + 1]
    
    if (curr.high < next.low && curr.low > prev.high) {
      fvgs.push({
        timestamp: curr.timestamp,
        bottomPrice: curr.high,
        topPrice: next.low,
        type: 'bullish',
      })
    }
    
    if (curr.low > next.high && curr.high < prev.low) {
      fvgs.push({
        timestamp: curr.timestamp,
        topPrice: curr.low,
        bottomPrice: next.high,
        type: 'bearish',
      })
    }
  }
  
  return fvgs.slice(-5)
}

const detectLiquiditySweeps = (candles: Candle[]): LiquiditySweep[] => {
  const sweeps: LiquiditySweep[] = []
  
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1]
    const curr = candles[i]
    
    if (curr.low < prev.low && curr.close > prev.high) {
      sweeps.push({
        timestamp: curr.timestamp,
        price: curr.low,
        type: 'bullish',
        volume: curr.volume,
      })
    }
    
    if (curr.high > prev.high && curr.close < prev.low) {
      sweeps.push({
        timestamp: curr.timestamp,
        price: curr.high,
        type: 'bearish',
        volume: curr.volume,
      })
    }
  }
  
  return sweeps.slice(-5)
}

export { detectBOS, detectCHoCH, detectOrderBlocks, detectFVG, detectLiquiditySweeps }
