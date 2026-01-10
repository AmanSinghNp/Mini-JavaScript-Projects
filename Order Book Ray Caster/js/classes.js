/**
 * Order Book Ray Caster - Core Classes
 * Brick and Ball classes for physics simulation
 */

class Brick {
    constructor(price, volume, y, maxVolume) {
        this.price = price;
        this.volume = volume;
        this.y = y;
        this.height = 30;
        this.maxVolume = maxVolume;
        this.destroyed = false;
        this.destroyAnimation = 0;
        this.hitFlash = 0;
    }

    get width() {
        // Width scales with volume, min 40px, max based on canvas
        const minWidth = 40;
        const maxWidth = 200;
        return minWidth + (this.volume / this.maxVolume) * (maxWidth - minWidth);
    }

    getX(canvasWidth) {
        // Right-aligned
        return canvasWidth - this.width - 20;
    }

    draw(ctx, canvasWidth, isSellSide) {
        if (this.destroyed) return;

        const x = this.getX(canvasWidth);
        const baseColor = isSellSide ? { r: 239, g: 68, b: 68 } : { r: 16, g: 185, b: 129 };
        
        // Flash effect when hit
        let alpha = 1;
        if (this.hitFlash > 0) {
            alpha = 0.5 + Math.sin(this.hitFlash * 10) * 0.3;
            this.hitFlash -= 0.1;
        }

        // Brick body with gradient
        const gradient = ctx.createLinearGradient(x, this.y, x, this.y + this.height);
        gradient.addColorStop(0, `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha * 0.9})`);
        gradient.addColorStop(1, `rgba(${baseColor.r * 0.7}, ${baseColor.g * 0.7}, ${baseColor.b * 0.7}, ${alpha})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, this.y, this.width, this.height, 4);
        ctx.fill();

        // Border
        ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Volume text
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.volume.toFixed(0), x + this.width / 2, this.y + this.height / 2);

        // Price label on the side
        ctx.fillStyle = `rgba(150, 150, 150, ${alpha * 0.8})`;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`$${this.price.toFixed(2)}`, x - 8, this.y + this.height / 2);
    }
}

class Ball {
    constructor(mass, startX, startY, velocity) {
        this.initialMass = mass;
        this.mass = mass;
        this.x = startX;
        this.y = startY;
        this.velocity = velocity;
        this.radius = this.calculateRadius();
        this.active = true;
        this.trail = [];
        this.impactParticles = [];
    }

    calculateRadius() {
        // Radius scales with mass
        return Math.max(12, Math.min(40, 8 + Math.sqrt(this.mass) * 2));
    }

    update() {
        if (!this.active) return;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 15) {
            this.trail.shift();
        }

        // Fade trail
        this.trail.forEach(point => {
            point.alpha -= 0.07;
        });
        this.trail = this.trail.filter(p => p.alpha > 0);

        // Move ball
        this.x += this.velocity;

        // Update radius based on mass
        this.radius = this.calculateRadius();

        // Update particles
        this.impactParticles = this.impactParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // gravity
            p.alpha -= 0.03;
            return p.alpha > 0;
        });
    }

    createImpactParticles(impactX, impactY, color) {
        for (let i = 0; i < 8; i++) {
            this.impactParticles.push({
                x: impactX,
                y: impactY,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                alpha: 1,
                color: color
            });
        }
    }

    reduceMass(amount) {
        this.mass = Math.max(0, this.mass - amount);
        if (this.mass <= 0) {
            this.active = false;
        }
    }

    draw(ctx, isBuyOrder) {
        // Draw trail
        this.trail.forEach((point, i) => {
            const trailRadius = this.radius * (i / this.trail.length) * 0.6;
            ctx.beginPath();
            ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
            ctx.fillStyle = isBuyOrder 
                ? `rgba(16, 185, 129, ${point.alpha * 0.3})`
                : `rgba(239, 68, 68, ${point.alpha * 0.3})`;
            ctx.fill();
        });

        // Draw particles
        this.impactParticles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            ctx.fill();
        });

        if (!this.active) return;

        // Ball glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 1.5
        );
        
        if (isBuyOrder) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Ball body
        const bodyGradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3, this.y - this.radius * 0.3, 0,
            this.x, this.y, this.radius
        );
        
        if (isBuyOrder) {
            bodyGradient.addColorStop(0, '#34d399');
            bodyGradient.addColorStop(1, '#059669');
        } else {
            bodyGradient.addColorStop(0, '#f87171');
            bodyGradient.addColorStop(1, '#dc2626');
        }
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Mass label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.mass.toFixed(0), this.x, this.y);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Brick, Ball };
}
