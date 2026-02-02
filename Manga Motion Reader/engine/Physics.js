
export class Spring {
    constructor(config = {}) {
        this.position = config.initialValue || 0;
        this.target = config.initialValue || 0;
        this.velocity = 0;
        
        this.stiffness = config.stiffness || 0.05; // Lower for more fluid float
        this.damping = config.damping || 0.90;    // Higher damping for 'water' feel
        this.mass = config.mass || 1.2;           // Slightly heavier
        this.fluidResistance = config.fluidResistance || 0.02; // New: Viscosity
        
        // Threshold to stop calculating if settled
        this.precision = 0.01;
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    update() {
        const force = (this.target - this.position) * this.stiffness;
        const acceleration = force / this.mass;
        
        this.velocity += acceleration;
        
        // Apply Fluid Resistance (Drag)
        // Similar to air resistance but maybe non-linear?
        // For now: simple velocity reduction
        this.velocity *= (1 - this.fluidResistance);
        
        // Apply Damping (Standard spring friction)
        this.velocity *= this.damping;
        
        this.position += this.velocity;
        
        // Return true if still moving significantly
        return Math.abs(this.velocity) > this.precision || Math.abs(this.target - this.position) > this.precision;
    }
}
