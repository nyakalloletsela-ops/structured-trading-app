export const riskCalculator = {
  calculatePositionSize(balance: number, riskPercent: number, entryPrice: number, stopLoss: number) {
    const riskAmount = balance * (riskPercent / 100)
    const priceDifference = Math.abs(entryPrice - stopLoss)
    return priceDifference > 0 ? riskAmount / priceDifference : 0
  },

  calculateTakeProfit(entryPrice: number, stopLoss: number, riskRewardRatio: number) {
    const riskDistance = Math.abs(entryPrice - stopLoss)
    return entryPrice + riskDistance * riskRewardRatio
  },

  calculatePnL(entryPrice: number, exitPrice: number, positionSize: number, isLong: boolean) {
    const priceDiff = isLong ? exitPrice - entryPrice : entryPrice - exitPrice
    return priceDiff * positionSize
  },

  calculateRiskReward(entryPrice: number, stopLoss: number, takeProfit: number, isLong: boolean) {
    const risk = Math.abs(entryPrice - stopLoss)
    const reward = Math.abs(takeProfit - entryPrice)
    return risk > 0 ? reward / risk : 0
  },
}
