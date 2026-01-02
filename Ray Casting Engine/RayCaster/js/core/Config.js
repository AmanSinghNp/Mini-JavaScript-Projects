/**
 * Centralized configuration for the Ray Casting Engine
 * All magic numbers and configurable values in one place
 */

export const Config = {
  /**
   * UI layer z-indices - defines stacking order of visual elements
   */
  UI: {
    zIndex: {
      world: 1,
      weapon: 12,
      effects: 15,
      radar: 5,
      hud: 100,
      hudPanel: 101,
      crosshair: 250,
      crtOverlay: 200
    },
    animations: {
      damageFlashDuration: 300,
      muzzleFlashDuration: 100,
      screenShakeDuration: 200,
      recoilFrames: 8
    },
    radar: {
      defaultRadius: 80,
      defaultScale: 0.5,
      enemyDetectionRange: 20
    }
  },

  /**
   * Gameplay mechanics configuration
   */
  Gameplay: {
    shootCooldown: 100,           // ms between shots
    playerMoveSpeed: 0.05,
    playerRotSpeed: 0.03,
    sprintMultiplier: 1.8,
    lowAmmoThreshold: 10,
    enemyDetectionAngle: 0.7,     // cos(45deg) for FOV check
    projectileSpeed: 8.0,
    projectileDespawnDistance: 30,
    enemyHitboxSize: 0.5
  },

  /**
   * Visual/rendering configuration
   */
  Visuals: {
    maxRenderDistance: 20.0,
    ySideDarkening: 0.7,          // EW walls darker than NS walls
    mouseSensitivity: 0.002,
    textureSize: 64,
    fov: 0.66                     // camera plane magnitude
  },

  /**
   * Player starting values
   */
  Player: {
    startX: 3.5,
    startY: 3.5,
    startDirX: -1,
    startDirY: 0,
    maxHealth: 100,
    maxArmor: 100,
    maxAmmo: 50,
    startAmmoReserve: 200
  },

  /**
   * Debug/development settings
   */
  Debug: {
    profilerEnabled: false,
    loggerEnabled: false
  }
};

export default Config;
