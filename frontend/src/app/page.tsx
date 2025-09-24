"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { priceClient } from "@/lib/connect-client";
import AddTicker from "@/components/AddTicker";
import TickerList from "@/components/TickerList";

interface TickerData {
  symbol: string;
  price: number;
  timestamp: number;
}

export default function Home() {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const activeStreams = useRef<Map<string, AbortController>>(new Map());

  const addTicker = useCallback(async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase();

    if (tickers.has(upperSymbol)) {
      setError(`${upperSymbol} is already being tracked`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    console.log(`➕ Adding ticker: ${upperSymbol}`);
    setLoading((prev) => new Set([...prev, upperSymbol]));
    setError(null);

    try {
      // Subscribe to ticker
      const response = await priceClient.subscribe({ ticker: upperSymbol });

      if (!response.success) {
        throw new Error(response.message);
      }

      // Start streaming prices
      const abortController = new AbortController();
      activeStreams.current.set(upperSymbol, abortController);

      const stream = priceClient.streamPrices(
        { ticker: upperSymbol },
        { signal: abortController.signal }
      );

      // Handle stream
      (async () => {
        try {
          for await (const update of stream) {
            console.log(`💹 Price update: ${update.ticker} = $${update.price}`);
            setTickers((prev) => {
              const newTickers = new Map(prev);
              newTickers.set(update.ticker, {
                symbol: update.ticker,
                price: update.price,
                timestamp: Number(update.timestamp),
              });
              return newTickers;
            });
          }
        } catch (error: any) {
          if (error.name !== "AbortError") {
            console.error(`Stream error for ${upperSymbol}:`, error);
          }
        }
      })();

      console.log(`✅ Successfully added ${upperSymbol}`);
    } catch (error: any) {
      console.error(`❌ Failed to add ${upperSymbol}:`, error);
      setError(`Failed to add ${upperSymbol}: ${error.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading((prev) => {
        const newLoading = new Set(prev);
        newLoading.delete(upperSymbol);
        return newLoading;
      });
    }
  }, [tickers]);

  const removeTicker = useCallback(async (symbol: string) => {
    console.log(`➖ Removing ticker: ${symbol}`);

    try {
      // Abort the stream
      const controller = activeStreams.current.get(symbol);
      if (controller) {
        controller.abort();
        activeStreams.current.delete(symbol);
      }

      // Unsubscribe from ticker
      await priceClient.unsubscribe({ ticker: symbol });

      // Remove from state
      setTickers((prev) => {
        const newTickers = new Map(prev);
        newTickers.delete(symbol);
        return newTickers;
      });

      console.log(`✅ Successfully removed ${symbol}`);
    } catch (error: any) {
      console.error(`❌ Failed to remove ${symbol}:`, error);
      setError(`Failed to remove ${symbol}: ${error.message}`);
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeStreams.current.forEach((controller) => controller.abort());
    };
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Crypto Stream</h1>
        <p className="subtitle">Real-time Cryptocurrency Price Tracker</p>
      </header>

      {
        error && (
          <div className="error">
            {error}
          </div>
        )
      }

      <AddTicker onAdd={addTicker} isLoading={loading.size > 0} />
      <TickerList
        tickers={tickers}
        onRemove={removeTicker}
        loadingTickers={loading}
      />
    </div >
  );
}
