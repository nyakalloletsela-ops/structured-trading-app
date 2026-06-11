export const marketDataService = {
  async fetchMarketData(symbol: string) {
    try {
      const response = await fetch(`/api/market/${symbol}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching market data:', error)
      return null
    }
  },

  async fetchCandles(symbol: string, timeframe: string) {
    try {
      const response = await fetch(`/api/candles/${symbol}/${timeframe}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching candles:', error)
      return null
    }
  },

  async generateSignal(symbol: string) {
    try {
      const response = await fetch(`/api/signals/${symbol}`)
      return await response.json()
    } catch (error) {
      console.error('Error generating signal:', error)
      return null
    }
  },
}
