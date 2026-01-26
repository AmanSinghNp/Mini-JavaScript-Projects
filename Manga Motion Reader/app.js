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
        panelElements.forEach(el => {
            this.panels.push(new Panel(el));
        });
        
        // Start loop
        this.scroller.startLoop((scrollInfo) => {
            this.update(scrollInfo);
        });
    }
    
    update(scrollInfo) {
        this.panels.forEach(panel => panel.update(scrollInfo));
        
        // Debug
        // console.log(scrollInfo.speed);
    }
}

// Start app
new App();
