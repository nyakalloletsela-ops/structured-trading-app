import { create } from "zustand"
import type { RiskParams, RiskResult, Symbol } from "@/types"
import { calculateRisk } from "@/services/riskManager"

interface RiskState extends RiskParams {
  result: RiskResult
  setField: (field: keyof RiskParams, value: number | Symbol) => void
  recompute: () => void
}

const initialParams: RiskParams = {
  accountBalance: 10000,
  riskPercent: 1,
  entry: 2350,
  stopLoss: 2335,
  takeProfit: 2380,
  symbol: "XAUUSD",
}

export const useRiskStore = create<RiskState>((set, get) => ({
  ...initialParams,
  result: calculateRisk(initialParams),
  setField: (field, value) => {
    set({ [field]: value } as Partial<RiskState>)
    const s = get()
    set({
      result: calculateRisk({
        accountBalance: s.accountBalance,
        riskPercent: s.riskPercent,
        entry: s.entry,
        stopLoss: s.stopLoss,
        takeProfit: s.takeProfit,
        symbol: s.symbol,
      }),
    })
  },
  recompute: () => {
    const s = get()
    set({
      result: calculateRisk({
        accountBalance: s.accountBalance,
        riskPercent: s.riskPercent,
        entry: s.entry,
        stopLoss: s.stopLoss,
        takeProfit: s.takeProfit,
        symbol: s.symbol,
      }),
    })
  },
}))
