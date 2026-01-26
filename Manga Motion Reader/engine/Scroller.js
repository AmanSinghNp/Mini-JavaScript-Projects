export class Scroller {
    constructor() {
        this.scrollY = 0;
        this.lastScrollY = 0;
        this.speed = 0;
        this.ticking = false;
        
        this.listeners = [];
        
        window.addEventListener('scroll', this.onScroll.bind(this));
        
        // Start run loop
        this.update();
    }
    
    onScroll() {
        this.scrollY = window.scrollY;
        
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.update();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }
    
    update() {
        // Calculate velocity (difference between frames)
        // Note: Simple diff, could be smoothed later in Physics.js
        this.speed = this.scrollY - this.lastScrollY;
        this.lastScrollY = this.scrollY;
        
        // Notify listeners
        this.listeners.forEach(fn => fn({
            scrollY: this.scrollY,
            speed: this.speed
        }));
        
        // Continue loop if needed, though here we rely on scroll event triggering RAFr
        // BUT for physics inertia we might need constant updates even when not scrolling
        // For now, let's keep it simple and optimized: only update on scroll-ish
        // Actually, for spring physics we NEED a constant loop to settle the springs.
        // So let's change this to a constant loop.
    }
    
    // Constant loop for physics
    startLoop(callback) {
        const loop = () => {
            this.scrollY = window.scrollY;
            this.speed = this.scrollY - this.lastScrollY;
            this.lastScrollY = this.scrollY;
            
            callback({
                scrollY: this.scrollY,
                speed: this.speed
            });
            
            requestAnimationFrame(loop);
        };
        loop();
    }
}
