/**
 * WeaponRenderer - Dedicated weapon canvas renderer class
 * Manages weapon sprite, animations, and effects on separate canvas layer
 */

import { drawPistol } from './weapons/PistolSprite.js';
import { drawMuzzleFlash } from '../effects/MuzzleFlash.js';

export class WeaponRenderer {
  constructor(canvasId, gameWidth, gameHeight) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`WeaponRenderer: Canvas with id "${canvasId}" not found`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = gameWidth;
    this.canvas.height = gameHeight;
    
    // Weapon positioning (bottom-center)
    this.baseX = gameWidth / 2;
    this.baseY = gameHeight - 100;
    this.offsetX = 0;
    this.offsetY = 0;
    
    // Animation state
    this.isRecoiling = false;
    this.recoilFrame = 0;
    this.maxRecoilFrames = 8;
    
    // Muzzle flash
    this.showMuzzleFlash = false;
    this.muzzleFlashDuration = 0;
    this.muzzleFlashMaxDuration = 100; // ms
    
    // Weapon bobbing (movement-based)
    this.bobOffset = 0;
    this.bobTime = 0;
    this.isMoving = false;
    
    // Low ammo shake
    this.lowAmmoShake = false;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    
    // Performance optimization
    this.needsRedraw = true;
    this.lastFrameTime = performance.now();
    
    // Weapon inspect animation (easter egg)
    this.inspectAnimation = false;
    this.inspectFrame = 0;
    this.maxInspectFrames = 60;
  }
  
  /**
   * Resize weapon canvas to match game dimensions
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.baseX = width / 2;
    this.baseY = height - 100;
    this.needsRedraw = true;
  }
  
  /**
   * Trigger recoil animation
   */
  triggerRecoil() {
    if (this.isRecoiling) return;
    
    this.isRecoiling = true;
    this.recoilFrame = 0;
    this.showMuzzleFlash = true;
    this.muzzleFlashDuration = this.muzzleFlashMaxDuration;
    this.needsRedraw = true;
    
    // Play sound effect (if sound system exists)
    if (window.audioManager) {
      window.audioManager.play('gunshot');
    }
  }
  
  /**
   * Update all weapon animations
   */
  update(deltaTime, isMoving, ammo, maxAmmo) {
    const currentTime = performance.now();
    const frameDelta = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    // Update recoil animation
    this.updateRecoil(frameDelta);
    
    // Update weapon bobbing
    this.updateBobbing(frameDelta, isMoving);
    
    // Update low ammo shake
    this.updateLowAmmoShake(ammo, maxAmmo);
    
    // Update inspect animation
    this.updateInspect(frameDelta);
    
    // Update muzzle flash timer
    if (this.showMuzzleFlash) {
      this.muzzleFlashDuration -= frameDelta;
      if (this.muzzleFlashDuration <= 0) {
        this.showMuzzleFlash = false;
        this.needsRedraw = true;
      }
    }
  }
  
  /**
   * Update recoil animation with easing
   */
  updateRecoil(deltaTime) {
    if (this.isRecoiling) {
      this.recoilFrame++;
      this.needsRedraw = true;
      
      // Easing function: fast back, slow forward
      const progress = this.recoilFrame / this.maxRecoilFrames;
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Calculate offsets (back and up during first half)
      if (progress < 0.5) {
        this.offsetY = -15 * (1 - eased * 2);
        this.offsetX = Math.sin(this.recoilFrame * 0.5) * 5; // Slight horizontal wobble
      } else {
        // Return to position
        this.offsetY = -15 * (1 - eased);
        this.offsetX = Math.sin(this.recoilFrame * 0.5) * 5 * (1 - (progress - 0.5) * 2);
      }
      
      if (this.recoilFrame >= this.maxRecoilFrames) {
        this.isRecoiling = false;
        this.offsetY = 0;
        this.offsetX = 0;
        this.recoilFrame = 0;
      }
    }
  }
  
  /**
   * Update weapon bobbing during movement
   */
  updateBobbing(deltaTime, isMoving) {
    this.isMoving = isMoving;
    
    if (isMoving) {
      this.bobTime += deltaTime * 0.01; // Adjust speed
      this.bobOffset = Math.sin(this.bobTime) * 3; // 3px vertical bob
      this.needsRedraw = true;
    } else {
      // Smooth return to center
      if (Math.abs(this.bobOffset) > 0.1) {
        this.bobOffset *= 0.9; // Damping
        this.needsRedraw = true;
      } else {
        this.bobOffset = 0;
        this.bobTime = 0;
      }
    }
  }
  
  /**
   * Update low ammo shake effect
   */
  updateLowAmmoShake(ammo, maxAmmo) {
    const ammoPercentage = (ammo / maxAmmo) * 100;
    this.lowAmmoShake = ammoPercentage < 20 && ammo > 0;
    
    if (this.lowAmmoShake) {
      // Random shake offset
      this.shakeOffsetX = (Math.random() - 0.5) * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * 2;
      this.needsRedraw = true;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }
  
  /**
   * Update weapon inspect animation (easter egg)
   */
  updateInspect(deltaTime) {
    if (this.inspectAnimation) {
      this.inspectFrame++;
      this.needsRedraw = true;
      
      if (this.inspectFrame >= this.maxInspectFrames) {
        this.inspectAnimation = false;
        this.inspectFrame = 0;
      }
    }
  }
  
  /**
   * Trigger weapon inspect animation
   */
  triggerInspect() {
    this.inspectAnimation = true;
    this.inspectFrame = 0;
    this.needsRedraw = true;
  }
  
  /**
   * Render weapon to canvas
   */
  render() {
    // Performance optimization: skip redraw if nothing changed
    if (!this.needsRedraw && !this.isRecoiling && !this.showMuzzleFlash && !this.isMoving && !this.lowAmmoShake && !this.inspectAnimation) {
      return;
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate final position with all offsets
    const finalX = this.baseX + this.offsetX + this.shakeOffsetX;
    const finalY = this.baseY + this.offsetY + this.bobOffset + this.shakeOffsetY;
    
    // Apply inspect rotation if active
    let rotation = 0;
    let scale = 1;
    if (this.inspectAnimation) {
      const progress = this.inspectFrame / this.maxInspectFrames;
      rotation = Math.sin(progress * Math.PI * 2) * 0.3; // Slight rotation
      scale = 1 + Math.sin(progress * Math.PI) * 0.1; // Slight scale
    }
    
    // Draw weapon
    this.ctx.save();
    this.ctx.translate(finalX, finalY);
    this.ctx.rotate(rotation);
    this.ctx.scale(scale, scale);
    
    // Draw pistol
    drawPistol(this.ctx, 0, 0, this.offsetY);
    
    // Draw muzzle flash
    if (this.showMuzzleFlash) {
      drawMuzzleFlash(this.ctx, 0, -40, this.muzzleFlashDuration / this.muzzleFlashMaxDuration);
    }
    
    this.ctx.restore();
    
    this.needsRedraw = false;
  }
}

