
import { Scroller } from './engine/Scroller.js';
import { Panel } from './engine/Panel.js';
import { GrimoireUI } from './engine/GrimoireUI.js';
import { ParticleSystem } from './engine/ParticleSystem.js';

class App {
    constructor() {
        this.scroller = new Scroller();
        this.panels = [];
        this.ui = new GrimoireUI();
        this.particles = new ParticleSystem();
        
        this.init();
    }
    
    init() {
        // Initialize panels
        const panelElements = document.querySelectorAll('.panel-wrapper');
        this.progressBar = document.getElementById('reading-progress');
        
        panelElements.forEach(el => {
            this.panels.push(new Panel(el));
        });
        
        // Start loop
        this.scroller.startLoop((scrollInfo) => {
            this.update(scrollInfo);
        });
    }
    
    update(scrollInfo) {
        // Update Panels (Parallax/Physics)
        this.panels.forEach(panel => panel.update(scrollInfo));
        
        // Update UI (Timeline)
        this.ui.updateProgress(scrollInfo);
        
        // Update Particles (Fluid feel)
        this.particles.update(scrollInfo.speed); // Pass speed for effect
    }
}

// Start app
new App();
