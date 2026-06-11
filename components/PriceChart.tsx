'use client'

import React, { useState } from 'react'
import type { Candle, MarketStructure } from '@/types'

interface ChartProps {
  candles: Candle[]
  structure?: MarketStructure
}

export const PriceChart: React.FC<ChartProps> = ({ candles, structure }) => {
  const [hoveredCandle, setHoveredCandle] = useState<number | null>(null)

  if (!candles || candles.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center">
        <p className="text-neutral">No chart data available</p>
      </div>
    )
  }

  const prices = candles.map(c => [c.low, c.high]).flat()
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice

  const chartHeight = 300
  const chartWidth = candles.length * 10
  const candleWidth = 8
  const candleSpacing = 2

  const getPriceY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight
  }

  return (
    <div className="chart-container overflow-x-auto">
      <svg width={Math.max(chartWidth, 800)} height={chartHeight + 40} className="min-w-full">
        {/* Grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const price = minPrice + (priceRange / 4) * i
          const y = getPriceY(price)
          return (
            <g key={`grid-${i}`}>
              <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#2d3748" strokeWidth="1" />
              <text x="5" y={y - 5} fill="#6b7280" fontSize="10">
                {price.toFixed(0)}
              </text>
            </g>
          )
        })}

        {/* Candles */}
        {candles.map((candle, idx) => {
          const x = idx * (candleWidth + candleSpacing) + 10
          const openY = getPriceY(candle.open)
          const closeY = getPriceY(candle.close)
          const highY = getPriceY(candle.high)
          const lowY = getPriceY(candle.low)
          const isGreen = candle.close >= candle.open
          const color = isGreen ? '#10b981' : '#ef4444'

          return (
            <g key={`candle-${idx}`} onMouseEnter={() => setHoveredCandle(idx)} onMouseLeave={() => setHoveredCandle(null)}>
              {/* Wick */}
              <line x1={x + candleWidth / 2} y1={highY} x2={x + candleWidth / 2} y2={lowY} stroke={color} strokeWidth="1" />
              {/* Body */}
              <rect
                x={x}
                y={Math.min(openY, closeY)}
                width={candleWidth}
                height={Math.abs(closeY - openY) || 1}
                fill={color}
                opacity={hoveredCandle === idx ? 1 : 0.7}
              />
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-neutral">
        <div>Latest: {candles[candles.length - 1].close.toFixed(2)}</div>
        <div>High: {Math.max(...candles.map(c => c.high)).toFixed(2)}</div>
        <div>Low: {Math.min(...candles.map(c => c.low)).toFixed(2)}</div>
        {structure && <div>Trend: {structure.trend}</div>}
      </div>
    </div>
  )
}
