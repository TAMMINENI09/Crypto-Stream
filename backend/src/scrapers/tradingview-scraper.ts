import { chromium, Browser, Page } from "playwright";
import { EventEmitter } from "events";

export class TradingViewScraper extends EventEmitter {
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private priceIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log("🌐 Launching browser in headed mode...");
    this.browser = await chromium.launch({
      headless: false, // Headed mode as required
      args: ["--disable-blink-features=AutomationControlled"],
    });
    this.isInitialized = true;
    console.log("✅ Browser launched successfully");
  }

  async addTicker(ticker: string) {
    await this.initialize();

    if (this.pages.has(ticker)) {
      console.log(`⚠️  ${ticker} is already being tracked`);
      return;
    }

    console.log(`🔍 Adding ticker ${ticker}...`);
    const page = await this.browser!.newPage();

    // Set viewport and user agent
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    const url = `https://www.tradingview.com/symbols/${ticker}/?exchange=BINANCE`;
    console.log(`📍 Navigating to ${url}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for initial load

      this.pages.set(ticker, page);

      // Start scraping prices
      this.startPriceScraping(ticker, page);

      console.log(`✅ Successfully added ${ticker}`);
    } catch (error) {
      console.error(`❌ Failed to load page for ${ticker}:`, error);
      await page.close();
      throw error;
    }
  }

  private startPriceScraping(ticker: string, page: Page) {
    console.log(`🔄 Starting price scraping for ${ticker}`);

    const scrapePrice = async () => {
      try {
        // Multiple selectors for price element
        const priceSelectors = [
          '[data-symbol-short] .js-symbol-last',
          '.tv-symbol-price-quote__value',
          '[class*="priceValue"]',
          'span[class*="lastPrice"]',
          'div[class*="priceWrapper"] span[class*="price-"]:first-child'
        ];

        let priceText: string | null = null;

        for (const selector of priceSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              priceText = await element.textContent();
              if (priceText) break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }

        if (!priceText) {
          // Fallback: try to get any element with price-like content
          priceText = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            for (const el of elements) {
              const text = el.textContent || '';
              // Look for price pattern (number with optional comma and decimal)
              if (/^\s*[\d,]+\.?\d*\s*$/.test(text) && text.length > 0 && text.length < 20) {
                const num = parseFloat(text.replace(/,/g, ''));
                if (num > 0 && num < 1000000) {
                  return text;
                }
              }
            }
            return null;
          });
        }

        if (priceText) {
          const price = parseFloat(priceText.replace(/,/g, '').replace(/[^0-9.]/g, ''));

          if (!isNaN(price) && price > 0) {
            console.log(`📈 ${ticker}: $${price}`);
            this.emit("priceUpdate", ticker, price);
          }
        }
      } catch (error) {
        console.error(`⚠️  Error scraping ${ticker}:`, error);
      }
    };

    // Initial scrape
    scrapePrice();

    // Set up interval for continuous scraping
    const interval = setInterval(scrapePrice, 2000); // Update every 2 seconds
    this.priceIntervals.set(ticker, interval);
  }

  async removeTicker(ticker: string) {
    console.log(`🗑️  Removing ticker ${ticker}...`);

    // Clear interval
    const interval = this.priceIntervals.get(ticker);
    if (interval) {
      clearInterval(interval);
      this.priceIntervals.delete(ticker);
    }

    // Close page
    const page = this.pages.get(ticker);
    if (page) {
      await page.close();
      this.pages.delete(ticker);
    }

    console.log(`✅ Removed ${ticker}`);
  }

  async cleanup() {
    console.log("🧹 Cleaning up scraper...");

    // Clear all intervals
    for (const interval of this.priceIntervals.values()) {
      clearInterval(interval);
    }
    this.priceIntervals.clear();

    // Close all pages
    for (const page of this.pages.values()) {
      await page.close();
    }
    this.pages.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    this.isInitialized = false;
    console.log("✅ Cleanup complete");
  }
}
