/**
 * WebSocket Module
 * Handles connection to Binance All Tickers stream with exponential backoff
 */

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
const MAX_RETRY_DELAY = 30000; // 30 seconds max
const BASE_RETRY_DELAY = 1000; // 1 second base

let socket = null;
let reconnectTimeout = null;

/**
 * Calculate exponential backoff delay
 * @returns {number} Delay in milliseconds
 */
function getRetryDelay() {
    const delay = Math.min(
        BASE_RETRY_DELAY * Math.pow(2, connectionState.retryCount),
        MAX_RETRY_DELAY
    );
    return delay;
}

/**
 * Update connection status
 * @param {string} status - 'live' | 'lagging' | 'disconnected'
 */
function setConnectionStatus(status) {
    connectionState.status = status;
}

/**
 * Connect to Binance WebSocket
 */
function connect() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return; // Already connected
    }

    console.log('[WebSocket] Connecting to Binance stream...');
    setConnectionStatus('disconnected');
    
    try {
        socket = new WebSocket(BINANCE_WS_URL);
    } catch (error) {
        console.error('[WebSocket] Failed to create WebSocket:', error);
        scheduleReconnect();
        return;
    }

    socket.onopen = () => {
        console.log('[WebSocket] Connected successfully!');
        connectionState.retryCount = 0;
        connectionState.lastMessageTime = Date.now();
        setConnectionStatus('live');
    };

    socket.onmessage = (event) => {
        const now = Date.now();
        connectionState.latency = now - connectionState.lastMessageTime;
        connectionState.lastMessageTime = now;
        
        // Update status based on latency (>200ms is lagging)
        if (connectionState.latency > 200) {
            setConnectionStatus('lagging');
        } else {
            setConnectionStatus('live');
        }

        try {
            const data = JSON.parse(event.data);
            
            // data is an array of ticker updates
            if (Array.isArray(data)) {
                data.forEach(ticker => {
                    // Only process if it has required fields
                    if (ticker.s && ticker.c) {
                        updateMarketState(ticker.s, ticker);
                    }
                });
            }
        } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
        }
    };

    socket.onclose = (event) => {
        console.log(`[WebSocket] Connection closed. Code: ${event.code}`);
        setConnectionStatus('disconnected');
        scheduleReconnect();
    };

    socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionStatus('disconnected');
    };
}

/**
 * Schedule a reconnection with exponential backoff
 */
function scheduleReconnect() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }

    const delay = getRetryDelay();
    connectionState.retryCount++;
    
    console.log(`[WebSocket] Reconnecting in ${delay / 1000}s... (attempt ${connectionState.retryCount})`);
    
    reconnectTimeout = setTimeout(() => {
        connect();
    }, delay);
}

/**
 * Disconnect from WebSocket
 */
function disconnect() {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
    }
    
    if (socket) {
        socket.close();
        socket = null;
    }
    
    setConnectionStatus('disconnected');
}

/**
 * Check if WebSocket is connected
 * @returns {boolean}
 */
function isConnected() {
    return socket && socket.readyState === WebSocket.OPEN;
}
