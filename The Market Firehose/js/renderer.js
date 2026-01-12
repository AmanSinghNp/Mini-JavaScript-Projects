/**
 * Renderer Module
 * Game Loop Pattern - syncs DOM updates with requestAnimationFrame
 */

// DOM element cache for O(1) lookups
const rowMap = new Map(); // symbol -> { cells: { symbol, price, change, volume }, rowFragment }

// DOM References (cached on init)
let tickerGrid = null;
let statusDot = null;
let statusText = null;
let symbolCount = null;
let latencyDisplay = null;
let emptyState = null;

// Flash duration in ms
const FLASH_DURATION = 300;

// Track created rows for ordering
let rowCount = 0;

/**
 * Initialize DOM references
 */
function initRenderer() {
    tickerGrid = document.getElementById('ticker-grid');
    statusDot = document.getElementById('status-dot');
    statusText = document.getElementById('status-text');
    symbolCount = document.getElementById('symbol-count');
    latencyDisplay = document.getElementById('latency');
    emptyState = document.getElementById('empty-state');
}

/**
 * Format number with appropriate decimals
 * @param {string|number} value 
 * @param {number} decimals 
 * @returns {string}
 */
function formatNumber(value, decimals = 2) {
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    
    // For very small numbers, show more decimals
    if (num < 0.001) {
        return num.toFixed(8);
    } else if (num < 1) {
        return num.toFixed(6);
    } else if (num < 1000) {
        return num.toFixed(decimals);
    } else {
        return num.toLocaleString('en-US', { 
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals 
        });
    }
}

/**
 * Format volume (abbreviate large numbers)
 * @param {string|number} value 
 * @returns {string}
 */
function formatVolume(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return '--';
    
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

/**
 * Create a new row for a symbol
 * @param {string} symbol 
 * @param {object} data 
 */
function createRow(symbol, data) {
    // Create cells
    const symbolCell = document.createElement('div');
    symbolCell.className = 'cell text-left symbol';
    symbolCell.textContent = symbol;

    const priceCell = document.createElement('div');
    priceCell.className = 'cell text-right price-cell';
    priceCell.textContent = formatNumber(data.price);

    const changeCell = document.createElement('div');
    changeCell.className = 'cell text-right';
    const changeValue = parseFloat(data.change);
    changeCell.textContent = (changeValue >= 0 ? '+' : '') + changeValue.toFixed(2) + '%';
    changeCell.classList.add(changeValue >= 0 ? 'text-up' : 'text-down');

    const volumeCell = document.createElement('div');
    volumeCell.className = 'cell text-right hide-mobile';
    volumeCell.textContent = formatVolume(data.volume);

    // Append to grid
    tickerGrid.appendChild(symbolCell);
    tickerGrid.appendChild(priceCell);
    tickerGrid.appendChild(changeCell);
    tickerGrid.appendChild(volumeCell);

    // Cache references
    rowMap.set(symbol, {
        cells: {
            symbol: symbolCell,
            price: priceCell,
            change: changeCell,
            volume: volumeCell
        }
    });

    rowCount++;

    // Hide empty state if we have rows
    if (emptyState && rowCount === 1) {
        emptyState.classList.add('hidden');
    }
}

/**
 * Update an existing row
 * @param {string} symbol 
 * @param {object} data 
 */
function updateRow(symbol, data) {
    const rowData = rowMap.get(symbol);
    
    if (!rowData) {
        createRow(symbol, data);
        return;
    }

    const { cells } = rowData;
    const currentPrice = parseFloat(data.price);
    const prevPrice = parseFloat(data.prevPrice);

    // Update price
    cells.price.textContent = formatNumber(data.price);

    // Flash animation based on price direction
    if (currentPrice > prevPrice) {
        triggerFlash(cells.price, 'flash-up');
    } else if (currentPrice < prevPrice) {
        triggerFlash(cells.price, 'flash-down');
    }

    // Update change
    const changeValue = parseFloat(data.change);
    cells.change.textContent = (changeValue >= 0 ? '+' : '') + changeValue.toFixed(2) + '%';
    cells.change.classList.remove('text-up', 'text-down');
    cells.change.classList.add(changeValue >= 0 ? 'text-up' : 'text-down');

    // Update volume
    cells.volume.textContent = formatVolume(data.volume);
}

/**
 * Trigger flash animation on element
 * @param {HTMLElement} element 
 * @param {string} className - 'flash-up' or 'flash-down'
 */
function triggerFlash(element, className) {
    element.classList.remove('flash-up', 'flash-down');
    
    // Force reflow to restart animation
    void element.offsetWidth;
    
    element.classList.add(className);
    
    // Remove flash class after duration
    setTimeout(() => {
        element.classList.remove(className);
    }, FLASH_DURATION);
}

/**
 * Update the status indicator
 */
function updateStatusIndicator() {
    if (!statusDot || !statusText) return;

    // Remove all status classes
    statusDot.classList.remove('live', 'lagging', 'disconnected');
    
    // Add current status class
    statusDot.classList.add(connectionState.status);

    // Update text
    switch (connectionState.status) {
        case 'live':
            statusText.textContent = 'Live';
            break;
        case 'lagging':
            statusText.textContent = 'Lagging';
            break;
        case 'disconnected':
            if (connectionState.retryCount > 0) {
                const delay = Math.min(
                    1000 * Math.pow(2, connectionState.retryCount - 1),
                    30000
                ) / 1000;
                statusText.textContent = `Retrying in ${delay}s...`;
            } else {
                statusText.textContent = 'Disconnected';
            }
            break;
    }

    // Update symbol count
    if (symbolCount) {
        symbolCount.textContent = `${getSymbolCount()} symbols`;
    }

    // Update latency
    if (latencyDisplay && connectionState.status === 'live') {
        latencyDisplay.textContent = `Latency: ${connectionState.latency}ms`;
    }
}

/**
 * The main render loop - synced to 60fps via requestAnimationFrame
 */
function renderLoop() {
    // 1. Update connection status indicator
    updateStatusIndicator();

    // 2. Only process symbols that actually changed
    dirtySymbols.forEach(symbol => {
        const data = marketState.get(symbol);
        if (data) {
            updateRow(symbol, data);
        }
    });

    // 3. Clear dirty set for next frame
    clearDirtySymbols();

    // 4. Schedule next frame
    requestAnimationFrame(renderLoop);
}

/**
 * Start the render loop
 */
function startRenderLoop() {
    initRenderer();
    requestAnimationFrame(renderLoop);
}
