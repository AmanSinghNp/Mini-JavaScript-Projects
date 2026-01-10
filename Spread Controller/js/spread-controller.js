/**
 * Spread Controller - Avellaneda-Stoikov Market Making Model
 * Implements optimal bid/ask pricing based on inventory and risk aversion
 */

class SpreadController {
    constructor() {
        // Fixed parameters
        this.midPrice = 100;      // s - Static mid price
        this.volatility = 0.02;   // σ - Daily volatility (2%)
        this.orderArrival = 1.5;  // k - Order arrival rate intensity
        
        // User-controlled parameters
        this.inventory = 0;       // q - Inventory position (-100 to +100)
        this.riskAversion = 0.1;  // γ - Risk aversion coefficient
        this.timeRemaining = 1;   // T-t - Time remaining (0 to 1)
    }
    
    /**
     * Calculate the reservation price
     * r = s - q * γ * σ² * (T-t)
     * The price at which the market maker is indifferent to trading
     */
    calculateReservationPrice() {
        const s = this.midPrice;
        const q = this.inventory;
        const gamma = this.riskAversion;
        const sigma = this.volatility;
        const tau = this.timeRemaining;
        
        return s - (q * gamma * Math.pow(sigma, 2) * tau);
    }
    
    /**
     * Calculate the optimal spread
     * δ = γ * σ² * (T-t) + (2/γ) * ln(1 + γ/k)
     */
    calculateOptimalSpread() {
        const gamma = this.riskAversion;
        const sigma = this.volatility;
        const tau = this.timeRemaining;
        const k = this.orderArrival;
        
        // Prevent division by zero
        if (gamma <= 0) return 0;
        
        const varianceTerm = gamma * Math.pow(sigma, 2) * tau;
        const intensityTerm = (2 / gamma) * Math.log(1 + gamma / k);
        
        return varianceTerm + intensityTerm;
    }
    
    /**
     * Calculate optimal bid price
     * bid = r - δ/2
     */
    calculateBidPrice() {
        const r = this.calculateReservationPrice();
        const delta = this.calculateOptimalSpread();
        return r - (delta / 2);
    }
    
    /**
     * Calculate optimal ask price
     * ask = r + δ/2
     */
    calculateAskPrice() {
        const r = this.calculateReservationPrice();
        const delta = this.calculateOptimalSpread();
        return r + (delta / 2);
    }
    
    /**
     * Get all calculated values
     */
    getQuotes() {
        const reservationPrice = this.calculateReservationPrice();
        const spread = this.calculateOptimalSpread();
        const bidPrice = this.calculateBidPrice();
        const askPrice = this.calculateAskPrice();
        
        return {
            midPrice: this.midPrice,
            reservationPrice,
            spread,
            bidPrice,
            askPrice,
            inventory: this.inventory,
            riskAversion: this.riskAversion,
            timeRemaining: this.timeRemaining
        };
    }
    
    /**
     * Update parameters
     */
    setInventory(value) {
        this.inventory = parseFloat(value);
    }
    
    setRiskAversion(value) {
        this.riskAversion = Math.max(0.01, parseFloat(value)); // Prevent zero
    }
    
    setTimeRemaining(value) {
        this.timeRemaining = Math.max(0.01, parseFloat(value)); // Prevent zero
    }
}

// UI Controller
class UIController {
    constructor() {
        this.model = new SpreadController();
        this.initElements();
        this.bindEvents();
        this.initTheme();
        this.updateDisplay();
    }
    
    initElements() {
        // Sliders
        this.inventorySlider = document.getElementById('inventory-slider');
        this.riskSlider = document.getElementById('risk-slider');
        this.timeSlider = document.getElementById('time-slider');
        
        // Value displays
        this.inventoryValue = document.getElementById('inventory-value');
        this.riskValue = document.getElementById('risk-value');
        this.timeValue = document.getElementById('time-value');
        
        // Output displays
        this.bidPrice = document.getElementById('bid-price');
        this.askPrice = document.getElementById('ask-price');
        this.reservationPrice = document.getElementById('reservation-price');
        this.spreadValue = document.getElementById('spread-value');
        
        // Visual indicators
        this.inventoryBar = document.getElementById('inventory-bar');
        this.skewIndicator = document.getElementById('skew-indicator');
        
        // Theme toggle
        this.themeBtn = document.getElementById('btn-theme');
    }
    
    bindEvents() {
        // Slider events
        this.inventorySlider.addEventListener('input', (e) => {
            this.model.setInventory(e.target.value);
            this.updateDisplay();
        });
        
        this.riskSlider.addEventListener('input', (e) => {
            this.model.setRiskAversion(e.target.value);
            this.updateDisplay();
        });
        
        this.timeSlider.addEventListener('input', (e) => {
            this.model.setTimeRemaining(e.target.value);
            this.updateDisplay();
        });
        
        // Theme toggle
        this.themeBtn.addEventListener('click', () => this.toggleTheme());
        
        // Reset button
        document.getElementById('btn-reset').addEventListener('click', () => this.resetValues());
    }
    
    initTheme() {
        const darkMode = localStorage.getItem('spread-controller-dark') === 'true' ||
            (!localStorage.getItem('spread-controller-dark') && 
             window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
    }
    
    toggleTheme() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('spread-controller-dark', isDark);
    }
    
    updateDisplay() {
        const quotes = this.model.getQuotes();
        
        // Update slider value displays
        const invSign = quotes.inventory > 0 ? '+' : '';
        this.inventoryValue.textContent = `${invSign}${quotes.inventory.toFixed(0)}`;
        this.riskValue.textContent = quotes.riskAversion.toFixed(2);
        this.timeValue.textContent = quotes.timeRemaining.toFixed(2);
        
        // Update price displays with animation
        this.animateValue(this.bidPrice, quotes.bidPrice);
        this.animateValue(this.askPrice, quotes.askPrice);
        this.animateValue(this.reservationPrice, quotes.reservationPrice);
        this.animateValue(this.spreadValue, quotes.spread, 4);
        
        // Update inventory visualization
        this.updateInventoryBar(quotes.inventory);
        
        // Update skew indicator
        this.updateSkewIndicator(quotes);
        
        // Update inventory value color
        this.inventoryValue.className = quotes.inventory > 0 
            ? 'font-mono font-bold text-buy-green' 
            : quotes.inventory < 0 
                ? 'font-mono font-bold text-sell-red' 
                : 'font-mono font-bold text-gray-600 dark:text-gray-400';
    }
    
    animateValue(element, value, decimals = 2) {
        const newText = `$${value.toFixed(decimals)}`;
        if (element.textContent !== newText) {
            element.classList.add('value-flash');
            element.textContent = newText;
            setTimeout(() => element.classList.remove('value-flash'), 200);
        }
    }
    
    updateInventoryBar(inventory) {
        // Calculate position (inventory ranges from -100 to +100)
        const percentage = ((inventory + 100) / 200) * 100;
        this.inventoryBar.style.width = `${percentage}%`;
        
        // Change color based on position
        if (inventory > 0) {
            this.inventoryBar.className = 'h-full bg-gradient-to-r from-gray-400 to-buy-green rounded-full transition-all duration-300';
        } else if (inventory < 0) {
            this.inventoryBar.className = 'h-full bg-gradient-to-r from-sell-red to-gray-400 rounded-full transition-all duration-300';
        } else {
            this.inventoryBar.className = 'h-full bg-gray-400 rounded-full transition-all duration-300';
        }
    }
    
    updateSkewIndicator(quotes) {
        const skew = quotes.reservationPrice - quotes.midPrice;
        const maxSkew = 1; // Maximum visual skew
        const normalizedSkew = Math.max(-1, Math.min(1, skew / maxSkew));
        const translateX = normalizedSkew * 40; // pixels
        
        this.skewIndicator.style.transform = `translateX(${translateX}px)`;
        
        // Update skew text
        const skewText = document.getElementById('skew-text');
        if (skew > 0.001) {
            skewText.textContent = 'Skewed to Buy';
            skewText.className = 'text-xs text-buy-green font-medium';
        } else if (skew < -0.001) {
            skewText.textContent = 'Skewed to Sell';
            skewText.className = 'text-xs text-sell-red font-medium';
        } else {
            skewText.textContent = 'Neutral';
            skewText.className = 'text-xs text-gray-500 font-medium';
        }
    }
    
    resetValues() {
        this.inventorySlider.value = 0;
        this.riskSlider.value = 0.1;
        this.timeSlider.value = 1;
        
        this.model.setInventory(0);
        this.model.setRiskAversion(0.1);
        this.model.setTimeRemaining(1);
        
        this.updateDisplay();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.controller = new UIController();
});
