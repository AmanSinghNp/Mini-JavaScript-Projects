export class Panel {
    constructor(element) {
        this.element = element;
        this.content = element.querySelector('.panel-content');
        this.speed = parseFloat(element.dataset.speed || 1.0);
        
        // Initial state
        this.y = 0;
    }
    
    update(scrollInfo) {
        // Basic update - placeholder for now
        // In the future this will handle parallax and physics
        // For now, let's just log or do a simple transform
        
        // Calculate relative position to viewport center?
        // For now, essentially do nothing or simple parallax
        const offset = scrollInfo.scrollY * (this.speed - 1) * 0.1;
        // this.element.style.transform = `translateY(${offset}px)`;
    }
}
