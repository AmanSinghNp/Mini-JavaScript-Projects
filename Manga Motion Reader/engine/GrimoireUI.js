
export class GrimoireUI {
    constructor() {
        this.container = document.querySelector('.manga-container');
        this.lens = null;
        this.isAnalysing = false;
        
        this.init();
    }

    init() {
        this.createLens();
        this.setupEventListeners();
        this.createTimeline();
    }

    createLens() {
        this.lens = document.createElement('div');
        this.lens.classList.add('analyze-lens');
        document.body.appendChild(this.lens);
    }

    createTimeline() {
        // Timeline container
        const timeline = document.createElement('div');
        timeline.classList.add('grimoire-timeline');
        
        // The path (SVG)
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('class', 'timeline-svg');
        // Simple straight line for now, or curved if we want style
        // We'll update this in CSS/JS
        
        // The marker (icon)
        const marker = document.createElement('div');
        marker.classList.add('timeline-marker');
        
        timeline.appendChild(svg);
        timeline.appendChild(marker);
        document.getElementById('app').appendChild(timeline);
        
        this.timelineMarker = marker;
    }

    setupEventListeners() {
        // Lens Tool (Shift + Hover)
        document.addEventListener('mousemove', (e) => {
            if (e.shiftKey) {
                this.isAnalysing = true;
                this.updateLens(e.clientX, e.clientY);
            } else {
                this.isAnalysing = false;
                this.hideLens();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.isAnalysing = false;
                this.hideLens();
            }
        });
    }

    updateLens(x, y) {
        this.lens.style.opacity = '1';
        this.lens.style.transform = `translate(${x - 75}px, ${y - 75}px)`; // Center the 150px lens
        
        // Optional: Distort effect on the content below?
        // For now, the lens itself has backdrop-filter
    }

    hideLens() {
        if (this.lens) this.lens.style.opacity = '0';
    }

    updateProgress(scrollInfo) {
        // Update timeline marker based on scroll percentage
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(Math.max(scrollInfo.scrollY / totalHeight, 0), 1);
        
        if (this.timelineMarker) {
            // Move marker down the screen height (approx)
            // Or typically a fixed timeline sidebar
            const timelineHeight = window.innerHeight * 0.8; 
            const top = 60 + (progress * timelineHeight); // 60px offset from top
            this.timelineMarker.style.transform = `translateY(${top}px)`;
        }
    }
}
