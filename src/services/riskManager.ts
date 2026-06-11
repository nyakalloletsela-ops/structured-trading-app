import type { RiskParams, RiskResult } from "@/types"
import { INSTRUMENTS } from "@/lib/instruments"

/**
 * Position sizing & risk calculator.
 * positionSize = (accountBalance * risk%) / (stopDistance * contractValue)
 */
export function calculateRisk(params: RiskParams): RiskResult {
  const { accountBalance, riskPercent, entry, stopLoss, takeProfit, symbol } = params
  const cfg = INSTRUMENTS[symbol]

  const riskAmount = (accountBalance * riskPercent) / 100
  const stopDistance = Math.abs(entry - stopLoss)
  const rewardDistance = Math.abs(takeProfit - entry)

  const positionSize =
    stopDistance > 0 ? riskAmount / (stopDistance * cfg.contractValuePerPoint) : 0

  const potentialProfit = positionSize * rewardDistance * cfg.contractValuePerPoint
  const riskReward = stopDistance > 0 ? rewardDistance / stopDistance : 0

  return {
    riskAmount: round(riskAmount, 2),
    stopDistance: round(stopDistance, cfg.digits),
    positionSize: round(positionSize, 4),
    units: round(positionSize, 2),
    potentialProfit: round(potentialProfit, 2),
    riskReward: round(riskReward, 2),
  }
}

function round(value: number, digits: number): number {
  const f = Math.pow(10, digits)
  return Math.round(value * f) / f
}
