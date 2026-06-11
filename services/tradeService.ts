import { supabase } from '@/lib/supabase'
import type { TradeJournal } from '@/types'

export const tradeService = {
  async saveTrade(trade: TradeJournal): Promise<void> {
    const { error } = await supabase.from('trades').insert([
      {
        id: trade.id,
        symbol: trade.symbol,
        entry_price: trade.entryPrice,
        entry_time: trade.entryTime,
        exit_price: trade.exitPrice || null,
        exit_time: trade.exitTime || null,
        type: trade.type,
        size: trade.size,
        pnl: trade.pnl || null,
        notes: trade.notes || null,
      },
    ])

    if (error) {
      console.error('Error saving trade:', error)
      throw error
    }
  },

  async getTrades(limit: number = 100): Promise<TradeJournal[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching trades:', error)
      return []
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      symbol: row.symbol,
      entryPrice: row.entry_price,
      entryTime: row.entry_time,
      exitPrice: row.exit_price,
      exitTime: row.exit_time,
      type: row.type,
      size: row.size,
      pnl: row.pnl,
      notes: row.notes,
      signal: {} as any,
    }))
  },

  async updateTrade(tradeId: string, updates: Partial<TradeJournal>): Promise<void> {
    const { error } = await supabase
      .from('trades')
      .update({
        exit_price: updates.exitPrice,
        exit_time: updates.exitTime,
        pnl: updates.pnl,
        notes: updates.notes,
      })
      .eq('id', tradeId)

    if (error) {
      console.error('Error updating trade:', error)
      throw error
    }
  },
}
