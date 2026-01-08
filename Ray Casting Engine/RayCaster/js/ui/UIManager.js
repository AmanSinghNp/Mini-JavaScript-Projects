/**
 * UIManager - Centralized UI system coordinator
 * Manages initialization, update order, dependencies, and visibility toggling
 */

import { EffectsCanvas } from '../effects-layer.js';
import { HUDController } from './HUDController.js';
import { WeaponRenderer } from '../rendering/WeaponRenderer.js';
import { RadarSystem } from './RadarSystem.js';
import { CrosshairController } from './CrosshairController.js';

export class UIManager {
  constructor(player, worldMap, sprites, gameCanvas, gameViewport) {
    this.player = player;
    this.worldMap = worldMap;
    this.sprites = sprites;
    this.gameCanvas = gameCanvas;
    this.gameViewport = gameViewport;
    
    // UI System instances
    this.effectsCanvas = null;
    this.hudController = null;
    this.weaponRenderer = null;
    this.radarSystem = null;
    this.crosshairController = null;
    
    // State
    this.isInitialized = false;
    this.screenshotMode = false;
    this.uiVisible = true;
    
    // Initialize all systems
    this.initialize();
  }

  /**
   * Initialize all UI systems in dependency order
   */
  initialize() {
    try {
      // 1. Effects Canvas (needs game viewport)
      this.effectsCanvas = new EffectsCanvas(this.gameViewport);
      
      // 2. Weapon Renderer (needs canvas dimensions)
      const rect = this.gameCanvas.getBoundingClientRect();
      this.weaponRenderer = new WeaponRenderer('weapon-canvas', rect.width, rect.height);
      
      // 3. HUD Controller (needs player reference)
      this.hudController = new HUDController(this.player);
      
      // 4. Radar System (needs minimap canvas)
      this.radarSystem = new RadarSystem('minimap', 80, 0.5);
      
      // 5. Crosshair Controller (no dependencies)
      this.crosshairController = new CrosshairController();
      
      // Export crosshair for sprite system
      window.crosshairController = this.crosshairController;
      
      this.isInitialized = true;
      console.log('[UIManager] All UI systems initialized successfully');
    } catch (error) {
      console.error('[UIManager] Initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Update all UI systems in correct order
   */
  update(deltaTime, isMoving) {
    if (!this.isInitialized || !this.uiVisible) return;
    
    // Update order matters for dependencies
    // 1. HUD (updates based on player state)
    if (this.hudController) {
      this.hudController.update();
    }
    
    // 2. Weapon Renderer (needs player state)
    if (this.weaponRenderer) {
      this.weaponRenderer.update(
        deltaTime * 1000,
        isMoving,
        this.player.ammo,
        this.player.maxAmmo
      );
    }
    
    // 3. Crosshair (needs player state and movement)
    if (this.crosshairController) {
      const velocity = Math.sqrt(
        (isMoving ? this.player.moveSpeed : 0) ** 2
      );
      this.crosshairController.updateMovementSpread(velocity);
      this.crosshairController.update();
      
      // Enemy detection check
      this.updateEnemyDetection();
    }
    
    // 4. Radar (needs player, world, and entities)
    if (this.radarSystem) {
      this.radarSystem.render(this.player, this.worldMap, this.sprites);
    }
  }

  /**
   * Render all UI systems that need rendering
   */
  render() {
    if (!this.isInitialized || !this.uiVisible) return;
    
    // Weapon renderer has its own render loop
    if (this.weaponRenderer) {
      this.weaponRenderer.render();
    }
    
    // Effects canvas has its own animation loop
    // No explicit render call needed
  }

  /**
   * Check if crosshair is over enemy and update detection state
   */
  updateEnemyDetection() {
    if (!this.crosshairController) return;
    
    const rayLength = 20; // Check up to 20 units ahead
    let enemyDetected = false;
    
    for (const sprite of this.sprites) {
      if (sprite.type === 'enemy') {
        const dx = sprite.x - this.player.x;
        const dy = sprite.y - this.player.y;
        const dist = Math.sqrt(dx ** 2 + dy ** 2);
        
        // Check if enemy is roughly in front of player (within FOV)
        if (dist < rayLength) {
          const dot = (dx * this.player.dirX + dy * this.player.dirY) / dist;
          if (dot > 0.7) { // Roughly in front (cos(45deg) ≈ 0.7)
            enemyDetected = true;
            break;
          }
        }
      }
    }
    
    this.crosshairController.setEnemyDetected(enemyDetected);
  }

  /**
   * Handle weapon firing - triggers all related UI systems
   */
  handleShoot() {
    if (!this.isInitialized) return;
    
    // Trigger weapon recoil
    if (this.weaponRenderer) {
      this.weaponRenderer.triggerRecoil();
    }
    
    // Trigger crosshair recoil
    if (this.crosshairController) {
      this.crosshairController.triggerRecoil(20);
    }
    
    // Trigger effects
    if (this.effectsCanvas) {
      this.effectsCanvas.triggerMuzzleFlash();
      this.effectsCanvas.triggerScreenShake();
    }
    
    // Update low ammo warning
    if (this.crosshairController) {
      if (this.player.ammo < 10) {
        this.crosshairController.setLowAmmoWarning(true);
      } else {
        this.crosshairController.setLowAmmoWarning(false);
      }
    }
  }

  /**
   * Handle player damage - triggers damage feedback
   */
  handleDamage(amount) {
    if (!this.isInitialized) return;
    
    // Trigger damage flash
    if (this.effectsCanvas) {
      this.effectsCanvas.triggerDamageFlash();
    }
    
    // HUD will update automatically on next update cycle
  }

  /**
   * Toggle screenshot mode (hides all UI except world)
   */
  toggleScreenshotMode() {
    this.screenshotMode = !this.screenshotMode;
    this.setUIVisibility(!this.screenshotMode);
  }

  /**
   * Set UI visibility
   */
  setUIVisibility(visible) {
    this.uiVisible = visible;
    
    // Hide/show all UI elements
    const uiElements = [
      '#hud-container',
      '#crosshair-container',
      '#minimap',
      '.fps-counter',
      '#message-area'
    ];
    
    uiElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.display = visible ? '' : 'none';
      }
    });
    
    // Hide/show radar
    if (this.radarSystem) {
      if (!visible) {
        this.radarSystem.toggleVisibility();
      }
    }
  }

  /**
   * Resize all UI systems
   */
  resize(width, height) {
    if (!this.isInitialized) return;
    
    if (this.weaponRenderer) {
      this.weaponRenderer.resize(width, height);
    }
    
    if (this.effectsCanvas) {
      this.effectsCanvas.resize();
    }
  }

  /**
   * Get all UI system instances (for debugging)
   */
  getSystems() {
    return {
      effectsCanvas: this.effectsCanvas,
      hudController: this.hudController,
      weaponRenderer: this.weaponRenderer,
      radarSystem: this.radarSystem,
      crosshairController: this.crosshairController
    };
  }

  /**
   * Cleanup and destroy all systems
   */
  destroy() {
    if (this.hudController) {
      this.hudController.destroy();
    }
    
    if (this.crosshairController) {
      this.crosshairController.reset();
    }
    
    // Clear references
    this.effectsCanvas = null;
    this.hudController = null;
    this.weaponRenderer = null;
    this.radarSystem = null;
    this.crosshairController = null;
    
    this.isInitialized = false;
  }
}



