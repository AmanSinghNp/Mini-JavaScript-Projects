/**
 * Pocket Matching Engine
 * Implements Price-Time Priority order matching algorithm
 */

class Order {
    constructor(side, quantity, price) {
        this.id = Order.nextId++;
        this.side = side; // 'buy' or 'sell'
        this.quantity = quantity;
        this.originalQuantity = quantity;
        this.price = parseFloat(price.toFixed(2));
        this.timestamp = Date.now();
        this.status = 'active'; // 'active', 'filled', 'partial', 'cancelled'
    }
    
    static nextId = 1;
    
    static resetIdCounter() {
        Order.nextId = 1;
    }
}

class Trade {
    constructor(buyOrderId, sellOrderId, quantity, price) {
        this.id = Trade.nextId++;
        this.buyOrderId = buyOrderId;
        this.sellOrderId = sellOrderId;
        this.quantity = quantity;
        this.price = price;
        this.timestamp = Date.now();
    }
    
    static nextId = 1;
    
    static resetIdCounter() {
        Trade.nextId = 1;
    }
}

class MatchingEngine {
    constructor() {
        this.buyOrders = []; // Sorted by price DESC, then time ASC (best bid first)
        this.sellOrders = []; // Sorted by price ASC, then time ASC (best ask first)
        this.trades = [];
        this.onTradeExecuted = null;
        this.onOrderBookUpdated = null;
        this.onOrderAdded = null;
    }
    
    /**
     * Add a new order to the book and attempt to match
     * @param {string} side - 'buy' or 'sell'
     * @param {number} quantity - Order quantity
     * @param {number} price - Limit price
     * @returns {Object} Result with order and any trades
     */
    addOrder(side, quantity, price) {
        if (quantity <= 0 || price <= 0) {
            return { success: false, error: 'Invalid quantity or price' };
        }
        
        const order = new Order(side, quantity, price);
        const trades = [];
        
        if (side === 'buy') {
            // Try to match with sell orders
            trades.push(...this.matchBuyOrder(order));
            
            // If order not fully filled, add to book
            if (order.quantity > 0) {
                this.insertBuyOrder(order);
            }
        } else {
            // Try to match with buy orders
            trades.push(...this.matchSellOrder(order));
            
            // If order not fully filled, add to book
            if (order.quantity > 0) {
                this.insertSellOrder(order);
            }
        }
        
        // Trigger callbacks
        if (this.onOrderAdded && order.quantity > 0) {
            this.onOrderAdded(order);
        }
        
        if (this.onOrderBookUpdated) {
            this.onOrderBookUpdated(this.buyOrders, this.sellOrders);
        }
        
        return { success: true, order, trades };
    }
    
    /**
     * Match incoming buy order against sell orders
     */
    matchBuyOrder(buyOrder) {
        const trades = [];
        
        while (buyOrder.quantity > 0 && this.sellOrders.length > 0) {
            const bestSell = this.sellOrders[0];
            
            // Check if prices cross (buy price >= sell price)
            if (buyOrder.price < bestSell.price) {
                break; // No match possible
            }
            
            // Execute trade at the resting order's price (sell order price)
            const tradeQty = Math.min(buyOrder.quantity, bestSell.quantity);
            const tradePrice = bestSell.price;
            
            const trade = new Trade(buyOrder.id, bestSell.id, tradeQty, tradePrice);
            this.trades.push(trade);
            trades.push(trade);
            
            // Update quantities
            buyOrder.quantity -= tradeQty;
            bestSell.quantity -= tradeQty;
            
            // Update order statuses
            if (buyOrder.quantity === 0) {
                buyOrder.status = 'filled';
            } else {
                buyOrder.status = 'partial';
            }
            
            if (bestSell.quantity === 0) {
                bestSell.status = 'filled';
                this.sellOrders.shift(); // Remove filled order
            } else {
                bestSell.status = 'partial';
            }
            
            // Trigger trade callback
            if (this.onTradeExecuted) {
                this.onTradeExecuted(trade, buyOrder, bestSell);
            }
        }
        
        return trades;
    }
    
    /**
     * Match incoming sell order against buy orders
     */
    matchSellOrder(sellOrder) {
        const trades = [];
        
        while (sellOrder.quantity > 0 && this.buyOrders.length > 0) {
            const bestBuy = this.buyOrders[0];
            
            // Check if prices cross (sell price <= buy price)
            if (sellOrder.price > bestBuy.price) {
                break; // No match possible
            }
            
            // Execute trade at the resting order's price (buy order price)
            const tradeQty = Math.min(sellOrder.quantity, bestBuy.quantity);
            const tradePrice = bestBuy.price;
            
            const trade = new Trade(bestBuy.id, sellOrder.id, tradeQty, tradePrice);
            this.trades.push(trade);
            trades.push(trade);
            
            // Update quantities
            sellOrder.quantity -= tradeQty;
            bestBuy.quantity -= tradeQty;
            
            // Update order statuses
            if (sellOrder.quantity === 0) {
                sellOrder.status = 'filled';
            } else {
                sellOrder.status = 'partial';
            }
            
            if (bestBuy.quantity === 0) {
                bestBuy.status = 'filled';
                this.buyOrders.shift(); // Remove filled order
            } else {
                bestBuy.status = 'partial';
            }
            
            // Trigger trade callback
            if (this.onTradeExecuted) {
                this.onTradeExecuted(trade, bestBuy, sellOrder);
            }
        }
        
        return trades;
    }
    
    /**
     * Insert buy order maintaining price-time priority
     * Sorted by price DESC, then timestamp ASC
     */
    insertBuyOrder(order) {
        let insertIndex = this.buyOrders.length;
        
        for (let i = 0; i < this.buyOrders.length; i++) {
            const existing = this.buyOrders[i];
            
            // Higher price comes first
            if (order.price > existing.price) {
                insertIndex = i;
                break;
            }
            // Same price: earlier time comes first
            if (order.price === existing.price && order.timestamp < existing.timestamp) {
                insertIndex = i;
                break;
            }
        }
        
        this.buyOrders.splice(insertIndex, 0, order);
    }
    
    /**
     * Insert sell order maintaining price-time priority
     * Sorted by price ASC, then timestamp ASC
     */
    insertSellOrder(order) {
        let insertIndex = this.sellOrders.length;
        
        for (let i = 0; i < this.sellOrders.length; i++) {
            const existing = this.sellOrders[i];
            
            // Lower price comes first
            if (order.price < existing.price) {
                insertIndex = i;
                break;
            }
            // Same price: earlier time comes first
            if (order.price === existing.price && order.timestamp < existing.timestamp) {
                insertIndex = i;
                break;
            }
        }
        
        this.sellOrders.splice(insertIndex, 0, order);
    }
    
    /**
     * Get the current spread (best ask - best bid)
     */
    getSpread() {
        if (this.buyOrders.length === 0 || this.sellOrders.length === 0) {
            return null;
        }
        
        const bestBid = this.buyOrders[0].price;
        const bestAsk = this.sellOrders[0].price;
        
        return {
            bid: bestBid,
            ask: bestAsk,
            spread: (bestAsk - bestBid).toFixed(2)
        };
    }
    
    /**
     * Get total volume traded
     */
    getTotalVolume() {
        return this.trades.reduce((sum, trade) => sum + trade.quantity, 0);
    }
    
    /**
     * Get last trade price
     */
    getLastTradePrice() {
        if (this.trades.length === 0) return null;
        return this.trades[this.trades.length - 1].price;
    }
    
    /**
     * Clear all orders and trades
     */
    clear() {
        this.buyOrders = [];
        this.sellOrders = [];
        this.trades = [];
        Order.resetIdCounter();
        Trade.resetIdCounter();
        
        if (this.onOrderBookUpdated) {
            this.onOrderBookUpdated(this.buyOrders, this.sellOrders);
        }
    }
}

// Export for use
window.MatchingEngine = MatchingEngine;
window.Order = Order;
window.Trade = Trade;
