/**
 * Black-Scholes Calculator UI Logic
 * Connects the HTML interface to the BlackScholes calculation engine
 */

(function() {
    'use strict';

    // ========================================
    // State Management
    // ========================================
    const state = {
        optionType: 'call', // 'call' or 'put'
        stock: 100.00,
        strike: 105.00,
        time: 1.00,        // years
        volatility: 20.00, // percentage
        riskFree: 5.00,    // percentage
        dividend: 0.00,    // percentage
        selectedGreek: 'delta', // for visualization
        calculationMethod: 'analytical' // 'analytical', 'numerical', or 'both'
    };

    // Stepper configuration: { step, min, max, decimals }
    const stepperConfig = {
        time: { step: 0.25, min: 0.01, max: 10, decimals: 2 },
        vol:  { step: 1.00, min: 1,    max: 200, decimals: 2 },
        rate: { step: 0.25, min: 0,    max: 50, decimals: 2 },
        div:  { step: 0.25, min: 0,    max: 50, decimals: 2 }
    };

    // ========================================
    // DOM Element References
    // ========================================
    const elements = {
        // Option Type Buttons
        btnCall: document.getElementById('btn-call'),
        btnPut: document.getElementById('btn-put'),

        // Input Fields
        inputStock: document.getElementById('input-stock'),
        inputStrike: document.getElementById('input-strike'),

        // Stepper Value Spans
        valTime: document.getElementById('val-time'),
        valVol: document.getElementById('val-vol'),
        valRate: document.getElementById('val-rate'),
        valDiv: document.getElementById('val-div'),

        // Stepper Buttons
        btnTimeInc: document.getElementById('btn-time-inc'),
        btnTimeDec: document.getElementById('btn-time-dec'),
        btnVolInc: document.getElementById('btn-vol-inc'),
        btnVolDec: document.getElementById('btn-vol-dec'),
        btnRateInc: document.getElementById('btn-rate-inc'),
        btnRateDec: document.getElementById('btn-rate-dec'),
        btnDivInc: document.getElementById('btn-div-inc'),
        btnDivDec: document.getElementById('btn-div-dec'),

        // Action Buttons
        btnCalculate: document.getElementById('btn-calculate'),
        btnReset: document.getElementById('btn-reset'),

        // Output Elements
        outputPrice: document.getElementById('output-price'),
        outputOptionType: document.getElementById('output-option-type'),
        outputDelta: document.getElementById('output-delta'),
        outputGamma: document.getElementById('output-gamma'),
        outputTheta: document.getElementById('output-theta'),
        outputVega: document.getElementById('output-vega'),
        outputRho: document.getElementById('output-rho'),

        // Progress Bars
        barDelta: document.getElementById('bar-delta'),
        barGamma: document.getElementById('bar-gamma'),
        barTheta: document.getElementById('bar-theta'),
        barVega: document.getElementById('bar-vega'),
        barRho: document.getElementById('bar-rho'),

        // Visualization Elements
        vizDelta: document.getElementById('viz-delta'),
        vizGamma: document.getElementById('viz-gamma'),
        vizVega: document.getElementById('viz-vega'),
        vizTheta: document.getElementById('viz-theta'),
        vizRho: document.getElementById('viz-rho'),
        greeksHeatmap: document.getElementById('greeks-heatmap'),

        // Calculation Method Buttons
        methodAnalytical: document.getElementById('method-analytical'),
        methodNumerical: document.getElementById('method-numerical'),
        methodBoth: document.getElementById('method-both')
    };

    // Heatmap instance
    let heatmap = null;

    // ========================================
    // Utility Functions
    // ========================================

    /**
     * Parse a numeric value from input, return fallback if invalid
     */
    function parseNumber(value, fallback = 0) {
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
    }

    /**
     * Clamp a value between min and max
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Format number to fixed decimals
     */
    function formatNumber(value, decimals = 4) {
        return value.toFixed(decimals);
    }

    // ========================================
    // UI Update Functions
    // ========================================

    /**
     * Update the option type toggle UI
     */
    function updateOptionTypeUI() {
        const isCall = state.optionType === 'call';

        // Update button styles
        if (isCall) {
            elements.btnCall.className = 'w-1/2 py-1.5 text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500 shadow-sm transition-all';
            elements.btnPut.className = 'w-1/2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all';
        } else {
            elements.btnPut.className = 'w-1/2 py-1.5 text-xs font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-600 rounded-md border border-gray-200 dark:border-gray-500 shadow-sm transition-all';
            elements.btnCall.className = 'w-1/2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all';
        }

        // Update option type badge
        const icon = isCall ? 'trending_up' : 'trending_down';
        const text = isCall ? 'Call Option' : 'Put Option';
        elements.outputOptionType.innerHTML = `<span class="material-icons-round text-[10px] mr-1">${icon}</span> ${text}`;
    }

    /**
     * Update stepper display value
     */
    function updateStepperDisplay(element, value, decimals = 2) {
        element.textContent = formatNumber(value, decimals);
    }

    /**
     * Update the results display
     */
    function updateResults(results, numericalResults = null) {
        const isCall = state.optionType === 'call';
        const method = state.calculationMethod;

        // Update price (always from analytical)
        const price = isCall ? results.prices.call : results.prices.put;
        elements.outputPrice.textContent = '$' + formatNumber(price, 4);

        // Get Greek values based on method
        let delta, gamma, theta, vega, rho;
        let deltaNum, gammaNum, thetaNum, vegaNum, rhoNum;

        // Analytical values
        delta = isCall ? results.greeks.delta.call : results.greeks.delta.put;
        gamma = results.greeks.gamma;
        theta = isCall ? results.greeks.theta.call : results.greeks.theta.put;
        vega = results.greeks.vega;
        rho = isCall ? results.greeks.rho.call : results.greeks.rho.put;

        // Numerical values (if available)
        if (numericalResults) {
            deltaNum = isCall ? numericalResults.greeks.delta.call : numericalResults.greeks.delta.put;
            gammaNum = numericalResults.greeks.gamma;
            thetaNum = isCall ? numericalResults.greeks.theta.call : numericalResults.greeks.theta.put;
            vegaNum = numericalResults.greeks.vega;
            rhoNum = isCall ? numericalResults.greeks.rho.call : numericalResults.greeks.rho.put;
        }

        // Display based on method
        if (method === 'analytical') {
            elements.outputDelta.innerHTML = formatNumber(delta, 4);
            elements.outputGamma.innerHTML = formatNumber(gamma, 4);
            elements.outputTheta.innerHTML = formatNumber(theta, 4);
            elements.outputVega.innerHTML = formatNumber(vega, 4);
            elements.outputRho.innerHTML = formatNumber(rho, 4);
        } else if (method === 'numerical' && numericalResults) {
            elements.outputDelta.innerHTML = formatNumber(deltaNum, 4);
            elements.outputGamma.innerHTML = formatNumber(gammaNum, 4);
            elements.outputTheta.innerHTML = formatNumber(thetaNum, 4);
            elements.outputVega.innerHTML = formatNumber(vegaNum, 4);
            elements.outputRho.innerHTML = formatNumber(rhoNum, 4);
        } else if (method === 'both' && numericalResults) {
            // Show comparison view with both values
            const formatCompare = (ana, num) => {
                const diff = ((num - ana) / Math.abs(ana) * 100).toFixed(2);
                const diffColor = Math.abs(diff) < 1 ? 'text-green-500' : 'text-orange-500';
                return `<span class="block">${formatNumber(ana, 4)}</span><span class="text-[10px] ${diffColor}">${formatNumber(num, 4)} (${diff > 0 ? '+' : ''}${diff}%)</span>`;
            };
            elements.outputDelta.innerHTML = formatCompare(delta, deltaNum);
            elements.outputGamma.innerHTML = formatCompare(gamma, gammaNum);
            elements.outputTheta.innerHTML = formatCompare(theta, thetaNum);
            elements.outputVega.innerHTML = formatCompare(vega, vegaNum);
            elements.outputRho.innerHTML = formatCompare(rho, rhoNum);
        } else {
            // Fallback to analytical
            elements.outputDelta.innerHTML = formatNumber(delta, 4);
            elements.outputGamma.innerHTML = formatNumber(gamma, 4);
            elements.outputTheta.innerHTML = formatNumber(theta, 4);
            elements.outputVega.innerHTML = formatNumber(vega, 4);
            elements.outputRho.innerHTML = formatNumber(rho, 4);
        }

        // Update progress bars (always use analytical)
        const deltaPct = Math.abs(delta) * 100;
        elements.barDelta.style.width = clamp(deltaPct, 0, 100) + '%';

        const gammaPct = Math.min(gamma * 1000, 100);
        elements.barGamma.style.width = clamp(gammaPct, 0, 100) + '%';

        const thetaPct = Math.min(Math.abs(theta) * 10, 100);
        elements.barTheta.style.width = clamp(thetaPct, 0, 100) + '%';

        const vegaPct = Math.min(vega * 2, 100);
        elements.barVega.style.width = clamp(vegaPct, 0, 100) + '%';

        const rhoPct = Math.min(Math.abs(rho), 100);
        elements.barRho.style.width = clamp(rhoPct, 0, 100) + '%';
    }

    // ========================================
    // Calculation Function
    // ========================================

    /**
     * Run the Black-Scholes calculation and update UI
     */
    function calculate() {
        // Convert percentages to decimals for calculation
        const volatility = state.volatility / 100;
        const riskFree = state.riskFree / 100;
        const dividend = state.dividend / 100;

        // Validate inputs
        if (state.stock <= 0 || state.strike <= 0 || state.time <= 0 || volatility <= 0) {
            console.warn('Invalid inputs for Black-Scholes calculation');
            return;
        }

        // Create BlackScholes instance and calculate
        const bs = new BlackScholes(
            state.stock,
            state.strike,
            state.time,
            volatility,
            riskFree,
            dividend
        );

        const results = bs.calculate();

        // Also calculate numerical Greeks
        let numericalResults = null;
        if (typeof NumericalGreeks !== 'undefined') {
            const ng = new NumericalGreeks(
                state.stock,
                state.strike,
                state.time,
                volatility,
                riskFree,
                dividend
            );
            numericalResults = ng.calculate();
        }

        updateResults(results, numericalResults);

        // Update heatmap visualization
        if (heatmap) {
            heatmap.updateParams({
                stock: state.stock,
                strike: state.strike,
                time: state.time,
                volatility: volatility,
                riskFree: riskFree,
                dividend: dividend
            });
            heatmap.render(state.selectedGreek, state.optionType);
        }
    }

    // ========================================
    // Event Handlers
    // ========================================

    /**
     * Handle option type toggle
     */
    function handleOptionTypeChange(type) {
        state.optionType = type;
        updateOptionTypeUI();
        calculate();
    }

    /**
     * Handle text input changes
     */
    function handleInputChange(field, element) {
        const value = parseNumber(element.value, state[field]);
        state[field] = Math.max(0.01, value); // Ensure positive
        element.value = formatNumber(state[field], 2);
        calculate();
    }

    /**
     * Handle stepper increment/decrement
     */
    function handleStepper(stateKey, valueElement, config, increment) {
        let currentValue = state[stateKey];
        const change = increment ? config.step : -config.step;
        const newValue = clamp(currentValue + change, config.min, config.max);
        
        state[stateKey] = newValue;
        updateStepperDisplay(valueElement, newValue, config.decimals);
        calculate();
    }

    /**
     * Reset all values to defaults
     */
    function handleReset() {
        state.optionType = 'call';
        state.stock = 100.00;
        state.strike = 105.00;
        state.time = 1.00;
        state.volatility = 20.00;
        state.riskFree = 5.00;
        state.dividend = 0.00;

        // Update UI
        elements.inputStock.value = '100.00';
        elements.inputStrike.value = '105.00';
        updateStepperDisplay(elements.valTime, state.time, 2);
        updateStepperDisplay(elements.valVol, state.volatility, 2);
        updateStepperDisplay(elements.valRate, state.riskFree, 2);
        updateStepperDisplay(elements.valDiv, state.dividend, 2);
        updateOptionTypeUI();
        calculate();
    }

    // ========================================
    // Event Listener Setup
    // ========================================

    function initEventListeners() {
        // Option Type Toggle
        elements.btnCall.addEventListener('click', () => handleOptionTypeChange('call'));
        elements.btnPut.addEventListener('click', () => handleOptionTypeChange('put'));

        // Text Input Fields
        elements.inputStock.addEventListener('input', () => {
            state.stock = parseNumber(elements.inputStock.value, state.stock);
            calculate();
        });
        elements.inputStock.addEventListener('blur', () => handleInputChange('stock', elements.inputStock));

        elements.inputStrike.addEventListener('input', () => {
            state.strike = parseNumber(elements.inputStrike.value, state.strike);
            calculate();
        });
        elements.inputStrike.addEventListener('blur', () => handleInputChange('strike', elements.inputStrike));

        // Time Stepper
        elements.btnTimeInc.addEventListener('click', () => 
            handleStepper('time', elements.valTime, stepperConfig.time, true));
        elements.btnTimeDec.addEventListener('click', () => 
            handleStepper('time', elements.valTime, stepperConfig.time, false));

        // Volatility Stepper
        elements.btnVolInc.addEventListener('click', () => 
            handleStepper('volatility', elements.valVol, stepperConfig.vol, true));
        elements.btnVolDec.addEventListener('click', () => 
            handleStepper('volatility', elements.valVol, stepperConfig.vol, false));

        // Risk-Free Rate Stepper
        elements.btnRateInc.addEventListener('click', () => 
            handleStepper('riskFree', elements.valRate, stepperConfig.rate, true));
        elements.btnRateDec.addEventListener('click', () => 
            handleStepper('riskFree', elements.valRate, stepperConfig.rate, false));

        // Dividend Stepper
        elements.btnDivInc.addEventListener('click', () => 
            handleStepper('dividend', elements.valDiv, stepperConfig.div, true));
        elements.btnDivDec.addEventListener('click', () => 
            handleStepper('dividend', elements.valDiv, stepperConfig.div, false));

        // Action Buttons
        elements.btnCalculate.addEventListener('click', calculate);
        elements.btnReset.addEventListener('click', handleReset);

        // Calculation Method Buttons
        if (elements.methodAnalytical) {
            elements.methodAnalytical.addEventListener('click', () => handleMethodChange('analytical'));
        }
        if (elements.methodNumerical) {
            elements.methodNumerical.addEventListener('click', () => handleMethodChange('numerical'));
        }
        if (elements.methodBoth) {
            elements.methodBoth.addEventListener('click', () => handleMethodChange('both'));
        }
    }

    /**
     * Handle calculation method change
     */
    function handleMethodChange(method) {
        state.calculationMethod = method;
        updateMethodButtons(method);
        calculate();
    }

    /**
     * Update method button styles
     */
    function updateMethodButtons(activeMethod) {
        const activeClass = 'method-btn px-2 py-1 text-[10px] font-semibold rounded transition-all bg-primary text-white';
        const inactiveClass = 'method-btn px-2 py-1 text-[10px] font-medium rounded transition-all text-gray-500 hover:text-gray-700 dark:text-gray-400';

        if (elements.methodAnalytical) {
            elements.methodAnalytical.className = activeMethod === 'analytical' ? activeClass : inactiveClass;
        }
        if (elements.methodNumerical) {
            elements.methodNumerical.className = activeMethod === 'numerical' ? activeClass : inactiveClass;
        }
        if (elements.methodBoth) {
            elements.methodBoth.className = activeMethod === 'both' ? activeClass : inactiveClass;
        }
    }

    // ========================================
    // Visualization Setup
    // ========================================

    /**
     * Update visualization button styles
     */
    function updateVizButtons(activeGreek) {
        const activeClass = 'viz-btn px-3 py-1.5 text-xs font-semibold rounded-lg transition-all bg-primary text-white';
        const inactiveClass = 'viz-btn px-3 py-1.5 text-xs font-medium rounded-lg transition-all bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700';

        const buttons = {
            delta: elements.vizDelta,
            gamma: elements.vizGamma,
            vega: elements.vizVega,
            theta: elements.vizTheta,
            rho: elements.vizRho
        };

        Object.keys(buttons).forEach(greek => {
            if (buttons[greek]) {
                buttons[greek].className = greek === activeGreek ? activeClass : inactiveClass;
            }
        });
    }

    /**
     * Handle Greek visualization button click
     */
    function handleVizButtonClick(greek) {
        state.selectedGreek = greek;
        updateVizButtons(greek);
        
        if (heatmap) {
            heatmap.render(greek, state.optionType);
        }
    }

    /**
     * Initialize visualization components
     */
    function initVisualization() {
        // Check if visualization elements exist
        if (!elements.greeksHeatmap) {
            return;
        }

        // Check if GreeksHeatmap class is available
        if (typeof GreeksHeatmap === 'undefined') {
            console.warn('GreeksHeatmap class not found. Ensure visualization.js is loaded.');
            return;
        }

        // Initialize heatmap with current params
        const volatility = state.volatility / 100;
        const riskFree = state.riskFree / 100;
        const dividend = state.dividend / 100;

        heatmap = new GreeksHeatmap('greeks-heatmap', {
            stock: state.stock,
            strike: state.strike,
            time: state.time,
            volatility: volatility,
            riskFree: riskFree,
            dividend: dividend
        });

        // Add button event listeners
        if (elements.vizDelta) {
            elements.vizDelta.addEventListener('click', () => handleVizButtonClick('delta'));
        }
        if (elements.vizGamma) {
            elements.vizGamma.addEventListener('click', () => handleVizButtonClick('gamma'));
        }
        if (elements.vizVega) {
            elements.vizVega.addEventListener('click', () => handleVizButtonClick('vega'));
        }
        if (elements.vizTheta) {
            elements.vizTheta.addEventListener('click', () => handleVizButtonClick('theta'));
        }
        if (elements.vizRho) {
            elements.vizRho.addEventListener('click', () => handleVizButtonClick('rho'));
        }

        // Initial render
        heatmap.render(state.selectedGreek, state.optionType);
    }

    // ========================================
    // Initialization
    // ========================================

    function init() {
        // Verify BlackScholes is available
        if (typeof BlackScholes === 'undefined') {
            console.error('BlackScholes class not found. Ensure math.js is loaded before ui.js');
            return;
        }

        // Setup event listeners
        initEventListeners();

        // Initial UI state
        updateOptionTypeUI();

        // Initialize visualization
        initVisualization();

        // Run initial calculation
        calculate();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
