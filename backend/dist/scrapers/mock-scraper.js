import { EventEmitter } from "events";
// A lightweight mock scraper that simulates price updates for requested tickers.
export class MockScraper extends EventEmitter {
    priceIntervals = new Map();
    basePrices = new Map();
    async addTicker(ticker) {
        const upper = ticker.toUpperCase();
        if (this.priceIntervals.has(upper)) {
            return;
        }
        // Seed a base price if not present
        if (!this.basePrices.has(upper)) {
            // Random plausible starting price
            const seed = 100 + Math.random() * 50000;
            this.basePrices.set(upper, seed);
        }
        // Emit an immediate update
        this.emitUpdate(upper);
        // Start interval updates with small random walk
        const handle = setInterval(() => this.emitUpdate(upper), 1500);
        this.priceIntervals.set(upper, handle);
    }
    async removeTicker(ticker) {
        const upper = ticker.toUpperCase();
        const handle = this.priceIntervals.get(upper);
        if (handle) {
            clearInterval(handle);
            this.priceIntervals.delete(upper);
        }
    }
    async cleanup() {
        for (const h of this.priceIntervals.values()) {
            clearInterval(h);
        }
        this.priceIntervals.clear();
        this.basePrices.clear();
    }
    emitUpdate(ticker) {
        const prev = this.basePrices.get(ticker) ?? 1000;
        // Random walk: +/- up to 1%
        const delta = prev * (Math.random() * 0.02 - 0.01);
        const next = Math.max(0.01, prev + delta);
        this.basePrices.set(ticker, next);
        // Consumers listen for: this.emit("priceUpdate", ticker, price)
        this.emit("priceUpdate", ticker, Number(next.toFixed(2)));
    }
}
