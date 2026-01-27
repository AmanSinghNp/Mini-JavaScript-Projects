import { Spring } from './Physics.js';

export class Panel {
    constructor(element) {
        this.element = element;
        this.content = element.querySelector('.panel-content');
        this.speed = parseFloat(element.dataset.speed || 1.0);
        
        // Physics for Y position (Parallax + Lag)
        this.springY = new Spring({
            stiffness: 0.05,
            damping: 0.75,
            mass: 1
        });
        
        // Physics for Scale (Impact effect)
        this.springScale = new Spring({
            initialValue: 0.8,
            stiffness: 0.1,
            damping: 0.6
        });
        
        // Intersection Observer for visibility
        this.isVisible = false;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (entry.isIntersecting) {
                    // Trigger entry effect
                    this.springScale.setTarget(1.0);
                } else {
                    // Reset or minimize
                    // this.springScale.setTarget(0.9);
                }
            });
        }, { threshold: 0.1 });
        
        this.observer.observe(this.element);
    }
    
    update(scrollInfo) {
        // 1. Calculate Parallax Target
        // We want the element to move relative to its natural scroll position.
        // If speed = 1, offset = 0.
        // If speed = 1.2 (faster), it should move UP relative to viewport (negative offset)??
        // Wait, standard parallax: 
        // Background (slow, speed < 1) -> moves in direction of scroll (down), so it effectively leaves viewport slower.
        // Foreground (fast, speed > 1) -> moves against scroll (up), so it leaves viewport faster.
        
        // Let's use simpler logic: 
        // We track the distance from the center of the viewport.
        const rect = this.element.getBoundingClientRect();
        const viewCenter = window.innerHeight / 2;
        const panelCenter = rect.top + rect.height / 2;
        const distFromCenter = panelCenter - viewCenter;
        
        // Parallax offset
        // speed 1.0 -> 0 offset
        // speed 0.5 -> it should be "behind" (move with scroll slightly)
        const parallaxTarget = distFromCenter * (1 - this.speed);
        
        // 2. Update Springs
        this.springY.setTarget(parallaxTarget);
        this.springY.update();
        
        // 3. Apply Transform
        // We apply the spring position as a translation
        this.content.style.transform = `
            translate3d(0, ${this.springY.position}px, 0)
            scale(${this.springScale.position})
        `;
        
        // 4. Dynamic Style (Opactiy based on velocity?)
        if (Math.abs(scrollInfo.speed) > 50) {
            // Skew effect on high speed
             const skew = Math.min(Math.max(scrollInfo.speed * 0.1, -10), 10);
            //  this.content.style.transform += ` skewY(${skew}deg)`;
             // Combining skew with matrix3d is hard, skipping for now to avoid bugs
        }
    }
}
