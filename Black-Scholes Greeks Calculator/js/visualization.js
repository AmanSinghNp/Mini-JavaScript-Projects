/**
 * Greeks Heatmap Visualization
 * Interactive canvas-based heatmap showing how Greeks change across S and σ
 */

class GreeksHeatmap {
    /**
     * @param {string} canvasId - ID of the canvas element
     * @param {object} params - Current option parameters
     */
    constructor(canvasId, params) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Store base parameters
        this.params = { ...params };
        
        // Heatmap configuration
        this.config = {
            gridSize: 20,           // 20x20 cells
            stockRange: [0.7, 1.3], // 70% to 130% of current S
            volRange: [0.05, 0.50], // 5% to 50% volatility
            padding: { top: 30, right: 80, bottom: 50, left: 60 },
            colorStops: [
                { pos: 0, color: [59, 130, 246] },    // Blue
                { pos: 0.5, color: [255, 255, 255] }, // White
                { pos: 1, color: [239, 68, 68] }      // Red
            ]
        };

        // Cache dimensions
        this._updateDimensions();
    }

    /**
     * Update parameters from calculator state
     */
    updateParams(params) {
        this.params = { ...params };
    }

    /**
     * Update canvas dimensions
     */
    _updateDimensions() {
        const rect = this.canvas.getBoundingClientRect();
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        const { padding } = this.config;
        this.plotWidth = this.width - padding.left - padding.right;
        this.plotHeight = this.height - padding.top - padding.bottom;
        this.cellWidth = this.plotWidth / this.config.gridSize;
        this.cellHeight = this.plotHeight / this.config.gridSize;
    }

    /**
     * Render heatmap for selected Greek
     * @param {string} greekType - 'delta', 'gamma', 'vega', 'theta', or 'rho'
     * @param {string} optionType - 'call' or 'put'
     */
    render(greekType, optionType = 'call') {
        this._updateDimensions();
        
        // Clear canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Generate data
        const data = this._generateHeatmapData(greekType, optionType);
        
        // Draw components
        this._drawHeatmap(data);
        this._drawAxes(greekType);
        this._drawColorScale(data.min, data.max, greekType);
        this._drawCurrentPosition();
    }

    /**
     * Generate Greek values across S and σ grid
     */
    _generateHeatmapData(greekType, optionType) {
        const { gridSize, stockRange, volRange } = this.config;
        const { stock, strike, time, riskFree, dividend } = this.params;
        
        const data = [];
        let min = Infinity;
        let max = -Infinity;

        // Stock price range
        const sMin = stock * stockRange[0];
        const sMax = stock * stockRange[1];
        const sStep = (sMax - sMin) / gridSize;

        // Volatility range
        const vMin = volRange[0];
        const vMax = volRange[1];
        const vStep = (vMax - vMin) / gridSize;

        for (let i = 0; i < gridSize; i++) {
            const row = [];
            const currentVol = vMax - i * vStep; // Volatility decreases top to bottom

            for (let j = 0; j < gridSize; j++) {
                const currentStock = sMin + j * sStep;
                
                // Calculate Greek at this point
                const bs = new BlackScholes(
                    currentStock,
                    strike,
                    time,
                    currentVol,
                    riskFree,
                    dividend
                );

                let value = this._getGreekValue(bs, greekType, optionType);
                
                row.push(value);
                if (value < min) min = value;
                if (value > max) max = value;
            }
            data.push(row);
        }

        return { grid: data, min, max, sMin, sMax, vMin, vMax };
    }

    /**
     * Extract Greek value from BlackScholes instance
     */
    _getGreekValue(bs, greekType, optionType) {
        switch (greekType) {
            case 'delta':
                return bs.delta()[optionType];
            case 'gamma':
                return bs.gamma();
            case 'vega':
                return bs.vega() / 100; // Scale for display
            case 'theta':
                return bs.theta()[optionType] / 365; // Daily theta
            case 'rho':
                return bs.rho()[optionType] / 100; // Scale for display
            default:
                return 0;
        }
    }

    /**
     * Draw the heatmap grid
     */
    _drawHeatmap(data) {
        const { padding } = this.config;
        const { grid, min, max } = data;

        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                const value = grid[i][j];
                const color = this._valueToColor(value, min, max);

                const x = padding.left + j * this.cellWidth;
                const y = padding.top + i * this.cellHeight;

                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, this.cellWidth + 0.5, this.cellHeight + 0.5);
            }
        }
    }

    /**
     * Map value to color using gradient
     */
    _valueToColor(value, min, max) {
        if (max === min) return 'rgb(255, 255, 255)';
        
        const normalized = (value - min) / (max - min);
        const stops = this.config.colorStops;

        // Find surrounding color stops
        let lower = stops[0];
        let upper = stops[stops.length - 1];

        for (let i = 0; i < stops.length - 1; i++) {
            if (normalized >= stops[i].pos && normalized <= stops[i + 1].pos) {
                lower = stops[i];
                upper = stops[i + 1];
                break;
            }
        }

        // Interpolate
        const range = upper.pos - lower.pos;
        const t = range === 0 ? 0 : (normalized - lower.pos) / range;

        const r = Math.round(lower.color[0] + (upper.color[0] - lower.color[0]) * t);
        const g = Math.round(lower.color[1] + (upper.color[1] - lower.color[1]) * t);
        const b = Math.round(lower.color[2] + (upper.color[2] - lower.color[2]) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Draw axes with labels
     */
    _drawAxes(greekType) {
        const { padding, stockRange, volRange, gridSize } = this.config;
        const { stock } = this.params;
        
        this.ctx.strokeStyle = '#374151';
        this.ctx.fillStyle = '#374151';
        this.ctx.lineWidth = 1;
        this.ctx.font = '11px Inter, sans-serif';

        // X-axis (Stock Price)
        const sMin = stock * stockRange[0];
        const sMax = stock * stockRange[1];

        for (let i = 0; i <= 4; i++) {
            const x = padding.left + (i / 4) * this.plotWidth;
            const value = sMin + (i / 4) * (sMax - sMin);

            // Tick mark
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding.top + this.plotHeight);
            this.ctx.lineTo(x, padding.top + this.plotHeight + 5);
            this.ctx.stroke();

            // Label
            this.ctx.textAlign = 'center';
            this.ctx.fillText('$' + value.toFixed(0), x, padding.top + this.plotHeight + 18);
        }

        // X-axis title
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.fillText('Stock Price (S)', padding.left + this.plotWidth / 2, this.height - 8);

        // Y-axis (Volatility)
        this.ctx.font = '11px Inter, sans-serif';
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (i / 4) * this.plotHeight;
            const value = volRange[1] - (i / 4) * (volRange[1] - volRange[0]);

            // Tick mark
            this.ctx.beginPath();
            this.ctx.moveTo(padding.left - 5, y);
            this.ctx.lineTo(padding.left, y);
            this.ctx.stroke();

            // Label
            this.ctx.textAlign = 'right';
            this.ctx.fillText((value * 100).toFixed(0) + '%', padding.left - 8, y + 4);
        }

        // Y-axis title (rotated)
        this.ctx.save();
        this.ctx.translate(15, padding.top + this.plotHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Volatility (σ)', 0, 0);
        this.ctx.restore();

        // Title
        this.ctx.font = 'bold 13px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        const greekSymbols = { delta: 'Δ', gamma: 'Γ', vega: 'V', theta: 'Θ', rho: 'ρ' };
        this.ctx.fillText(
            `${greekSymbols[greekType]} ${greekType.charAt(0).toUpperCase() + greekType.slice(1)} Surface`,
            padding.left + this.plotWidth / 2,
            16
        );
    }

    /**
     * Draw color scale legend
     */
    _drawColorScale(min, max, greekType) {
        const { padding } = this.config;
        const x = this.width - padding.right + 15;
        const y = padding.top;
        const width = 15;
        const height = this.plotHeight;

        // Draw gradient
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        this.config.colorStops.forEach(stop => {
            gradient.addColorStop(1 - stop.pos, `rgb(${stop.color.join(',')})`);
        });

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);

        // Border
        this.ctx.strokeStyle = '#d1d5db';
        this.ctx.strokeRect(x, y, width, height);

        // Labels
        this.ctx.fillStyle = '#374151';
        this.ctx.font = '10px JetBrains Mono, monospace';
        this.ctx.textAlign = 'left';

        // Format based on greek type
        const format = (val) => {
            if (greekType === 'theta') return (val * 365).toFixed(2);
            if (greekType === 'vega' || greekType === 'rho') return (val * 100).toFixed(2);
            return val.toFixed(4);
        };

        this.ctx.fillText(format(max), x + width + 5, y + 10);
        this.ctx.fillText(format((max + min) / 2), x + width + 5, y + height / 2 + 4);
        this.ctx.fillText(format(min), x + width + 5, y + height);
    }

    /**
     * Draw marker for current S and σ position
     */
    _drawCurrentPosition() {
        const { padding, stockRange, volRange } = this.config;
        const { stock, volatility } = this.params;
        
        const sMin = stock * stockRange[0];
        const sMax = stock * stockRange[1];
        
        // Current position (center of range for S, actual vol for σ)
        const xPos = padding.left + ((stock - sMin) / (sMax - sMin)) * this.plotWidth;
        const yPos = padding.top + ((volRange[1] - volatility) / (volRange[1] - volRange[0])) * this.plotHeight;

        // Crosshair
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([4, 2]);

        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(xPos, padding.top);
        this.ctx.lineTo(xPos, padding.top + this.plotHeight);
        this.ctx.stroke();

        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(padding.left, yPos);
        this.ctx.lineTo(padding.left + this.plotWidth, yPos);
        this.ctx.stroke();

        this.ctx.setLineDash([]);

        // Center dot
        this.ctx.beginPath();
        this.ctx.arc(xPos, yPos, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#000000';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GreeksHeatmap };
}
