/**
 * UI Controller for Pocket Matching Engine
 */

// Initialize engine
const engine = new MatchingEngine();

// DOM Elements
const buyQtyInput = document.getElementById('buy-qty');
const buyPriceInput = document.getElementById('buy-price');
const sellQtyInput = document.getElementById('sell-qty');
const sellPriceInput = document.getElementById('sell-price');
const btnBuy = document.getElementById('btn-buy');
const btnSell = document.getElementById('btn-sell');
const btnClear = document.getElementById('btn-clear');
const btnSample = document.getElementById('btn-sample');
const btnTheme = document.getElementById('btn-theme');
const buyBookEl = document.getElementById('buy-book');
const sellBookEl = document.getElementById('sell-book');
const tradeLogEl = document.getElementById('trade-log');
const buyCountEl = document.getElementById('buy-count');
const sellCountEl = document.getElementById('sell-count');
const tradeCountEl = document.getElementById('trade-count');
const statVolumeEl = document.getElementById('stat-volume');
const statTradesEl = document.getElementById('stat-trades');
const statLastPriceEl = document.getElementById('stat-last-price');
const statSpreadEl = document.getElementById('stat-spread');

// Trade log state
let tradeLogEmpty = true;

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
}

// Render buy order book
function renderBuyBook() {
    if (engine.buyOrders.length === 0) {
        buyBookEl.innerHTML = `
            <tr class="text-gray-400 dark:text-gray-600">
                <td colspan="4" class="text-center py-8 text-sm">No buy orders</td>
            </tr>
        `;
    } else {
        buyBookEl.innerHTML = engine.buyOrders.map(order => `
            <tr class="border-t border-gray-100 dark:border-gray-800 hover:bg-buy-green-light/30 dark:hover:bg-buy-green/5 transition-colors">
                <td class="py-2 px-2 text-gray-600 dark:text-gray-400">#${order.id}</td>
                <td class="py-2 px-2 text-right text-gray-900 dark:text-white font-semibold">${order.quantity}</td>
                <td class="py-2 px-2 text-right text-buy-green font-semibold">$${order.price.toFixed(2)}</td>
                <td class="py-2 px-2 text-right text-gray-500 dark:text-gray-400 text-xs">${formatTime(order.timestamp)}</td>
            </tr>
        `).join('');
    }
    buyCountEl.textContent = engine.buyOrders.length;
}

// Render sell order book
function renderSellBook() {
    if (engine.sellOrders.length === 0) {
        sellBookEl.innerHTML = `
            <tr class="text-gray-400 dark:text-gray-600">
                <td colspan="4" class="text-center py-8 text-sm">No sell orders</td>
            </tr>
        `;
    } else {
        sellBookEl.innerHTML = engine.sellOrders.map(order => `
            <tr class="border-t border-gray-100 dark:border-gray-800 hover:bg-sell-red-light/30 dark:hover:bg-sell-red/5 transition-colors">
                <td class="py-2 px-2 text-gray-600 dark:text-gray-400">#${order.id}</td>
                <td class="py-2 px-2 text-right text-gray-900 dark:text-white font-semibold">${order.quantity}</td>
                <td class="py-2 px-2 text-right text-sell-red font-semibold">$${order.price.toFixed(2)}</td>
                <td class="py-2 px-2 text-right text-gray-500 dark:text-gray-400 text-xs">${formatTime(order.timestamp)}</td>
            </tr>
        `).join('');
    }
    sellCountEl.textContent = engine.sellOrders.length;
}

// Add trade to log
function addTradeToLog(trade, side) {
    if (tradeLogEmpty) {
        tradeLogEl.innerHTML = '';
        tradeLogEmpty = false;
    }
    
    const tradeEl = document.createElement('div');
    tradeEl.className = `slide-in bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700`;
    
    tradeEl.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold ${side === 'buy' ? 'text-buy-green' : 'text-sell-red'} uppercase tracking-wider flex items-center gap-1">
                <span class="material-icons-round text-sm">${side === 'buy' ? 'trending_up' : 'trending_down'}</span>
                Trade Executed
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${formatTime(trade.timestamp)}</span>
        </div>
        <div class="flex items-baseline gap-2">
            <span class="text-lg font-mono font-bold text-gray-900 dark:text-white">${trade.quantity}</span>
            <span class="text-gray-500 dark:text-gray-400">@</span>
            <span class="text-lg font-mono font-bold text-primary">$${trade.price.toFixed(2)}</span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Buy #${trade.buyOrderId} ↔ Sell #${trade.sellOrderId}
        </div>
    `;
    
    tradeLogEl.insertBefore(tradeEl, tradeLogEl.firstChild);
    
    // Keep only last 50 trades visible
    while (tradeLogEl.children.length > 50) {
        tradeLogEl.removeChild(tradeLogEl.lastChild);
    }
}

// Add remaining order notification to log
function addRemainingToLog(order) {
    if (tradeLogEmpty) {
        tradeLogEl.innerHTML = '';
        tradeLogEmpty = false;
    }
    
    const remainingEl = document.createElement('div');
    remainingEl.className = `slide-in bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800`;
    
    remainingEl.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span class="material-icons-round text-sm">pending</span>
                Remaining ${order.side === 'buy' ? 'Buy' : 'Sell'}
            </span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${formatTime(Date.now())}</span>
        </div>
        <div class="flex items-baseline gap-2">
            <span class="text-lg font-mono font-bold text-gray-900 dark:text-white">${order.quantity}</span>
            <span class="text-gray-500 dark:text-gray-400">@</span>
            <span class="text-lg font-mono font-bold ${order.side === 'buy' ? 'text-buy-green' : 'text-sell-red'}">$${order.price.toFixed(2)}</span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Order #${order.id} added to book
        </div>
    `;
    
    tradeLogEl.insertBefore(remainingEl, tradeLogEl.firstChild);
}

// Update statistics
function updateStats() {
    statVolumeEl.textContent = engine.getTotalVolume().toLocaleString();
    statTradesEl.textContent = engine.trades.length.toLocaleString();
    
    const lastPrice = engine.getLastTradePrice();
    statLastPriceEl.textContent = lastPrice ? `$${lastPrice.toFixed(2)}` : '—';
    
    const spread = engine.getSpread();
    if (spread) {
        statSpreadEl.textContent = `$${spread.spread}`;
    } else {
        statSpreadEl.textContent = '—';
    }
    
    tradeCountEl.textContent = `${engine.trades.length} trades`;
}

// Handle buy order
function handleBuyOrder() {
    const qty = parseInt(buyQtyInput.value);
    const price = parseFloat(buyPriceInput.value);
    
    if (isNaN(qty) || qty <= 0) {
        buyQtyInput.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => buyQtyInput.classList.remove('ring-2', 'ring-red-500'), 1000);
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        buyPriceInput.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => buyPriceInput.classList.remove('ring-2', 'ring-red-500'), 1000);
        return;
    }
    
    const result = engine.addOrder('buy', qty, price);
    
    if (result.success) {
        // Flash effect
        btnBuy.classList.add('flash-buy');
        setTimeout(() => btnBuy.classList.remove('flash-buy'), 300);
        
        // Log trades
        result.trades.forEach(trade => addTradeToLog(trade, 'buy'));
        
        // If order has remaining quantity, log it
        if (result.order.quantity > 0) {
            addRemainingToLog(result.order);
        }
        
        renderBuyBook();
        renderSellBook();
        updateStats();
    }
}

// Handle sell order
function handleSellOrder() {
    const qty = parseInt(sellQtyInput.value);
    const price = parseFloat(sellPriceInput.value);
    
    if (isNaN(qty) || qty <= 0) {
        sellQtyInput.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => sellQtyInput.classList.remove('ring-2', 'ring-red-500'), 1000);
        return;
    }
    
    if (isNaN(price) || price <= 0) {
        sellPriceInput.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => sellPriceInput.classList.remove('ring-2', 'ring-red-500'), 1000);
        return;
    }
    
    const result = engine.addOrder('sell', qty, price);
    
    if (result.success) {
        // Flash effect
        btnSell.classList.add('flash-sell');
        setTimeout(() => btnSell.classList.remove('flash-sell'), 300);
        
        // Log trades
        result.trades.forEach(trade => addTradeToLog(trade, 'sell'));
        
        // If order has remaining quantity, log it
        if (result.order.quantity > 0) {
            addRemainingToLog(result.order);
        }
        
        renderBuyBook();
        renderSellBook();
        updateStats();
    }
}

// Clear all
function handleClear() {
    engine.clear();
    tradeLogEl.innerHTML = `
        <div class="text-gray-400 dark:text-gray-600 text-sm text-center py-8">
            <span class="material-icons-round text-4xl mb-2 block opacity-50">hourglass_empty</span>
            Waiting for trades...
        </div>
    `;
    tradeLogEmpty = true;
    renderBuyBook();
    renderSellBook();
    updateStats();
}

// Run sample demo
async function runSampleDemo() {
    handleClear();
    
    const orders = [
        { side: 'buy', qty: 10, price: 100 },
        { side: 'buy', qty: 5, price: 100 },
        { side: 'sell', qty: 12, price: 100 },
    ];
    
    btnSample.disabled = true;
    btnSample.innerHTML = '<span class="material-icons-round text-lg animate-spin">sync</span> Running...';
    
    for (const order of orders) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (order.side === 'buy') {
            buyQtyInput.value = order.qty;
            buyPriceInput.value = order.price.toFixed(2);
            handleBuyOrder();
        } else {
            sellQtyInput.value = order.qty;
            sellPriceInput.value = order.price.toFixed(2);
            handleSellOrder();
        }
    }
    
    btnSample.disabled = false;
    btnSample.innerHTML = '<span class="material-icons-round text-lg">play_arrow</span> Run Demo';
}

// Keyboard shortcuts
function handleKeydown(e) {
    if (e.key === 'Enter') {
        if (document.activeElement === buyQtyInput || document.activeElement === buyPriceInput) {
            handleBuyOrder();
        } else if (document.activeElement === sellQtyInput || document.activeElement === sellPriceInput) {
            handleSellOrder();
        }
    }
}

// Event listeners
btnBuy.addEventListener('click', handleBuyOrder);
btnSell.addEventListener('click', handleSellOrder);
btnClear.addEventListener('click', handleClear);
btnSample.addEventListener('click', runSampleDemo);
btnTheme.addEventListener('click', toggleTheme);
document.addEventListener('keydown', handleKeydown);

// Initialize
initTheme();
renderBuyBook();
renderSellBook();
updateStats();
