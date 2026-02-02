
export class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.classList.add('particle-overlay');
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.pool = []; // Object pool
        this.maxParticles = 50; // Performance limit
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initParticles();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initParticles() {
        // Pre-fill pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.pool.push({
                x: 0, 
                y: 0, 
                vx: 0, 
                vy: 0, 
                size: 0, 
                life: 0, 
                active: false
            });
        }
    }
    
    spawn(x, y) {
        // Find inactive particle
        const p = this.pool.find(p => !p.active);
        if (!p) return;
        
        p.active = true;
        p.x = x || Math.random() * this.canvas.width;
        p.y = y || Math.random() * this.canvas.height;
        p.size = Math.random() * 4 + 2; // Larger for petals
        p.life = 1.0;
        
        // Gentle float velocity
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() * 0.5) + 0.2; 
        
        // Petal specifics
        p.rotation = Math.random() * Math.PI * 2;
        p.rotationSpeed = (Math.random() - 0.5) * 0.02;
        p.oscillationSpeed = Math.random() * 0.05 + 0.02;
        p.oscillationOffset = Math.random() * Math.PI * 2;
    }
    
    update(scrollVelocity) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Chance to spawn ambient particles
        if (Math.random() < 0.05) this.spawn();
        
        this.pool.forEach(p => {
            if (!p.active) return;
            
            // Influence by scroll (Fluid feel)
            p.y += p.vy - (scrollVelocity * 0.05); 
            p.x += p.vx + (scrollVelocity * 0.01) + Math.sin(p.life * 10 + p.oscillationOffset) * 0.5;
            
            p.rotation += p.rotationSpeed;
            p.life -= 0.003; // Longer life
            
            if (p.life <= 0 || p.y > this.canvas.height + 50 || p.y < -50) {
                p.active = false;
            }
            
            // Render Petal
            this.ctx.save();
            this.ctx.globalAlpha = p.life * 0.8;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            
            // Blue Moon Weed gradient
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            gradient.addColorStop(0, "rgba(200, 230, 255, 1)");
            gradient.addColorStop(0.5, "rgba(100, 200, 255, 0.8)");
            gradient.addColorStop(1, "rgba(50, 150, 255, 0)");
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = "rgba(100, 200, 255, 0.5)";
            
            this.ctx.restore();
        });
        
        this.ctx.globalAlpha = 1.0;
    }
}
