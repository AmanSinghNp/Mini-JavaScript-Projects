/**
 * Order Book Ray Caster - Main Application
 * Event handlers, physics simulation, and game loop
 */

class OrderBookRayCaster {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('canvas');
        this.renderer = new Renderer(this.canvas);
        this.orderBook = new OrderBook(this.canvas.height);
        
        // State
        this.ball = null;
        this.isBuyOrder = true;
        this.isAnimating = false;
        this.animationId = null;
        
        // Stats
        this.stats = {
            ordersHit: 0,
            volumeConsumed: 0,
            slippage: 0,
            startPrice: 0,
            lastPrice: 0
        };

        // Impact effects
        this.impactEffects = [];

        // Initialize
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.resize();
        this.reset();
        
        // Start render loop
        this.render();
    }

    setupEventListeners() {
        // Resize
        window.addEventListener('resize', () => this.resize());

        // Fire button
        document.getElementById('btn-fire').addEventListener('click', () => this.fire());

        // Reset button
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());

        // Order type toggle
        document.querySelectorAll('input[name="order-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.isBuyOrder = e.target.value === 'buy';
                this.reset();
            });
        });

        // Theme toggle
        document.getElementById('btn-theme').addEventListener('click', () => this.toggleDarkMode());

        // Order size slider
        const sizeSlider = document.getElementById('order-size');
        const sizeValue = document.getElementById('size-value');
        sizeSlider.addEventListener('input', (e) => {
            sizeValue.textContent = e.target.value;
        });
    }

    setupDarkMode() {
        // Check for saved preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
            this.renderer.setDarkMode(true);
        }
    }

    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.renderer.setDarkMode(isDark);
    }

    resize() {
        this.renderer.resize();
        // Regenerate order book for new size if not animating
        if (!this.isAnimating && this.orderBook.bricks.length > 0) {
            this.reset();
        }
    }

    reset() {
        // Stop any animation
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.ball = null;
        this.impactEffects = [];
        
        // Reset stats
        this.stats = {
            ordersHit: 0,
            volumeConsumed: 0,
            slippage: 0,
            startPrice: 0,
            lastPrice: 0
        };
        this.updateStatsUI();

        // Generate new order book
        // For buy orders, we hit sell orders (asks) - sorted low to high
        // For sell orders, we hit buy orders (bids) - sorted high to low
        this.orderBook.generateBricks(12, this.isBuyOrder);
        
        // Enable fire button
        document.getElementById('btn-fire').disabled = false;
    }

    fire() {
        if (this.isAnimating) return;

        const orderSize = parseInt(document.getElementById('order-size').value);
        
        // Calculate spawn position (middle of the canvas or where bricks are)
        const bricks = this.orderBook.getActiveBricks();
        if (bricks.length === 0) {
            this.showResult('No orders in book!', 'Reset to generate new orders');
            return;
        }

        // Start position - left side, aligned with first brick
        const firstBrick = bricks[0];
        const startY = firstBrick.y + firstBrick.height / 2;
        
        // Set start price for slippage calculation
        this.stats.startPrice = firstBrick.price;
        
        // Create ball with velocity towards bricks
        this.ball = new Ball(orderSize, 30, startY, 6);
        
        // Start animation
        this.isAnimating = true;
        document.getElementById('btn-fire').disabled = true;
        
        this.animate();
    }

    animate() {
        if (!this.isAnimating) return;

        // Update ball
        if (this.ball && this.ball.active) {
            this.ball.update();
            
            // Check collision with bricks
            this.checkCollision();
            
            // Check if ball went off screen
            if (this.ball.x > this.canvas.width + 50) {
                this.isAnimating = false;
                this.showResult('Order Complete!', `Slippage: $${this.stats.slippage.toFixed(2)}`);
            }
        }

        // Update impact effects
        this.impactEffects = this.impactEffects.filter(effect => {
            effect.progress += 0.05;
            return effect.progress < 1;
        });

        // Render
        this.render();

        // Continue animation
        if (this.isAnimating) {
            this.animationId = requestAnimationFrame(() => this.animate());
        }
    }

    checkCollision() {
        if (!this.ball || !this.ball.active) return;

        const activeBricks = this.orderBook.getActiveBricks();
        
        for (const brick of activeBricks) {
            const brickX = brick.getX(this.canvas.width);
            const brickRight = brickX + brick.width;
            const brickTop = brick.y;
            const brickBottom = brick.y + brick.height;
            
            // Check if ball collides with brick
            const ballRight = this.ball.x + this.ball.radius;
            const ballTop = this.ball.y - this.ball.radius;
            const ballBottom = this.ball.y + this.ball.radius;
            
            if (ballRight >= brickX && 
                this.ball.x <= brickRight &&
                ballBottom >= brickTop && 
                ballTop <= brickBottom) {
                
                // Collision detected!
                this.handleCollision(brick);
                break; // Only handle one collision per frame
            }
        }
    }

    handleCollision(brick) {
        const impactX = brick.getX(this.canvas.width);
        const impactY = brick.y + brick.height / 2;

        // Add impact effect
        this.impactEffects.push({ x: impactX, y: impactY, progress: 0 });

        // Determine outcome
        if (this.ball.mass > brick.volume) {
            // Ball destroys brick and continues with reduced mass
            this.ball.mass -= brick.volume;
            this.ball.createImpactParticles(impactX, impactY, '239, 68, 68');
            brick.destroyed = true;
            
            // Update stats
            this.stats.ordersHit++;
            this.stats.volumeConsumed += brick.volume;
            this.stats.lastPrice = brick.price;
            this.stats.slippage = Math.abs(brick.price - this.stats.startPrice);
            
        } else if (this.ball.mass === brick.volume) {
            // Exact match - both consumed
            brick.destroyed = true;
            this.ball.active = false;
            this.ball.createImpactParticles(impactX, impactY, '16, 185, 129');
            
            this.stats.ordersHit++;
            this.stats.volumeConsumed += brick.volume;
            this.stats.lastPrice = brick.price;
            this.stats.slippage = Math.abs(brick.price - this.stats.startPrice);
            
            // Order fully filled!
            setTimeout(() => {
                this.isAnimating = false;
                this.showResult('Order Filled!', `Perfect fill at $${brick.price.toFixed(2)}`);
            }, 500);
            
        } else {
            // Ball stopped by brick (brick is larger)
            brick.volume -= this.ball.mass;
            brick.hitFlash = 1;
            this.ball.active = false;
            this.ball.createImpactParticles(impactX, impactY, '16, 185, 129');
            
            this.stats.ordersHit++;
            this.stats.volumeConsumed += this.ball.mass;
            this.stats.lastPrice = brick.price;
            this.stats.slippage = Math.abs(brick.price - this.stats.startPrice);
            
            // Order fully filled!
            setTimeout(() => {
                this.isAnimating = false;
                this.showResult('Order Filled!', `Filled at $${brick.price.toFixed(2)}`);
            }, 500);
        }

        this.updateStatsUI();
    }

    showResult(title, subtitle) {
        // The result will be shown in the render loop
        this.resultMessage = { title, subtitle };
        this.render();
        
        // Re-enable fire button after a delay
        setTimeout(() => {
            document.getElementById('btn-fire').disabled = false;
            this.resultMessage = null;
        }, 2000);
    }

    updateStatsUI() {
        document.getElementById('stat-orders').textContent = this.stats.ordersHit;
        document.getElementById('stat-volume').textContent = this.stats.volumeConsumed.toFixed(0);
        document.getElementById('stat-slippage').textContent = `$${this.stats.slippage.toFixed(2)}`;
        
        const avgPrice = this.stats.ordersHit > 0 ? this.stats.lastPrice : 0;
        document.getElementById('stat-avg-price').textContent = avgPrice > 0 ? `$${avgPrice.toFixed(2)}` : '—';
    }

    render() {
        this.renderer.clear();
        
        // Draw launch zone
        const launchY = this.ball ? this.ball.y : this.canvas.height / 2;
        this.renderer.drawLaunchZone(launchY, this.isBuyOrder);
        
        // Draw order book (bricks)
        this.renderer.drawOrderBook(this.orderBook, this.isBuyOrder);
        
        // Draw impact effects
        for (const effect of this.impactEffects) {
            this.renderer.drawImpactZone(effect.x, effect.y, effect.progress);
        }
        
        // Draw ball
        if (this.ball) {
            this.renderer.drawBall(this.ball, this.isBuyOrder);
        }

        // Draw in-canvas stats
        this.renderer.drawStats(this.stats);

        // Draw result message if any
        if (this.resultMessage) {
            this.renderer.drawMessage(this.resultMessage.title, this.resultMessage.subtitle);
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new OrderBookRayCaster();
});
