/**
 * StatusBar - Animated status bar with smooth interpolation and color coding
 * Optimized for performance with will-change and cached DOM queries
 */

export class StatusBar {
  constructor(fillElement, numericElement, maxValue) {
    this.fillElement = fillElement;
    this.numericElement = numericElement;
    this.maxValue = maxValue;
    this.currentValue = maxValue;
    this.targetValue = maxValue;
    this.animationSpeed = 0.1; // Interpolation factor
    this.isAnimating = false;
    this.animationFrame = null;
    
    // Performance optimization: cache DOM queries
    if (this.fillElement) {
      this.fillElement.style.willChange = 'width';
    }
    
    // Debounce rapid updates
    this.updateQueue = [];
    this.debounceTimeout = null;
  }

  setValue(newValue, immediate = false) {
    this.targetValue = Math.max(0, Math.min(newValue, this.maxValue));
    
    if (immediate) {
      this.currentValue = this.targetValue;
      this.updateDisplay();
      return;
    }
    
    // Debounce rapid updates (damage ticks)
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.animate();
    }, 16); // ~1 frame at 60fps
  }

  animate() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const animateStep = () => {
      const diff = this.targetValue - this.currentValue;
      
      if (Math.abs(diff) > 0.5) {
        this.currentValue += diff * this.animationSpeed;
        this.updateDisplay();
        this.animationFrame = requestAnimationFrame(animateStep);
      } else {
        this.currentValue = this.targetValue;
        this.updateDisplay();
        this.isAnimating = false;
        this.animationFrame = null;
      }
    };
    
    animateStep();
  }

  updateDisplay() {
    const percentage = (this.currentValue / this.maxValue) * 100;
    
    if (this.fillElement) {
      this.fillElement.style.width = percentage + '%';
      
      // Color coding: green > 60%, yellow 30-60%, red < 30%
      if (percentage > 60) {
        this.fillElement.style.background = '#0f0';
      } else if (percentage > 30) {
        this.fillElement.style.background = '#ff0';
      } else {
        this.fillElement.style.background = '#f00';
      }
    }
    
    if (this.numericElement) {
      this.numericElement.textContent = Math.ceil(this.currentValue);
    }
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    clearTimeout(this.debounceTimeout);
    this.isAnimating = false;
  }
}



