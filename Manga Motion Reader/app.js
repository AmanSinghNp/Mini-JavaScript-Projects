import { Scroller } from './engine/Scroller.js';
import { Panel } from './engine/Panel.js';

class App {
    constructor() {
        this.scroller = new Scroller();
        this.panels = [];
        
        this.init();
    }
    
    init() {
        // Initialize panels
        const panelElements = document.querySelectorAll('.panel-wrapper');
        this.progressBar = document.getElementById('reading-progress');
        
        panelElements.forEach(el => {
            this.panels.push(new Panel(el));
        });
        
        // Snap Scrolling Logic
        this.isScrolling = false;
        this.snapTimeout = null;
        
        window.addEventListener('scroll', () => {
            clearTimeout(this.snapTimeout);
            this.snapTimeout = setTimeout(this.snapToNearestPanel.bind(this), 500); // Snap after 500ms of no scroll
        });

        // Start loop
        this.scroller.startLoop((scrollInfo) => {
            this.update(scrollInfo);
        });
    }
    
    snapToNearestPanel() {
        // Find nearest panel to center
        const center = window.innerHeight / 2;
        let closest = null;
        let minDiff = Infinity;
        
        this.panels.forEach(panel => {
            const rect = panel.element.getBoundingClientRect();
            const panelCenter = rect.top + rect.height / 2;
            const diff = Math.abs(panelCenter - center);
            
            if (diff < minDiff) {
                minDiff = diff;
                closest = panel;
            }
        });
        
        if (closest && minDiff < 300) { // Only snap if reasonably close
             // Smooth scroll to it
             const rect = closest.element.getBoundingClientRect();
             const panelCenter = rect.top + window.scrollY + rect.height / 2;
             const targetY = panelCenter - window.innerHeight / 2;
             
             window.scrollTo({
                 top: targetY,
                 behavior: 'smooth'
             });
        }
    }
    
    update(scrollInfo) {
        this.panels.forEach(panel => panel.update(scrollInfo));
        
        // Update Progress Bar
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrollInfo.scrollY / totalHeight, 0), 1);
        if (this.progressBar) {
            this.progressBar.style.width = `${progress * 100}%`;
        }
    }
}

// Start app
new App();
