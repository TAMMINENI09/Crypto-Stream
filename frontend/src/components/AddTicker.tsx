"use client";

import { useState, FormEvent } from "react";

interface AddTickerProps {
  onAdd: (ticker: string) => void;
  isLoading: boolean;
}

export default function AddTicker({ onAdd, isLoading }: AddTickerProps) {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTicker = ticker.trim().toUpperCase();

    if (trimmedTicker) {
      console.log(`🔤 Adding ticker from input: ${trimmedTicker}`);
      onAdd(trimmedTicker);
      setTicker("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-ticker">
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        placeholder="Enter ticker (e.g., BTCUSD, ETHUSD)"
        className="input"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="button"
        disabled={!ticker.trim() || isLoading}
      >
        {isLoading ? "Adding..." : "Add Ticker"}
      </button>
    </form>
  );
}
