'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function TradingDashboard() {
  const [signals, setSignals] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const prevRef = useRef<any>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/signals');
        const data = await res.json();
        setSignals(data);
      } catch {
        setSignals({ signals: [] });
      }
      setLoading(false);
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  const list = signals?.signals || [];

  // normalize signal shape (CRITICAL FIX)
  const normalized = list.map((item: any) => {
    const signal = item.signal ?? item; // 👈 FIX: supports both shapes

    const prev = prevRef.current[item.symbol];

    const changed = prev && prev.type !== signal.type;

    return {
      symbol: item.symbol,
      signal,
      changed,
      isNew: !prev,
    };
  });

  useEffect(() => {
    const map: any = {};

    for (const item of list) {
      const signal = item.signal ?? item;
      map[item.symbol] = signal;
    }

    prevRef.current = map;
  }, [list]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}
      <header className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">Trading Terminal</h1>
        <p className="text-xs text-slate-400">
          {loading ? 'Loading...' : 'LIVE'}
        </p>
      </header>

      {/* BODY */}
      <main className="p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {normalized.map((item: any, i: number) => (
            <div
              key={i}
              className={`p-4 border rounded bg-slate-900 ${
                item.changed ? 'border-yellow-500' : 'border-slate-800'
              }`}
            >

              <div className="flex justify-between">
                <span className="font-bold">{item.symbol}</span>

                <div className="flex gap-2">
                  {item.isNew && (
                    <span className="text-green-400 text-xs">NEW</span>
                  )}
                  {item.changed && (
                    <span className="text-yellow-400 text-xs">UPDATED</span>
                  )}
                </div>
              </div>

              {/* SAFE RENDERING */}
              <div className="mt-3 text-sm text-slate-300 space-y-1">
                <p>Type: {item.signal?.type ?? 'N/A'}</p>
                <p>Bias: {item.signal?.bias ?? 'N/A'}</p>
                <p>Score: {item.signal?.score ?? 'N/A'}</p>
                <p>Price: {item.signal?.price ?? 'N/A'}</p>
              </div>

            </div>
          ))}

        </div>

      </main>
    </div>
  );
}