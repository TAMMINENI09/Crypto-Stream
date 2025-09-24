import { SubscribeResponse, UnsubscribeResponse, PriceUpdate, } from "../gen/price_pb";
import { TradingViewScraper } from "../scrapers/tradingview-scraper.js";
import { MockScraper } from "../scrapers/mock-scraper.js";
export class PriceServiceImpl {
    scraper;
    subscribers = new Map();
    constructor() {
        const useMock = process.env.USE_MOCK_SCRAPER === "true";
        this.scraper = useMock ? new MockScraper() : new TradingViewScraper();
        this.scraper.on("priceUpdate", (ticker, price) => {
            this.broadcastPriceUpdate(ticker, price);
        });
    }
    async subscribe(req) {
        const ticker = req.ticker.toUpperCase();
        console.log(`📊 Subscribe request for ${ticker}`);
        try {
            await this.scraper.addTicker(ticker);
            return new SubscribeResponse({
                success: true,
                message: `Subscribed to ${ticker}`,
            });
        }
        catch (error) {
            console.error(`❌ Failed to subscribe to ${ticker}:`, error);
            return new SubscribeResponse({
                success: false,
                message: `Failed to subscribe to ${ticker}: ${error}`,
            });
        }
    }
    async unsubscribe(req) {
        const ticker = req.ticker.toUpperCase();
        console.log(`🚫 Unsubscribe request for ${ticker}`);
        try {
            await this.scraper.removeTicker(ticker);
            this.subscribers.delete(ticker);
            return new UnsubscribeResponse({
                success: true,
                message: `Unsubscribed from ${ticker}`,
            });
        }
        catch (error) {
            console.error(`❌ Failed to unsubscribe from ${ticker}:`, error);
            return new UnsubscribeResponse({
                success: false,
                message: `Failed to unsubscribe from ${ticker}: ${error}`,
            });
        }
    }
    async *streamPrices(req) {
        const ticker = req.ticker.toUpperCase();
        console.log(`📡 Starting price stream for ${ticker}`);
        const updateQueue = [];
        let resolve = null;
        const handler = (update) => {
            updateQueue.push(update);
            if (resolve) {
                resolve();
                resolve = null;
            }
        };
        // Add handler to subscribers
        if (!this.subscribers.has(ticker)) {
            this.subscribers.set(ticker, new Set());
        }
        this.subscribers.get(ticker).add(handler);
        try {
            while (true) {
                if (updateQueue.length > 0) {
                    yield updateQueue.shift();
                }
                else {
                    await new Promise((r) => {
                        resolve = r;
                    });
                }
            }
        }
        finally {
            // Clean up
            const subs = this.subscribers.get(ticker);
            if (subs) {
                subs.delete(handler);
                if (subs.size === 0) {
                    this.subscribers.delete(ticker);
                }
            }
        }
    }
    broadcastPriceUpdate(ticker, price) {
        const update = new PriceUpdate({
            ticker,
            price,
            timestamp: BigInt(Date.now()),
        });
        const subs = this.subscribers.get(ticker);
        if (subs) {
            console.log(`💰 Broadcasting price update: ${ticker} = $${price}`);
            subs.forEach((handler) => handler(update));
        }
    }
}
