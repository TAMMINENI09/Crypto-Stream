"use client";

import { useMemo } from "react";

interface TickerData {
  symbol: string;
  price: number;
  timestamp: number;
}

interface TickerListProps {
  tickers: Map<string, TickerData>;
  onRemove: (ticker: string) => void;
  loadingTickers: Set<string>;
}

export default function TickerList({ tickers, onRemove, loadingTickers }: TickerListProps) {
  const sortedTickers = useMemo(() => {
    return Array.from(tickers.values()).sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
  }, [tickers]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (price >= 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(8);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (sortedTickers.length === 0 && loadingTickers.size === 0) {
    return (
      <div className="loading">
        <p>No tickers added yet. Add a ticker to start tracking prices!</p>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Try: BTCUSD, ETHUSD, SOLUSD, ADAUSD, DOTUSD
        </p>
      </div>
    );
  }

  return (
    <div className="ticker-grid">
      {loadingTickers.size > 0 && Array.from(loadingTickers).map((ticker) => (
        <div key={`loading-${ticker}`} className="ticker-card pulse">
          <div className="ticker-symbol">{ticker}</div>
          <div className="ticker-price">Loading...</div>
          <div className="ticker-timestamp">Connecting...</div>
        </div>
      ))}

      {sortedTickers.map((ticker) => (
        <div key={ticker.symbol} className="ticker-card">
          <div className="ticker-symbol">{ticker.symbol}</div>
          <div className="ticker-price">${formatPrice(ticker.price)}</div>
          <div className="ticker-timestamp">
            Last updated: {formatTimestamp(ticker.timestamp)}
          </div>
          <button
            className="remove-button"
            onClick={() => onRemove(ticker.symbol)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
