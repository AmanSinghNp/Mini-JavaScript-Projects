/**
 * HUDController - Manages all HUD elements and connects them to game state
 * Handles health, armor, ammo, and weapon displays with smooth animations
 */

import { StatusBar } from './StatusBar.js';
import { PlayerFaceIcon } from './PlayerFaceIcon.js';

export class HUDController {
  constructor(player) {
    this.player = player;
    this.healthBar = null;
    this.armorBar = null;
    this.faceIcon = null;
    this.ammoGrid = null;
    this.isVisible = true;
    
    this.init();
  }

  init() {
    // Initialize health bar
    const healthFill = document.getElementById('health-bar-fill');
    const healthNumeric = document.getElementById('health-numeric');
    if (healthFill && healthNumeric) {
      this.healthBar = new StatusBar(healthFill, healthNumeric, this.player.maxHealth);
      this.healthBar.setValue(this.player.health, true);
    }

    // Initialize armor bar
    const armorFill = document.getElementById('armor-bar-fill');
    const armorNumeric = document.getElementById('armor-numeric');
    if (armorFill && armorNumeric) {
      this.armorBar = new StatusBar(armorFill, armorNumeric, this.player.maxArmor);
      this.armorBar.setValue(this.player.armor, true);
    }

    // Initialize player face icon
    const faceCanvas = document.getElementById('player-face-canvas');
    if (faceCanvas) {
      this.faceIcon = new PlayerFaceIcon(faceCanvas);
    }

    // Initialize ammo display
    this.updateAmmoDisplay();
    this.updateAmmoGrid();

    // Setup H key toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') {
        this.toggleVisibility();
      }
    });
  }

  update() {
    // Only update if values changed (performance optimization)
    if (this.healthBar) {
      const currentTarget = this.healthBar.targetValue;
      if (Math.abs(this.player.health - currentTarget) > 0.5) {
        this.healthBar.setValue(this.player.health);
      }
    }

    if (this.armorBar) {
      const currentTarget = this.armorBar.targetValue;
      if (Math.abs(this.player.armor - currentTarget) > 0.5) {
        this.armorBar.setValue(this.player.armor);
      }
    }

    // Update face icon
    if (this.faceIcon && this.faceIcon.canvas) {
      const healthPercentage = (this.player.health / this.player.maxHealth) * 100;
      // Update if health changed significantly, or animate if critical
      if (Math.abs(healthPercentage - this.faceIcon.lastHealth) > 0.5) {
        this.faceIcon.update(healthPercentage);
      } else if (healthPercentage < 30) {
        // Continue animating blood particles when critical
        this.faceIcon.animate();
      }
    }

    // Update ammo display (only when changed)
    const ammoCurrent = document.getElementById('ammo-current');
    if (ammoCurrent && parseInt(ammoCurrent.textContent) !== this.player.ammo) {
      this.updateAmmoDisplay();
      this.updateAmmoGrid();
    }
  }

  updateAmmoDisplay() {
    const ammoCurrent = document.getElementById('ammo-current');
    const ammoReserve = document.getElementById('ammo-reserve');
    
    if (ammoCurrent) {
      ammoCurrent.textContent = this.player.ammo;
    }
    
    if (ammoReserve) {
      ammoReserve.textContent = this.player.ammoReserve || 0;
    }
  }

  updateAmmoGrid() {
    const ammoGrid = document.getElementById('ammo-visual');
    if (!ammoGrid) return;

    // Clear existing grid
    ammoGrid.innerHTML = '';

    // Create grid of ammo blocks (10x5 = 50 max)
    const maxAmmo = this.player.maxAmmo || 50;
    const rows = 5;
    const cols = 10;
    const totalBlocks = rows * cols;

    for (let i = 0; i < totalBlocks; i++) {
      const block = document.createElement('div');
      block.className = 'ammo-grid-block';
      
      // Calculate if this block should be filled
      const threshold = (i + 1) * (maxAmmo / totalBlocks);
      if (this.player.ammo >= threshold) {
        block.classList.add('active');
      }
      
      ammoGrid.appendChild(block);
    }
  }

  updateWeaponIcon(weaponName) {
    const weaponIcon = document.getElementById('current-weapon');
    if (weaponIcon) {
      // Simple text-based icon for now
      weaponIcon.textContent = weaponName.charAt(0).toUpperCase();
    }
  }

  showReloadIndicator() {
    const indicator = document.getElementById('reload-indicator');
    if (indicator) {
      indicator.classList.remove('hidden');
    }
  }

  hideReloadIndicator() {
    const indicator = document.getElementById('reload-indicator');
    if (indicator) {
      indicator.classList.add('hidden');
    }
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
      hudContainer.style.display = this.isVisible ? 'flex' : 'none';
    }
  }

  destroy() {
    if (this.healthBar) this.healthBar.destroy();
    if (this.armorBar) this.armorBar.destroy();
  }
}

