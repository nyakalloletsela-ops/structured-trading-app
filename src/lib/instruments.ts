import type { Symbol } from "@/types"

export interface InstrumentConfig {
  symbol: Symbol
  name: string
  description: string
  digits: number
  // Value of a 1.0 price move per 1 unit of position, in account currency
  contractValuePerPoint: number
  basePrice: number
  // Typical daily volatility used by the synthetic data generator
  volatility: number
}

export const INSTRUMENTS: Record<Symbol, InstrumentConfig> = {
  XAUUSD: {
    symbol: "XAUUSD",
    name: "GOLD",
    description: "Gold vs US Dollar",
    digits: 2,
    contractValuePerPoint: 1, // 1 oz moves $1 per $1 price move
    basePrice: 2350,
    volatility: 0.012,
  },
  US500: {
    symbol: "US500",
    name: "US500",
    description: "S&P 500 Index",
    digits: 2,
    contractValuePerPoint: 1,
    basePrice: 5450,
    volatility: 0.009,
  },
}

export const SYMBOLS: Symbol[] = ["XAUUSD", "US500"]
