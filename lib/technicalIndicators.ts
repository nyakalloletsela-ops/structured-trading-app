export const technicalIndicators = {
  calculateSMA(prices: number[], period: number): number[] => {
    const sma: number[] = []
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
    return sma
  },

  calculateRSI(prices: number[], period: number = 14): number[] => {
    const rsi: number[] = []
    const changes = prices.slice(1).map((price, i) => price - prices[i])
    
    let gains = 0
    let losses = 0
    
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) gains += changes[i]
      else losses += -changes[i]
    }
    
    let avgGain = gains / period
    let avgLoss = losses / period
    
    for (let i = period; i < changes.length; i++) {
      if (changes[i] > 0) gains = changes[i]
      else losses = -changes[i]
      
      avgGain = (avgGain * (period - 1) + gains) / period
      avgLoss = (avgLoss * (period - 1) + losses) / period
      
      const rs = avgLoss !== 0 ? avgGain / avgLoss : 100
      rsi.push(100 - 100 / (1 + rs))
    }
    
    return rsi
  },

  calculateATR(candles: any[], period: number = 14): number[] => {
    const atr: number[] = []
    const tr: number[] = []
    
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i]
      const previous = candles[i - 1]
      
      const tr1 = current.high - current.low
      const tr2 = Math.abs(current.high - previous.close)
      const tr3 = Math.abs(current.low - previous.close)
      
      tr.push(Math.max(tr1, tr2, tr3))
    }
    
    for (let i = period - 1; i < tr.length; i++) {
      const sum = tr.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      atr.push(sum / period)
    }
    
    return atr
  },
}
