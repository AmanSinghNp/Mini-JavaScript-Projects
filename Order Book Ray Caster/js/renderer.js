/**
 * Order Book Ray Caster - Canvas Renderer
 * Handles all drawing operations
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDarkMode = false;
        this.gridOpacity = 0.1;
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    clear() {
        const bgColor = this.isDarkMode ? '#0f1115' : '#f8f9fa';
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw subtle grid
        this.drawGrid();
    }

    drawGrid() {
        const gridColor = this.isDarkMode 
            ? `rgba(255, 255, 255, ${this.gridOpacity})`
            : `rgba(0, 0, 0, ${this.gridOpacity})`;
        
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 0.5;

        const gridSize = 40;
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawLaunchZone(y, isBuyOrder) {
        const zoneWidth = 80;
        const gradient = this.ctx.createLinearGradient(0, 0, zoneWidth, 0);
        
        if (isBuyOrder) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, zoneWidth, this.canvas.height);

        // Launch indicator
        const indicatorColor = isBuyOrder ? '#10b981' : '#ef4444';
        this.ctx.strokeStyle = indicatorColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(60, y - 30);
        this.ctx.lineTo(60, y + 30);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Arrow
        this.ctx.fillStyle = indicatorColor;
        this.ctx.beginPath();
        this.ctx.moveTo(70, y);
        this.ctx.lineTo(55, y - 8);
        this.ctx.lineTo(55, y + 8);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawOrderBook(orderBook, isSellSide) {
        for (const brick of orderBook.bricks) {
            brick.draw(this.ctx, this.canvas.width, isSellSide);
        }
    }

    drawBall(ball, isBuyOrder) {
        ball.draw(this.ctx, isBuyOrder);
    }

    drawImpactZone(x, y, progress) {
        // Expanding ring effect
        const radius = 20 + progress * 50;
        const alpha = 1 - progress;
        
        this.ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
        this.ctx.lineWidth = 3 * (1 - progress);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawStats(stats) {
        const padding = 15;
        const boxWidth = 160;
        const boxHeight = 80;
        const x = padding;
        const y = this.canvas.height - boxHeight - padding;

        // Background
        this.ctx.fillStyle = this.isDarkMode 
            ? 'rgba(24, 26, 32, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, boxWidth, boxHeight, 8);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = this.isDarkMode 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Text
        const textColor = this.isDarkMode ? '#f3f4f6' : '#1f2937';
        this.ctx.fillStyle = textColor;
        this.ctx.font = '11px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`Orders Hit: ${stats.ordersHit}`, x + 12, y + 22);
        this.ctx.fillText(`Volume Consumed: ${stats.volumeConsumed.toFixed(0)}`, x + 12, y + 40);
        this.ctx.fillText(`Slippage: $${stats.slippage.toFixed(2)}`, x + 12, y + 58);
    }

    drawMessage(message, subtext = '') {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Background overlay
        this.ctx.fillStyle = this.isDarkMode 
            ? 'rgba(15, 17, 21, 0.8)' 
            : 'rgba(248, 249, 250, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Message
        const textColor = this.isDarkMode ? '#f3f4f6' : '#1f2937';
        this.ctx.fillStyle = textColor;
        this.ctx.font = 'bold 24px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(message, centerX, centerY - 15);

        if (subtext) {
            this.ctx.font = '14px Inter, sans-serif';
            this.ctx.fillStyle = this.isDarkMode ? '#9ca3af' : '#6b7280';
            this.ctx.fillText(subtext, centerX, centerY + 20);
        }
    }

    setDarkMode(isDark) {
        this.isDarkMode = isDark;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Renderer };
}
