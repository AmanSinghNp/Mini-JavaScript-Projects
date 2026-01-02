/**
 * Effects Canvas Layer - Dynamic Screen Space Post-Processing
 * Handles damage flash, muzzle flash, and screen shake effects
 */

export class EffectsCanvas {
  constructor(containerElement) {
    this.container = containerElement;
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    
    // Effect state
    this.damageFlash = {
      active: false,
      opacity: 0,
      startTime: 0,
      duration: 300 // ms
    };
    
    this.muzzleFlash = {
      active: false,
      opacity: 0,
      startTime: 0,
      duration: 100 // ms
    };
    
    this.screenShake = {
      active: false,
      startTime: 0,
      duration: 200, // ms
      intensity: 5 // pixels
    };
    
    this.init();
  }
  
  init() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'effects-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '15'; // Above game canvas, below UI
    
    this.ctx = this.canvas.getContext('2d');
    
    // Insert canvas into container
    this.container.appendChild(this.canvas);
    
    // Resize handler
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Start animation loop
    this.animate();
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  /**
   * Trigger damage flash effect
   * Radial gradient from center (transparent red to opaque red at edges)
   * Fades from 0.6 opacity to 0 over 300ms with easing
   */
  triggerDamageFlash() {
    this.damageFlash.active = true;
    this.damageFlash.startTime = performance.now();
    this.damageFlash.opacity = 0.6;
  }
  
  /**
   * Trigger muzzle flash effect
   * Bright yellow circle at bottom-center (weapon position)
   * Fades over 100ms
   */
  triggerMuzzleFlash() {
    this.muzzleFlash.active = true;
    this.muzzleFlash.startTime = performance.now();
    this.muzzleFlash.opacity = 1.0;
  }
  
  /**
   * Trigger screen shake
   * Applies CSS transform with random offsets (±5px) for 200ms
   */
  triggerScreenShake() {
    this.screenShake.active = true;
    this.screenShake.startTime = performance.now();
    
    // Apply shake to the game container
    const gameContainer = this.container.closest('.game-container') || this.container;
    this.applyShake(gameContainer);
  }
  
  /**
   * Apply screen shake transform to element
   */
  applyShake(element) {
    if (!this.screenShake.active) {
      element.style.transform = '';
      return;
    }
    
    const elapsed = performance.now() - this.screenShake.startTime;
    const progress = Math.min(elapsed / this.screenShake.duration, 1);
    
    if (progress >= 1) {
      this.screenShake.active = false;
      element.style.transform = '';
      return;
    }
    
    // Ease out shake intensity
    const intensity = this.screenShake.intensity * (1 - progress);
    const offsetX = (Math.random() - 0.5) * 2 * intensity;
    const offsetY = (Math.random() - 0.5) * 2 * intensity;
    
    element.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // Continue shaking until duration expires
    requestAnimationFrame(() => this.applyShake(element));
  }
  
  /**
   * Easing function for smooth fade-out
   * Ease-out cubic for natural deceleration
   */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  /**
   * Draw damage flash effect
   */
  drawDamageFlash() {
    if (!this.damageFlash.active) return;
    
    const elapsed = performance.now() - this.damageFlash.startTime;
    const progress = Math.min(elapsed / this.damageFlash.duration, 1);
    
    if (progress >= 1) {
      this.damageFlash.active = false;
      return;
    }
    
    // Ease out opacity
    const easedProgress = this.easeOutCubic(progress);
    const opacity = this.damageFlash.opacity * (1 - easedProgress);
    
    // Create radial gradient from center
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxRadius
    );
    gradient.addColorStop(0, `rgba(255, 0, 0, 0)`);
    gradient.addColorStop(0.3, `rgba(255, 0, 0, ${opacity * 0.3})`);
    gradient.addColorStop(1, `rgba(255, 0, 0, ${opacity})`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  /**
   * Draw muzzle flash effect
   */
  drawMuzzleFlash() {
    if (!this.muzzleFlash.active) return;
    
    const elapsed = performance.now() - this.muzzleFlash.startTime;
    const progress = Math.min(elapsed / this.muzzleFlash.duration, 1);
    
    if (progress >= 1) {
      this.muzzleFlash.active = false;
      return;
    }
    
    // Linear fade
    const opacity = this.muzzleFlash.opacity * (1 - progress);
    
    // Position at bottom-center (weapon position)
    const centerX = this.width / 2;
    const centerY = this.height * 0.85; // Bottom-center area
    const radius = 30 * (1 - progress * 0.5); // Slightly shrink as it fades
    
    // Create radial gradient for glow
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    gradient.addColorStop(0, `rgba(255, 255, 0, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 0, ${opacity * 0.8})`);
    gradient.addColorStop(1, `rgba(255, 150, 0, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * Clear canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * Main animation loop
   */
  animate() {
    this.clear();
    this.drawDamageFlash();
    this.drawMuzzleFlash();
    requestAnimationFrame(() => this.animate());
  }
}

