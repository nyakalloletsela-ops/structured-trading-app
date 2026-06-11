import { supabase } from '@/lib/supabase'
import type { Signal } from '@/types'

export const signalService = {
  async saveSignal(signal: Signal): Promise<void> {
    const { error } = await supabase.from('signals').insert([
      {
        id: signal.id,
        symbol: signal.symbol,
        type: signal.type,
        price: signal.price,
        score: signal.score,
        confidence: signal.confidence,
        data: {
          reason: signal.reason,
          timestamp: signal.timestamp,
        },
      },
    ])

    if (error) {
      console.error('Error saving signal:', error)
      throw error
    }
  },

  async getSignals(symbol: string, limit: number = 50): Promise<Signal[]> {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('symbol', symbol)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching signals:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      symbol: row.symbol,
      type: row.type,
      price: row.price,
      timestamp: new Date(row.created_at).getTime(),
      score: row.score,
      confidence: row.confidence,
      reason: row.data?.reason || '',
    }))
  },
}
