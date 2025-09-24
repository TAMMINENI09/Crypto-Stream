# Crypto Stream 🚀  
Real-time Cryptocurrency Price Tracker  

## 📖 Overview  
**Crypto Stream** is a full-stack web application that streams live cryptocurrency prices directly from [TradingView](https://tradingview.com). It features a **Node.js backend** powered by Playwright for real-time scraping, and a **Next.js frontend** that displays instant updates via ConnectRPC.  

The project demonstrates low-latency data streaming, scalable server design, and seamless frontend–backend communication.  

---

## ⚙️ Tech Stack  
- **Frontend:** Next.js (TypeScript, React)  
- **Backend:** Node.js + Playwright  
- **Communication:** ConnectRPC  
- **Package Management:** pnpm  
- **Execution:** tsx for TypeScript  

---

## ✨ Features  
- 🔴 **Real-time streaming** of crypto prices from TradingView  
- 📈 **Add/remove tickers** dynamically (BTCUSD, ETHUSD, SOLUSD, etc.)  
- ⚡ **Low-latency push updates** (no polling)  
- 🖥️ **Headed Playwright browser** to observe live automation  
- 📋 **Alphabetically sorted tickers** in the UI  
- 🛡️ **Scalable architecture** for multiple concurrent clients  

---

## 🚀 Getting Started  

### 1. Install dependencies  
```bash
pnpm install --recursive
