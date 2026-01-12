/**
 * State Management Module
 * The "Truth" Source - All market data lives in memory, not the DOM
 */

// The Market State Map - stores all ticker data
// Key: symbol (e.g., "BTCUSDT")
// Value: { price, change, volume, prevPrice, lastUpdate }
const marketState = new Map();

// The "Dirty" Set - symbols that need re-render this frame
const dirtySymbols = new Set();

// Connection State
const connectionState = {
    status: 'disconnected', // 'live' | 'lagging' | 'disconnected'
    lastMessageTime: 0,
    retryCount: 0,
    latency: 0
};

/**
 * Update market state for a symbol
 * @param {string} symbol - Trading pair symbol
 * @param {object} data - Ticker data from WebSocket
 */
function updateMarketState(symbol, data) {
    const existing = marketState.get(symbol);
    const prevPrice = existing ? parseFloat(existing.price) : parseFloat(data.c);
    
    marketState.set(symbol, {
        price: data.c,           // Current price
        change: data.P,          // 24h percent change
        volume: data.v,          // 24h volume
        prevPrice: prevPrice,
        lastUpdate: Date.now()
    });
    
    // Mark as dirty for next render
    dirtySymbols.add(symbol);
}

/**
 * Get symbol count
 * @returns {number} Number of symbols in state
 */
function getSymbolCount() {
    return marketState.size;
}

/**
 * Clear dirty symbols after render
 */
function clearDirtySymbols() {
    dirtySymbols.clear();
}
