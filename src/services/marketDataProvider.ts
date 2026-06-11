import type { Candle, Symbol, Timeframe, MarketQuote } from "@/types"
import { INSTRUMENTS } from "@/lib/instruments"

/**
 * Market Data Provider
 *
 * Connects to MT5 Python bridge (running on localhost:5001) to fetch real market data.
 * Falls back to cached data if bridge is unavailable.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MarketDataProviderError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message)
    this.name = "MarketDataProviderError"
  }
}

export class MarketDataProvider {
  private bridgeUrl: string
  private cache: Map<string, CacheEntry<any>>
  private retryAttempts: number
  private retryDelayMs: number
  private requestTimeout: number

  constructor(
    bridgeUrl: string = "http://127.0.0.1:5001",
    retryAttempts: number = 3,
    retryDelayMs: number = 1000,
    requestTimeout: number = 10000,
  ) {
    this.bridgeUrl = bridgeUrl.replace(/\/$/, "") // Remove trailing slash
    this.cache = new Map()
    this.retryAttempts = retryAttempts
    this.retryDelayMs = retryDelayMs
    this.requestTimeout = requestTimeout
  }

  /**
   * Fetch OHLCV candles from MT5 bridge.
   *
   * @param symbol Trading symbol (XAUUSD, US500)
   * @param timeframe Timeframe (H4, D1, W1, etc.)
   * @param count Number of candles to fetch
   * @returns Array of candles
   */
  async fetchCandles(symbol: Symbol, timeframe: Timeframe, count: number = 500): Promise<Candle[]> {
    const cacheKey = `candles_${symbol}_${timeframe}`
    const cachedData = this.getFromCache<Candle[]>(cacheKey)

    if (cachedData) {
      console.log(`[MarketDataProvider] Cache hit: ${cacheKey}`)
      // Return last 'count' candles
      return cachedData.slice(-count)
    }

    try {
      console.log(`[MarketDataProvider] Fetching ${count} ${timeframe} candles for ${symbol}...`)

      const response = await this.fetchWithRetry(
        `${this.bridgeUrl}/candles?symbol=${symbol}&tf=${timeframe}&count=${Math.min(count, 5000)}`,
      )

      if (!response.success) {
        throw new MarketDataProviderError("FETCH_FAILED", response.error || "Unknown error")
      }

      const candles = response.candles as Candle[]

      if (!Array.isArray(candles) || candles.length === 0) {
        throw new MarketDataProviderError("NO_DATA", "No candles returned from bridge")
      }

      // Validate candle format
      this.validateCandles(candles)

      // Cache for 5 minutes
      this.setCache(cacheKey, candles, 300_000)

      console.log(
        `[MarketDataProvider] Successfully fetched ${candles.length} candles for ${symbol} ${timeframe}`,
      )
      return candles.slice(-count)
    } catch (error) {
      console.error(
        `[MarketDataProvider] Error fetching candles: ${error instanceof Error ? error.message : String(error)}`,
      )

      // Try to return stale cache as fallback
      const staleData = this.getFromCache<Candle[]>(cacheKey, true)
      if (staleData) {
        console.warn(`[MarketDataProvider] Returning stale cache data for ${cacheKey}`)
        return staleData.slice(-count)
      }

      throw error
    }
  }

  /**
   * Get current market quote.
   *
   * @param symbol Trading symbol
   * @returns Market quote with bid/ask/price
   */
  async getQuote(symbol: Symbol): Promise<MarketQuote> {
    const cacheKey = `quote_${symbol}`
    const cachedData = this.getFromCache<MarketQuote>(cacheKey)

    if (cachedData) {
      console.log(`[MarketDataProvider] Quote cache hit: ${symbol}`)
      return cachedData
    }

    try {
      const response = await this.fetchWithRetry(`${this.bridgeUrl}/quote?symbol=${symbol}`)

      if (!response.success) {
        throw new MarketDataProviderError("QUOTE_FAILED", response.error || "Unknown error")
      }

      const quote: MarketQuote = {
        symbol,
        price: response.last || response.ask || 0,
        change: 0, // Will be calculated
        changePercent: 0,
        high: 0, // Will be from recent candles
        low: 0,
        updatedAt: response.time || Date.now(),
      }

      // Cache for 1 minute
      this.setCache(cacheKey, quote, 60_000)

      return quote
    } catch (error) {
      console.error(`[MarketDataProvider] Error fetching quote: ${error}`)
      throw error
    }
  }

  /**
   * Check if bridge is healthy.
   *
   * @returns True if bridge is connected and responding
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(this.requestTimeout),
      })

      if (!response.ok) return false

      const data = await response.json()
      return data.status === "ok" && data.mt5_connected === true
    } catch (error) {
      console.error(`[MarketDataProvider] Health check failed: ${error}`)
      return false
    }
  }

  /**
   * Get cache statistics.
   *
   * @returns Cache stats
   */
  getCacheStats(): { entries: number; keys: string[]; size: number } {
    let size = 0
    const keys: string[] = []

    for (const [key, entry] of this.cache) {
      keys.push(key)
      if (typeof entry.data === "string") {
        size += entry.data.length
      } else {
        size += JSON.stringify(entry.data).length
      }
    }

    return {
      entries: this.cache.size,
      keys,
      size,
    }
  }

  /**
   * Clear all cache.
   */
  clearCache(): void {
    console.log(`[MarketDataProvider] Clearing cache (${this.cache.size} entries)`)
    this.cache.clear()
  }

  /**
   * Private Methods
   */

  private async fetchWithRetry(
    url: string,
    attempt: number = 1,
  ): Promise<any> {
    try {
      console.log(`[MarketDataProvider] Fetch attempt ${attempt}/${this.retryAttempts}: ${url}`)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(this.requestTimeout),
      })

      if (!response.ok) {
        throw new MarketDataProviderError(
          "HTTP_ERROR",
          `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      const isLastAttempt = attempt >= this.retryAttempts
      const errorMsg = error instanceof Error ? error.message : String(error)

      if (isLastAttempt) {
        throw error
      }

      console.warn(
        `[MarketDataProvider] Attempt ${attempt} failed: ${errorMsg}. Retrying in ${this.retryDelayMs}ms...`,
      )

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs))

      return this.fetchWithRetry(url, attempt + 1)
    }
  }

  private getFromCache<T>(key: string, ignoreExpiration: boolean = false): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (!ignoreExpiration) {
      const isExpired = Date.now() > entry.timestamp + entry.ttl
      if (isExpired) {
        console.log(`[MarketDataProvider] Cache expired: ${key}`)
        this.cache.delete(key)
        return null
      }
    }

    return entry.data as T
  }

  private setCache<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
    console.log(`[MarketDataProvider] Cache set: ${key} (TTL: ${ttlMs}ms)`)
  }

  private validateCandles(candles: Candle[]): void {
    for (const candle of candles) {
      if (
        !Number.isFinite(candle.time) ||
        !Number.isFinite(candle.open) ||
        !Number.isFinite(candle.high) ||
        !Number.isFinite(candle.low) ||
        !Number.isFinite(candle.close) ||
        !Number.isFinite(candle.volume)
      ) {
        throw new MarketDataProviderError(
          "INVALID_CANDLE",
          `Invalid candle format: ${JSON.stringify(candle)}`,
        )
      }

      // Validate OHLC relationships
      if (candle.high < candle.low) {
        throw new MarketDataProviderError(
          "INVALID_CANDLE",
          `High (${candle.high}) < Low (${candle.low})`,
        )
      }
    }
  }
}

// Export singleton instance
export const marketDataProvider = new MarketDataProvider(
  process.env.NEXT_PUBLIC_MT5_BRIDGE_URL || "http://127.0.0.1:5001",
)
