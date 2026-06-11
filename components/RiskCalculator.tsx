'use client'

import React from 'react'
import { useTradingStore } from '@/store/trading'

export const RiskCalculator: React.FC = () => {
  const { accountBalance, riskPercentage, setRiskPercentage } = useTradingStore()
  const riskAmount = (accountBalance * riskPercentage) / 100

  return (
    <div className="trading-card p-4 space-y-4">
      <h2 className="text-lg font-bold">Risk Management</h2>
      
      <div>
        <p className="text-neutral text-sm">Account Balance</p>
        <p className="text-2xl font-bold">${accountBalance.toFixed(2)}</p>
      </div>

      <div>
        <label className="text-neutral text-sm">
          Risk % per Trade
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={riskPercentage}
          onChange={(e) => setRiskPercentage(parseFloat(e.target.value))}
          className="w-full mt-2"
        />
        <p className="text-center mt-2 font-mono">{riskPercentage.toFixed(1)}%</p>
      </div>

      <div className="bg-trading-bg p-3 rounded">
        <p className="text-neutral text-sm">Risk Amount per Trade</p>
        <p className="text-xl font-bold text-sell">${riskAmount.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-buy bg-opacity-10 p-2 rounded">
          <p className="text-neutral">1:1 Risk:Reward</p>
          <p className="font-bold text-buy">${riskAmount.toFixed(2)}</p>
        </div>
        <div className="bg-buy bg-opacity-10 p-2 rounded">
          <p className="text-neutral">1:2 Risk:Reward</p>
          <p className="font-bold text-buy">${(riskAmount * 2).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
