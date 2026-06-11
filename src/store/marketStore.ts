import { create } from "zustand"
import type { Symbol, TradeSignal, MarketQuote, StructureAnalysis, Timeframe, Candle } from "@/types"

export interface SymbolAnalysis {
  signal: TradeSignal
  quote: MarketQuote
  candles: Record<Timeframe, Candle[]>
}

interface MarketState {
  activeSymbol: Symbol
  activeTimeframe: Timeframe
  analyses: Partial<Record<Symbol, SymbolAnalysis>>
  loading: boolean
  lastUpdated: number | null
  setActiveSymbol: (symbol: Symbol) => void
  setActiveTimeframe: (tf: Timeframe) => void
  setAnalysis: (symbol: Symbol, analysis: SymbolAnalysis) => void
  setLoading: (loading: boolean) => void
  markUpdated: () => void
}

export const useMarketStore = create<MarketState>((set) => ({
  activeSymbol: "XAUUSD",
  activeTimeframe: "H4",
  analyses: {},
  loading: false,
  lastUpdated: null,
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  setActiveTimeframe: (tf) => set({ activeTimeframe: tf }),
  setAnalysis: (symbol, analysis) =>
    set((state) => ({ analyses: { ...state.analyses, [symbol]: analysis } })),
  setLoading: (loading) => set({ loading }),
  markUpdated: () => set({ lastUpdated: Date.now() }),
}))

export function getActiveAnalysis(state: MarketState): SymbolAnalysis | undefined {
  return state.analyses[state.activeSymbol]
}

export function getActiveStructure(state: MarketState): StructureAnalysis | undefined {
  const analysis = state.analyses[state.activeSymbol]
  return analysis?.signal.timeframeAnalysis[state.activeTimeframe]
}
