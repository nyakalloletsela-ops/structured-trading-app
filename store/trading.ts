import { create } from 'zustand'
import type { Signal, TradeJournal, MarketData } from '@/types'

interface TradingStore {
  signals: Signal[]
  trades: TradeJournal[]
  marketData: Record<string, MarketData>
  selectedSymbol: string
  accountBalance: number
  riskPercentage: number
  
  addSignal: (signal: Signal) => void
  addTrade: (trade: TradeJournal) => void
  updateMarketData: (symbol: string, data: MarketData) => void
  setSelectedSymbol: (symbol: string) => void
  setAccountBalance: (balance: number) => void
  setRiskPercentage: (risk: number) => void
}

export const useTradingStore = create<TradingStore>((set) => ({
  signals: [],
  trades: [],
  marketData: {},
  selectedSymbol: 'XAUUSD',
  accountBalance: 10000,
  riskPercentage: 2,
  
  addSignal: (signal) => set((state) => ({
    signals: [signal, ...state.signals],
  })),
  
  addTrade: (trade) => set((state) => ({
    trades: [trade, ...state.trades],
  })),
  
  updateMarketData: (symbol, data) => set((state) => ({
    marketData: { ...state.marketData, [symbol]: data },
  })),
  
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setAccountBalance: (balance) => set({ accountBalance: balance }),
  setRiskPercentage: (risk) => set({ riskPercentage: risk }),
}))
