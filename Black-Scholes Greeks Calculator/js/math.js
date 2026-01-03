/**
 * Black-Scholes Option Pricing Model
 * Pure JavaScript implementation with Greeks calculations
 */

/**
 * Standard Normal Probability Density Function (PDF)
 * @param {number} x - Input value
 * @returns {number} PDF value with 6-decimal precision
 */
function normalPDF(x) {
    const result = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    return parseFloat(result.toFixed(6));
}

/**
 * Cumulative Normal Distribution Function (CDF)
 * Uses Hastings (1955) polynomial approximation
 * Maximum error: 7.5 × 10^-8
 * @param {number} x - Input value
 * @returns {number} CDF value with 6-decimal precision
 */
function normalCDF(x) {
    // Coefficients for Hastings approximation
    const b1 =  0.319381530;
    const b2 = -0.356563782;
    const b3 =  1.781477937;
    const b4 = -1.821255978;
    const b5 =  1.330274429;
    const p  =  0.2316419;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    
    // Use symmetry property: N(-x) = 1 - N(x)
    const t = 1.0 / (1.0 + p * absX);
    
    // Standard normal PDF at absX
    const pdf = Math.exp(-0.5 * absX * absX) / Math.sqrt(2 * Math.PI);
    
    // Polynomial approximation for N(x) for x >= 0
    const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
    const cdf = 1.0 - pdf * poly;

    // Apply symmetry for negative x
    const result = x < 0 ? (1.0 - cdf) : cdf;
    return parseFloat(result.toFixed(6));
}

/**
 * Black-Scholes Option Pricing Model
 * Calculates option prices and Greeks for European options
 */
class BlackScholes {
    /**
     * @param {number} stock - Current stock price (S)
     * @param {number} strike - Strike price (K)
     * @param {number} time - Time to expiration in years (T)
     * @param {number} volatility - Annualized volatility (σ)
     * @param {number} riskFree - Risk-free interest rate (r)
     * @param {number} dividend - Continuous dividend yield (q)
     */
    constructor(stock, strike, time, volatility, riskFree, dividend = 0) {
        this.S = stock;
        this.K = strike;
        this.T = time;
        this.sigma = volatility;
        this.r = riskFree;
        this.q = dividend;

        // Pre-calculate d1 and d2
        this._calculateD1D2();
    }

    /**
     * Calculate d1 and d2 parameters used in Black-Scholes formulas
     * @private
     */
    _calculateD1D2() {
        const sqrtT = Math.sqrt(this.T);
        
        this.d1 = (Math.log(this.S / this.K) + (this.r - this.q + 0.5 * this.sigma * this.sigma) * this.T) / (this.sigma * sqrtT);
        this.d2 = this.d1 - this.sigma * sqrtT;
    }

    /**
     * Calculate Call option price
     * @returns {number} Call price with 6-decimal precision
     */
    callPrice() {
        const discountDividend = Math.exp(-this.q * this.T);
        const discountRate = Math.exp(-this.r * this.T);

        const price = this.S * discountDividend * normalCDF(this.d1) - this.K * discountRate * normalCDF(this.d2);
        return parseFloat(price.toFixed(6));
    }

    /**
     * Calculate Put option price
     * @returns {number} Put price with 6-decimal precision
     */
    putPrice() {
        const discountDividend = Math.exp(-this.q * this.T);
        const discountRate = Math.exp(-this.r * this.T);

        const price = this.K * discountRate * normalCDF(-this.d2) - this.S * discountDividend * normalCDF(-this.d1);
        return parseFloat(price.toFixed(6));
    }

    /**
     * Calculate Delta - rate of change of option price with respect to stock price
     * @returns {object} { call: number, put: number }
     */
    delta() {
        const discountDividend = Math.exp(-this.q * this.T);

        const callDelta = discountDividend * normalCDF(this.d1);
        const putDelta = discountDividend * (normalCDF(this.d1) - 1);

        return {
            call: parseFloat(callDelta.toFixed(6)),
            put: parseFloat(putDelta.toFixed(6))
        };
    }

    /**
     * Calculate Gamma - rate of change of Delta with respect to stock price
     * Same for both call and put options
     * @returns {number} Gamma with 6-decimal precision
     */
    gamma() {
        const discountDividend = Math.exp(-this.q * this.T);
        const sqrtT = Math.sqrt(this.T);

        const gamma = (discountDividend * normalPDF(this.d1)) / (this.S * this.sigma * sqrtT);
        return parseFloat(gamma.toFixed(6));
    }

    /**
     * Calculate Theta - rate of change of option price with respect to time (annualized)
     * @returns {object} { call: number, put: number }
     */
    theta() {
        const discountDividend = Math.exp(-this.q * this.T);
        const discountRate = Math.exp(-this.r * this.T);
        const sqrtT = Math.sqrt(this.T);

        // First term (common to both)
        const term1 = -(this.S * discountDividend * normalPDF(this.d1) * this.sigma) / (2 * sqrtT);

        // Call theta
        const callTheta = term1 
            - this.r * this.K * discountRate * normalCDF(this.d2) 
            + this.q * this.S * discountDividend * normalCDF(this.d1);

        // Put theta
        const putTheta = term1 
            + this.r * this.K * discountRate * normalCDF(-this.d2) 
            - this.q * this.S * discountDividend * normalCDF(-this.d1);

        return {
            call: parseFloat(callTheta.toFixed(6)),
            put: parseFloat(putTheta.toFixed(6))
        };
    }

    /**
     * Calculate Vega - rate of change of option price with respect to volatility
     * Same for both call and put options (expressed per 1% change in volatility)
     * @returns {number} Vega with 6-decimal precision
     */
    vega() {
        const discountDividend = Math.exp(-this.q * this.T);
        const sqrtT = Math.sqrt(this.T);

        const vega = this.S * discountDividend * normalPDF(this.d1) * sqrtT;
        return parseFloat(vega.toFixed(6));
    }

    /**
     * Calculate Rho - rate of change of option price with respect to interest rate
     * @returns {object} { call: number, put: number }
     */
    rho() {
        const discountRate = Math.exp(-this.r * this.T);

        const callRho = this.K * this.T * discountRate * normalCDF(this.d2);
        const putRho = -this.K * this.T * discountRate * normalCDF(-this.d2);

        return {
            call: parseFloat(callRho.toFixed(6)),
            put: parseFloat(putRho.toFixed(6))
        };
    }

    /**
     * Get all calculated values in a structured object
     * @returns {object} Complete pricing and Greeks data
     */
    calculate() {
        return {
            inputs: {
                stock: this.S,
                strike: this.K,
                time: this.T,
                volatility: this.sigma,
                riskFree: this.r,
                dividend: this.q
            },
            intermediates: {
                d1: parseFloat(this.d1.toFixed(6)),
                d2: parseFloat(this.d2.toFixed(6))
            },
            prices: {
                call: this.callPrice(),
                put: this.putPrice()
            },
            greeks: {
                delta: this.delta(),
                gamma: this.gamma(),
                theta: this.theta(),
                vega: this.vega(),
                rho: this.rho()
            }
        };
    }
}

/**
 * Numerical Greeks Calculator using Finite Difference Methods
 * 
 * This class provides numerical approximations of the Greeks using
 * finite difference methods. Useful for:
 * - Educational comparison with analytical solutions
 * - Validation of analytical formulas
 * - Pricing exotic options where analytical Greeks don't exist
 */
class NumericalGreeks {
    /**
     * @param {number} stock - Current stock price (S)
     * @param {number} strike - Strike price (K)
     * @param {number} time - Time to expiration in years (T)
     * @param {number} volatility - Annualized volatility (σ) as decimal
     * @param {number} riskFree - Risk-free interest rate (r) as decimal
     * @param {number} dividend - Continuous dividend yield (q) as decimal
     */
    constructor(stock, strike, time, volatility, riskFree, dividend = 0) {
        this.S = stock;
        this.K = strike;
        this.T = time;
        this.sigma = volatility;
        this.r = riskFree;
        this.q = dividend;

        // Step sizes for finite differences (optimized for accuracy)
        // Balance between precision and numerical stability
        this.hStock = 1.0;      // $1.00 step for stock price (more stable for gamma)
        this.hVol = 0.01;       // 1% step for volatility (0.01 decimal)
        this.hRate = 0.01;      // 1% step for interest rate
        this.hTime = 1/365;     // 1 day time step for theta
    }

    /**
     * High-precision normalCDF for numerical differentiation (no rounding)
     * Uses Hastings (1955) approximation, same as normalCDF but without toFixed()
     * @private
     */
    _normalCDFPrecise(x) {
        const b1 =  0.319381530;
        const b2 = -0.356563782;
        const b3 =  1.781477937;
        const b4 = -1.821255978;
        const b5 =  1.330274429;
        const p  =  0.2316419;

        const absX = Math.abs(x);
        const t = 1.0 / (1.0 + p * absX);
        
        // Standard normal PDF at absX
        const pdf = Math.exp(-0.5 * absX * absX) / Math.sqrt(2 * Math.PI);
        
        // Polynomial approximation
        const poly = t * (b1 + t * (b2 + t * (b3 + t * (b4 + t * b5))));
        const cdf = 1.0 - pdf * poly;

        // Apply symmetry for negative x
        return x < 0 ? (1.0 - cdf) : cdf;
    }

    /**
     * Get option price directly (without rounding) for accurate numerical differentiation
     * @private
     */
    _getPrice(stock, strike, time, vol, rate, div, optionType) {
        // Handle edge cases
        if (time <= 0) time = 0.0001;
        if (vol <= 0) vol = 0.0001;
        if (stock <= 0) stock = 0.0001;
        
        // Calculate d1 and d2 directly (no rounding)
        const sqrtT = Math.sqrt(time);
        const d1 = (Math.log(stock / strike) + (rate - div + 0.5 * vol * vol) * time) / (vol * sqrtT);
        const d2 = d1 - vol * sqrtT;
        
        // Calculate discount factors
        const discountDiv = Math.exp(-div * time);
        const discountRate = Math.exp(-rate * time);
        
        // Use high-precision CDF (no rounding)
        if (optionType === 'call') {
            return stock * discountDiv * this._normalCDFPrecise(d1) - strike * discountRate * this._normalCDFPrecise(d2);
        } else {
            return strike * discountRate * this._normalCDFPrecise(-d2) - stock * discountDiv * this._normalCDFPrecise(-d1);
        }
    }

    /**
     * Delta using Central Difference:
     * Δ ≈ [V(S+h) - V(S-h)] / (2h)
     * 
     * Measures rate of change of option price with respect to stock price
     */
    delta() {
        const h = this.hStock; // Absolute step (e.g., $0.01)
        
        const callUp = this._getPrice(this.S + h, this.K, this.T, this.sigma, this.r, this.q, 'call');
        const callDown = this._getPrice(this.S - h, this.K, this.T, this.sigma, this.r, this.q, 'call');
        const putUp = this._getPrice(this.S + h, this.K, this.T, this.sigma, this.r, this.q, 'put');
        const putDown = this._getPrice(this.S - h, this.K, this.T, this.sigma, this.r, this.q, 'put');

        return {
            call: parseFloat(((callUp - callDown) / (2 * h)).toFixed(6)),
            put: parseFloat(((putUp - putDown) / (2 * h)).toFixed(6))
        };
    }

    /**
     * Gamma using Central Difference (Second Derivative):
     * Γ ≈ [V(S+h) - 2V(S) + V(S-h)] / h²
     * 
     * Measures rate of change of Delta with respect to stock price
     * Same for both call and put options
     */
    gamma() {
        const h = this.hStock; // Absolute step
        
        const priceUp = this._getPrice(this.S + h, this.K, this.T, this.sigma, this.r, this.q, 'call');
        const priceNow = this._getPrice(this.S, this.K, this.T, this.sigma, this.r, this.q, 'call');
        const priceDown = this._getPrice(this.S - h, this.K, this.T, this.sigma, this.r, this.q, 'call');

        const gamma = (priceUp - 2 * priceNow + priceDown) / (h * h);
        return parseFloat(gamma.toFixed(6));
    }

    /**
     * Theta using Forward Difference:
     * Θ ≈ [V(T-h) - V(T)] / h
     * 
     * Measures rate of change of option price with respect to time
     * Returns annualized theta (negative for long options due to time decay)
     */
    theta() {
        const h = this.hTime; // Very small time step
        const newTime = Math.max(this.T - h, 0.0001); // Prevent negative time
        
        const callNow = this._getPrice(this.S, this.K, this.T, this.sigma, this.r, this.q, 'call');
        const callLater = this._getPrice(this.S, this.K, newTime, this.sigma, this.r, this.q, 'call');
        const putNow = this._getPrice(this.S, this.K, this.T, this.sigma, this.r, this.q, 'put');
        const putLater = this._getPrice(this.S, this.K, newTime, this.sigma, this.r, this.q, 'put');

        return {
            call: parseFloat(((callLater - callNow) / h).toFixed(6)),
            put: parseFloat(((putLater - putNow) / h).toFixed(6))
        };
    }

    /**
     * Vega using Central Difference:
     * ν ≈ [V(σ+h) - V(σ-h)] / (2h)
     * 
     * Measures sensitivity to volatility changes
     * Same for both call and put options
     */
    vega() {
        const h = this.hVol; // Small volatility step
        
        const priceUp = this._getPrice(this.S, this.K, this.T, this.sigma + h, this.r, this.q, 'call');
        const priceDown = this._getPrice(this.S, this.K, this.T, Math.max(this.sigma - h, 0.0001), this.r, this.q, 'call');

        const vega = (priceUp - priceDown) / (2 * h);
        return parseFloat(vega.toFixed(6));
    }

    /**
     * Rho using Central Difference:
     * ρ ≈ [V(r+h) - V(r-h)] / (2h)
     * 
     * Measures sensitivity to interest rate changes
     */
    rho() {
        const h = this.hRate; // Small rate step
        
        const callUp = this._getPrice(this.S, this.K, this.T, this.sigma, this.r + h, this.q, 'call');
        const callDown = this._getPrice(this.S, this.K, this.T, this.sigma, Math.max(this.r - h, 0), this.q, 'call');
        const putUp = this._getPrice(this.S, this.K, this.T, this.sigma, this.r + h, this.q, 'put');
        const putDown = this._getPrice(this.S, this.K, this.T, this.sigma, Math.max(this.r - h, 0), this.q, 'put');

        return {
            call: parseFloat(((callUp - callDown) / (2 * h)).toFixed(6)),
            put: parseFloat(((putUp - putDown) / (2 * h)).toFixed(6))
        };
    }

    /**
     * Get all numerical Greeks in a structured object
     * @returns {object} Numerical Greeks data with comparison-ready format
     */
    calculate() {
        return {
            method: 'numerical',
            stepSize: this.h,
            inputs: {
                stock: this.S,
                strike: this.K,
                time: this.T,
                volatility: this.sigma,
                riskFree: this.r,
                dividend: this.q
            },
            greeks: {
                delta: this.delta(),
                gamma: this.gamma(),
                theta: this.theta(),
                vega: this.vega(),
                rho: this.rho()
            }
        };
    }

    /**
     * Compare numerical Greeks with analytical Greeks
     * @returns {object} Comparison with absolute and percentage differences
     */
    compareWithAnalytical() {
        const analytical = new BlackScholes(this.S, this.K, this.T, this.sigma, this.r, this.q).calculate();
        const numerical = this.calculate();

        const diff = (num, ana) => {
            const abs = parseFloat((num - ana).toFixed(8));
            const pct = ana !== 0 ? parseFloat(((num - ana) / Math.abs(ana) * 100).toFixed(4)) : 0;
            return { numerical: num, analytical: ana, difference: abs, percentError: pct };
        };

        return {
            delta: {
                call: diff(numerical.greeks.delta.call, analytical.greeks.delta.call),
                put: diff(numerical.greeks.delta.put, analytical.greeks.delta.put)
            },
            gamma: diff(numerical.greeks.gamma, analytical.greeks.gamma),
            theta: {
                call: diff(numerical.greeks.theta.call, analytical.greeks.theta.call),
                put: diff(numerical.greeks.theta.put, analytical.greeks.theta.put)
            },
            vega: diff(numerical.greeks.vega, analytical.greeks.vega),
            rho: {
                call: diff(numerical.greeks.rho.call, analytical.greeks.rho.call),
                put: diff(numerical.greeks.rho.put, analytical.greeks.rho.put)
            }
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlackScholes, NumericalGreeks, normalCDF, normalPDF };
}

