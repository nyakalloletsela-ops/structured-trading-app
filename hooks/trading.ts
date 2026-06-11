import { useTradingStore } from '@/store/trading'
import type { Signal, MarketData } from '@/types'

export const useMarketData = () => {
  const { marketData, updateMarketData } = useTradingStore()
  
  const fetchMarketData = async (symbol: string): Promise<MarketData | null> => {
    try {
      const response = await fetch(`/api/market/${symbol}`)
      const data = await response.json()
      updateMarketData(symbol, data)
      return data
    } catch (error) {
      console.error('Error fetching market data:', error)
      return null
    }
  }
  
  return { marketData, fetchMarketData }
}

export const useSignals = () => {
  const { signals, addSignal } = useTradingStore()
  
  const generateSignal = async (symbol: string): Promise<Signal | null> => {
    try {
      const response = await fetch(`/api/signals/${symbol}`)
      const signal = await response.json()
      addSignal(signal)
      return signal
    } catch (error) {
      console.error('Error generating signal:', error)
      return null
    }
  }
  
  return { signals, generateSignal }
}

export const useTrades = () => {
  const { trades, addTrade } = useTradingStore()
  
  const openTrade = (trade: any) => {
    addTrade(trade)
  }
  
  return { trades, openTrade }
}
