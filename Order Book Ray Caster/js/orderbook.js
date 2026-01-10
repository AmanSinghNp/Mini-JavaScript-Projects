/**
 * Order Book Ray Caster - Order Book Logic
 * Manages the array of bricks (limit orders)
 */

class OrderBook {
    constructor(canvasHeight) {
        this.canvasHeight = canvasHeight;
        this.bricks = [];
        this.basePrice = 100;
        this.priceStep = 0.25;
    }

    generateBricks(count = 12, isSellSide = true) {
        this.bricks = [];
        const startY = 40;
        const spacing = 6;
        const brickHeight = 30;
        
        // Find max volume for scaling
        const volumes = [];
        for (let i = 0; i < count; i++) {
            // Random volume with some variance, clustered around certain prices
            const baseVolume = 20 + Math.random() * 60;
            const clusterBonus = Math.random() > 0.7 ? Math.random() * 50 : 0;
            volumes.push(baseVolume + clusterBonus);
        }
        const maxVolume = Math.max(...volumes);

        for (let i = 0; i < count; i++) {
            const y = startY + i * (brickHeight + spacing);
            const price = isSellSide 
                ? this.basePrice + (i + 1) * this.priceStep
                : this.basePrice - (i + 1) * this.priceStep;
            
            const brick = new Brick(price, volumes[i], y, maxVolume);
            this.bricks.push(brick);
        }

        return this.bricks;
    }

    getBrickAtPosition(x, y, canvasWidth) {
        for (const brick of this.bricks) {
            if (brick.destroyed) continue;
            
            const brickX = brick.getX(canvasWidth);
            if (x >= brickX && x <= brickX + brick.width &&
                y >= brick.y && y <= brick.y + brick.height) {
                return brick;
            }
        }
        return null;
    }

    getFirstBrickInPath(ballX, ballY, ballRadius, canvasWidth) {
        // Find the first brick that the ball would hit (leftmost x position)
        let closestBrick = null;
        let closestX = Infinity;

        for (const brick of this.bricks) {
            if (brick.destroyed) continue;
            
            const brickX = brick.getX(canvasWidth);
            const brickTop = brick.y;
            const brickBottom = brick.y + brick.height;
            
            // Check if ball is vertically aligned with this brick
            if (ballY + ballRadius >= brickTop && ballY - ballRadius <= brickBottom) {
                if (brickX < closestX) {
                    closestX = brickX;
                    closestBrick = brick;
                }
            }
        }

        return closestBrick;
    }

    removeBrick(brick) {
        brick.destroyed = true;
    }

    getActiveBricks() {
        return this.bricks.filter(b => !b.destroyed);
    }

    getTotalVolume() {
        return this.bricks
            .filter(b => !b.destroyed)
            .reduce((sum, b) => sum + b.volume, 0);
    }

    reset() {
        this.bricks = [];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrderBook };
}
