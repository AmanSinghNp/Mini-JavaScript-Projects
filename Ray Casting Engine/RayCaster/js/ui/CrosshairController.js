/**
 * CrosshairController - Dynamic crosshair system with hit feedback and state management
 * Provides real-time feedback for accuracy, enemy detection, damage confirmation, and weapon state
 */

export class CrosshairController {
  constructor() {
    this.crosshair = document.getElementById('crosshair');
    this.hitMarker = document.getElementById('hit-marker');
    this.killIndicator = document.getElementById('kill-indicator');
    this.lowAmmoWarning = document.getElementById('low-ammo-warning');
    
    if (!this.crosshair) {
      console.error('CrosshairController: Crosshair element not found');
      return;
    }
    
    this.baseSpread = 40; // pixels
    this.currentSpread = this.baseSpread;
    this.maxSpread = 100;
    this.spreadDecay = 0.95; // Per frame recovery
    
    this.isEnemyDetected = false;
    this.lastSpread = this.baseSpread;
    
    // Performance optimization: update counter
    this.updateCounter = 0;
    this.updateEveryNFrames = 1; // Update every frame for smooth feedback
    
    // Initialize spread
    this.updateSpread();
  }

  /**
   * Trigger recoil spread increase on weapon fire
   */
  triggerRecoil(amount = 20) {
    this.currentSpread = Math.min(this.currentSpread + amount, this.maxSpread);
    this.updateSpread();
    
    // Add shooting class for animation
    if (this.crosshair) {
      this.crosshair.classList.add('shooting');
      setTimeout(() => {
        if (this.crosshair) {
          this.crosshair.classList.remove('shooting');
        }
      }, 100);
    }
  }

  /**
   * Update spread based on player movement velocity
   */
  updateMovementSpread(velocity) {
    const movementSpread = Math.abs(velocity) * 5;
    this.currentSpread = Math.min(
      this.baseSpread + movementSpread,
      this.maxSpread
    );
    this.updateSpread();
  }

  /**
   * Gradually return to base spread over time
   */
  update() {
    this.updateCounter++;
    
    // Only update spread recovery every frame for smoothness
    if (this.currentSpread > this.baseSpread) {
      this.currentSpread *= this.spreadDecay;
      if (this.currentSpread < this.baseSpread + 1) {
        this.currentSpread = this.baseSpread;
      }
      
      // Only update DOM if spread changed significantly
      if (Math.abs(this.currentSpread - this.lastSpread) > 0.5) {
        this.updateSpread();
        this.lastSpread = this.currentSpread;
      }
    }
  }

  /**
   * Update crosshair spread in DOM
   */
  updateSpread() {
    if (this.crosshair) {
      this.crosshair.style.width = this.currentSpread + 'px';
      this.crosshair.style.height = this.currentSpread + 'px';
      this.lastSpread = this.currentSpread;
    }
  }

  /**
   * Set enemy detection state (when crosshair is over enemy)
   */
  setEnemyDetected(detected) {
    if (detected !== this.isEnemyDetected && this.crosshair) {
      this.isEnemyDetected = detected;
      if (detected) {
        this.crosshair.classList.add('enemy-detected');
      } else {
        this.crosshair.classList.remove('enemy-detected');
      }
    }
  }

  /**
   * Show hit marker (X shape) when bullet hits enemy
   */
  showHitMarker() {
    if (!this.hitMarker) return;
    
    this.hitMarker.classList.remove('active');
    // Force reflow to restart animation
    void this.hitMarker.offsetWidth;
    this.hitMarker.classList.add('active');
    
    setTimeout(() => {
      if (this.hitMarker) {
        this.hitMarker.classList.remove('active');
      }
    }, 300);
  }

  /**
   * Show kill indicator with points popup
   */
  showKillIndicator(points = 100) {
    if (!this.killIndicator) return;
    
    this.killIndicator.textContent = '+' + points;
    this.killIndicator.classList.remove('active');
    // Force reflow to restart animation
    void this.killIndicator.offsetWidth;
    this.killIndicator.classList.add('active');
    
    setTimeout(() => {
      if (this.killIndicator) {
        this.killIndicator.classList.remove('active');
      }
    }, 800);
  }

  /**
   * Show/hide low ammo warning (< 10 rounds)
   */
  setLowAmmoWarning(show) {
    if (!this.lowAmmoWarning) return;
    
    if (show) {
      this.lowAmmoWarning.classList.remove('hidden');
      this.lowAmmoWarning.classList.add('blink');
    } else {
      this.lowAmmoWarning.classList.add('hidden');
      this.lowAmmoWarning.classList.remove('blink');
    }
  }

  /**
   * Reset crosshair to default state
   */
  reset() {
    this.currentSpread = this.baseSpread;
    this.isEnemyDetected = false;
    this.updateSpread();
    
    if (this.crosshair) {
      this.crosshair.classList.remove('shooting', 'enemy-detected');
    }
    this.setLowAmmoWarning(false);
  }
}

