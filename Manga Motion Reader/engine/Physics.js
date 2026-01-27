export class Spring {
    constructor(config = {}) {
        this.position = config.initialValue || 0;
        this.target = config.initialValue || 0;
        this.velocity = 0;
        
        this.stiffness = config.stiffness || 0.1;
        this.damping = config.damping || 0.8;
        this.mass = config.mass || 1;
        
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
        this.velocity *= this.damping;
        
        this.position += this.velocity;
        
        // Return true if still moving
        return Math.abs(this.velocity) > this.precision || Math.abs(this.target - this.position) > this.precision;
    }
}
