/**
 * RayCaster Engine - Main Entry Point
 * 
 * This module bootstraps the game by initializing all systems and wiring them together.
 * The core logic is now distributed across focused modules:
 * - js/core/Config.js - Centralized configuration
 * - js/core/GameLoop.js - Main game loop management
 * - js/core/InputManager.js - Input handling
 * - js/rendering/Raycaster.js - 3D world rendering
 * - js/ui/UIManager.js - Unified UI system coordination
 */

import { WORLD_MAP } from './map.js';
import { player } from './player.js';
import { textures, initTextures, TEXTURE_SIZE } from './textures.js';
import { renderSprites, spawnSprite, updateSprites, sprites } from './sprite.js';

// Core modules
import { Config } from './js/core/Config.js';
import { Logger } from './js/utils/Logger.js';
import { InputManager } from './js/core/InputManager.js';
import { GameLoop } from './js/core/GameLoop.js';
import { Raycaster } from './js/rendering/Raycaster.js';

// UI and Effects
import { EffectsCanvas } from './js/effects-layer.js';
import { HUDController } from './js/ui/HUDController.js';
import { WeaponRenderer } from './js/rendering/WeaponRenderer.js';
import { RadarSystem } from './js/ui/RadarSystem.js';
import { CrosshairController } from './js/ui/CrosshairController.js';
import { UIManager } from './js/ui/UIManager.js';
import { PerformanceProfiler } from './js/performance/ProfilerManager.js';

// ============================================
// INITIALIZATION
// ============================================

// Initialize procedural textures
initTextures();

/**
 * Safely spawn a sprite only if the position is not inside a wall
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} type - Sprite type
 * @returns {boolean} Whether spawn was successful
 */
function safeSpawnSprite(x, y, type) {
  const mapX = Math.floor(x);
  const mapY = Math.floor(y);
  
  // Check bounds
  if (mapX < 0 || mapX >= WORLD_MAP.length || mapY < 0 || mapY >= WORLD_MAP[0].length) {
    Logger.warn('Spawn', `Cannot spawn ${type} at (${x}, ${y}) - out of bounds`);
    return false;
  }
  
  // Check if position is inside a wall
  if (WORLD_MAP[mapX][mapY] !== 0) {
    Logger.warn('Spawn', `Cannot spawn ${type} at (${x}, ${y}) - inside wall`);
    return false;
  }
  
  spawnSprite(x, y, type);
  return true;
}

// Spawn test enemies at valid positions (open floor areas)
safeSpawnSprite(3.5, 7.5, 'enemy');   // Open corridor
safeSpawnSprite(7.5, 7.5, 'enemy');   // Center area  
safeSpawnSprite(13.5, 14.5, 'enemy'); // Bottom right area

// ============================================
// LEVEL SYSTEM
// ============================================

let currentLevel = 1;
let levelCleared = false;
const levelPopup = document.getElementById('level-popup');
const levelNumberEl = document.getElementById('level-number');
const nextLevelBtn = document.getElementById('next-level-btn');

/**
 * Get count of active enemies
 */
function getEnemyCount() {
  return sprites.filter(s => s.type === 'enemy').length;
}

/**
 * Check if level is complete (all enemies killed)
 */
function checkLevelComplete() {
  if (levelCleared) return;
  
  if (getEnemyCount() === 0) {
    levelCleared = true;
    showLevelCleared();
  }
}

/**
 * Show level cleared popup
 */
function showLevelCleared() {
  if (levelPopup) {
    levelNumberEl.textContent = currentLevel;
    levelPopup.classList.remove('hidden');
    
    // Exit pointer lock so user can click button
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }
}

/**
 * Start next level
 */
function startNextLevel() {
  currentLevel++;
  levelCleared = false;
  
  // Hide popup
  if (levelPopup) {
    levelPopup.classList.add('hidden');
  }
  
  // Refill ammo (HUD controller will update display on next frame)
  player.ammo = player.maxAmmo;
  
  // Spawn more enemies each level
  const enemyCount = 2 + currentLevel; // 3 on level 1, 4 on level 2, etc.
  const spawnPositions = [
    [3.5, 3.5], [7.5, 7.5], [13.5, 14.5], [3.5, 14.5], 
    [13.5, 3.5], [7.5, 3.5], [7.5, 14.5], [3.5, 7.5]
  ];
  
  for (let i = 0; i < Math.min(enemyCount, spawnPositions.length); i++) {
    const [x, y] = spawnPositions[i];
    safeSpawnSprite(x, y, 'enemy');
  }
  
  Logger.log('Level', `Starting level ${currentLevel} with ${enemyCount} enemies`);
}

// Wire up next level button
if (nextLevelBtn) {
  nextLevelBtn.addEventListener('click', startNextLevel);
}

// Get canvas elements
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap');
const mCtx = minimapCanvas.getContext('2d');
const gameViewport = document.getElementById('game-viewport');

// Debug display elements
const debugX = document.getElementById('debug-x');
const debugY = document.getElementById('debug-y');
const debugDir = document.getElementById('debug-dir');
const valAmmo = document.getElementById('val-ammo');
const valMaxAmmo = document.getElementById('val-max-ammo');
const ammoBar = document.getElementById('ammo-bar');

// ============================================
// SYSTEM INITIALIZATION
// ============================================

// Initialize Raycaster
const raycaster = new Raycaster(canvas, textures);

// Initialize Effects Canvas
const effectsCanvas = new EffectsCanvas(gameViewport);

// Initialize Radar System
let radarSystem = null;
try {
  radarSystem = new RadarSystem(
    'minimap',
    Config.UI.radar.defaultRadius,
    Config.UI.radar.defaultScale
  );
} catch (error) {
  Logger.warn('Radar system initialization failed:', error);
}

// Initialize Weapon Renderer
let weaponRenderer = null;
try {
  weaponRenderer = new WeaponRenderer('weapon-canvas', canvas.width, canvas.height);
} catch (error) {
  Logger.warn('Weapon renderer initialization failed:', error);
}

// Initialize HUD Controller
let hudController = null;
try {
  hudController = new HUDController(player);
} catch (error) {
  Logger.warn('HUD initialization failed:', error);
}

// Initialize Crosshair Controller
let crosshairController = null;
try {
  crosshairController = new CrosshairController();
  window.crosshairController = crosshairController; // Export for sprite system
} catch (error) {
  Logger.warn('Crosshair controller initialization failed:', error);
}

// Initialize Performance Profiler
let profiler = null;
try {
  profiler = new PerformanceProfiler();
  profiler.setEnabled(Config.Debug.profilerEnabled);
  window.profiler = profiler;
} catch (error) {
  Logger.warn('Performance profiler initialization failed:', error);
}

// ============================================
// INPUT MANAGER SETUP
// ============================================

const inputManager = new InputManager(canvas);

// Shooting state
let lastShotTime = 0;

/**
 * Handle shooting logic
 */
function shoot() {
  const now = Date.now();
  
  // Rate limiting
  if (now - lastShotTime < Config.Gameplay.shootCooldown) {
    return;
  }
  
  // Check ammo
  if (player.ammo <= 0) {
    return;
  }
  
  lastShotTime = now;
  
  // Decrement ammo
  player.ammo--;
  updateAmmoUI();
  
  // Update HUD
  if (hudController) {
    hudController.update();
  }
  
  // Spawn projectile
  const spawnDist = 0.5;
  const pX = player.x + player.dirX * spawnDist;
  const pY = player.y + player.dirY * spawnDist;
  spawnSprite(pX, pY, 'projectile', player.dirX, player.dirY, Config.Gameplay.projectileSpeed);
  
  // Trigger visual effects
  effectsCanvas.triggerMuzzleFlash();
  effectsCanvas.triggerScreenShake();
  
  // Weapon recoil
  if (weaponRenderer) {
    weaponRenderer.triggerRecoil();
  }
  
  // Crosshair recoil
  if (crosshairController) {
    crosshairController.triggerRecoil(20);
    crosshairController.setLowAmmoWarning(player.ammo < Config.Gameplay.lowAmmoThreshold);
  }
}

/**
 * Update ammo UI display
 */
function updateAmmoUI() {
  if (valAmmo) valAmmo.textContent = player.ammo;
  if (valMaxAmmo) valMaxAmmo.textContent = player.maxAmmo;
  
  if (ammoBar) {
    const blocks = ammoBar.querySelectorAll('.ammo-block');
    const ammoPerBlock = player.maxAmmo / blocks.length;
    
    blocks.forEach((block, index) => {
      const threshold = (index + 1) * ammoPerBlock;
      if (player.ammo >= threshold) {
        block.classList.add('active');
      } else {
        block.classList.remove('active');
      }
    });
  }
}

// Wire input callbacks
inputManager.onShoot = shoot;

inputManager.onWeaponInspect = () => {
  if (weaponRenderer) {
    weaponRenderer.triggerInspect();
  }
};

inputManager.onRadarToggle = () => {
  if (radarSystem) {
    radarSystem.toggleVisibility();
  }
};

inputManager.onRadarZoomIn = () => {
  if (radarSystem) {
    radarSystem.zoomIn();
  }
};

inputManager.onRadarZoomOut = () => {
  if (radarSystem) {
    radarSystem.zoomOut();
  }
};

inputManager.onScreenshotMode = () => {
  const uiElements = document.querySelectorAll(
    '#hud-container, #crosshair-container, .minimap-border, .fps-counter'
  );
  uiElements.forEach(el => {
    el.style.display = el.style.display === 'none' ? '' : 'none';
  });
};

inputManager.onProfilerToggle = () => {
  if (profiler) {
    profiler.setEnabled(!profiler.enabled);
    Logger.log('Performance profiler:', profiler.enabled ? 'ENABLED' : 'DISABLED');
  }
};

inputManager.onMouseMove = (rotSpeed) => {
  // Apply rotation from mouse movement
  const oldDirX = player.dirX;
  player.dirX = player.dirX * Math.cos(rotSpeed) - player.dirY * Math.sin(rotSpeed);
  player.dirY = oldDirX * Math.sin(rotSpeed) + player.dirY * Math.cos(rotSpeed);
  
  const oldPlaneX = player.planeX;
  player.planeX = player.planeX * Math.cos(rotSpeed) - player.planeY * Math.sin(rotSpeed);
  player.planeY = oldPlaneX * Math.sin(rotSpeed) + player.planeY * Math.cos(rotSpeed);
};

// Fullscreen toggle (F key)
inputManager.onFullscreenToggle = () => {
  const gameContainer = document.querySelector('.game-container');
  if (!document.fullscreenElement) {
    gameContainer.requestFullscreen?.() || 
    gameContainer.webkitRequestFullscreen?.() || 
    gameContainer.mozRequestFullScreen?.();
  } else {
    document.exitFullscreen?.() || 
    document.webkitExitFullscreen?.() || 
    document.mozCancelFullScreen?.();
  }
};

// ============================================
// GAME LOOP
// ============================================

/**
 * Update game state
 * @param {number} dt - Delta time in seconds
 */
function update(dt) {
  const timeScale = dt * 60; // Normalize for 60 FPS
  const movement = inputManager.getMovementState();
  
  const moveSpeed = (movement.sprint 
    ? Config.Gameplay.playerMoveSpeed * Config.Gameplay.sprintMultiplier 
    : Config.Gameplay.playerMoveSpeed) * timeScale;
  const rotSpeed = Config.Gameplay.playerRotSpeed * timeScale;
  
  // Rotation (keyboard)
  let rot = 0;
  if (movement.rotateLeft) rot = rotSpeed;
  if (movement.rotateRight) rot = -rotSpeed;
  
  if (rot !== 0) {
    const oldDirX = player.dirX;
    player.dirX = player.dirX * Math.cos(rot) - player.dirY * Math.sin(rot);
    player.dirY = oldDirX * Math.sin(rot) + player.dirY * Math.cos(rot);
    
    const oldPlaneX = player.planeX;
    player.planeX = player.planeX * Math.cos(rot) - player.planeY * Math.sin(rot);
    player.planeY = oldPlaneX * Math.sin(rot) + player.planeY * Math.cos(rot);
  }
  
  // Forward/backward movement with improved collision
  const WALL_BUFFER = 0.25; // Buffer to prevent seeing through walls
  let moveStep = 0;
  if (movement.forward) moveStep = moveSpeed;
  if (movement.backward) moveStep = -moveSpeed;
  
  if (moveStep !== 0) {
    const newX = player.x + player.dirX * moveStep;
    const newY = player.y + player.dirY * moveStep;
    
    // Collision detection with buffer (check cells in all directions from new position)
    const checkXNeg = Math.floor(newX - WALL_BUFFER);
    const checkXPos = Math.floor(newX + WALL_BUFFER);
    const checkYNeg = Math.floor(newY - WALL_BUFFER);
    const checkYPos = Math.floor(newY + WALL_BUFFER);
    const curY = Math.floor(player.y);
    const curX = Math.floor(player.x);
    
    // Check X movement
    if (WORLD_MAP[checkXNeg]?.[curY] === 0 && WORLD_MAP[checkXPos]?.[curY] === 0) {
      player.x = newX;
    }
    // Check Y movement
    if (WORLD_MAP[curX]?.[checkYNeg] === 0 && WORLD_MAP[curX]?.[checkYPos] === 0) {
      player.y = newY;
    }
  }
  
  // Strafing with improved collision
  let strafeStep = 0;
  if (movement.strafeLeft) strafeStep = -moveSpeed;
  if (movement.strafeRight) strafeStep = moveSpeed;
  
  if (strafeStep !== 0) {
    const strafeDirX = player.dirY;
    const strafeDirY = -player.dirX;
    
    const newX = player.x + strafeDirX * strafeStep;
    const newY = player.y + strafeDirY * strafeStep;
    
    const checkXNeg = Math.floor(newX - WALL_BUFFER);
    const checkXPos = Math.floor(newX + WALL_BUFFER);
    const checkYNeg = Math.floor(newY - WALL_BUFFER);
    const checkYPos = Math.floor(newY + WALL_BUFFER);
    const curY = Math.floor(player.y);
    const curX = Math.floor(player.x);
    
    if (WORLD_MAP[checkXNeg]?.[curY] === 0 && WORLD_MAP[checkXPos]?.[curY] === 0) {
      player.x = newX;
    }
    if (WORLD_MAP[curX]?.[checkYNeg] === 0 && WORLD_MAP[curX]?.[checkYPos] === 0) {
      player.y = newY;
    }
  }
  
  // Update debug display
  if (debugX) debugX.textContent = player.x.toFixed(2);
  if (debugY) debugY.textContent = player.y.toFixed(2);
  if (debugDir) {
    const angleDeg = Math.atan2(player.dirY, player.dirX) * 180 / Math.PI;
    debugDir.textContent = ((angleDeg + 360) % 360).toFixed(0) + '°';
  }
  
  // Update sprites
  updateSprites(dt);
  
  // Check if level is complete (all enemies killed)
  checkLevelComplete();
  
  // Update weapon renderer
  const isMoving = inputManager.isMoving();
  if (weaponRenderer) {
    weaponRenderer.update(dt * 1000, isMoving, player.ammo, player.maxAmmo);
  }
  
  // Update crosshair spread
  if (crosshairController) {
    const velocity = isMoving ? Config.Gameplay.playerMoveSpeed : 0;
    crosshairController.updateMovementSpread(velocity);
    crosshairController.update();
    
    // Enemy detection for crosshair
    updateEnemyDetection();
  }
  
  // Update HUD
  if (hudController) {
    hudController.update();
  }
}

/**
 * Check if crosshair is over enemy
 */
function updateEnemyDetection() {
  if (!crosshairController) return;
  
  const rayLength = Config.UI.radar.enemyDetectionRange;
  let enemyDetected = false;
  
  for (const sprite of sprites) {
    if (sprite.type === 'enemy') {
      const dx = sprite.x - player.x;
      const dy = sprite.y - player.y;
      const dist = Math.sqrt(dx ** 2 + dy ** 2);
      
      if (dist < rayLength) {
        const dot = (dx * player.dirX + dy * player.dirY) / dist;
        if (dot > Config.Gameplay.enemyDetectionAngle) {
          enemyDetected = true;
          break;
        }
      }
    }
  }
  
  crosshairController.setEnemyDetected(enemyDetected);
}

/**
 * Render game frame
 */
function render() {
  // Render 3D world
  const zBuffer = raycaster.render(player, WORLD_MAP);
  
  if (profiler) profiler.mark('worldRender');
  
  // Render sprites
  renderSprites(ctx, canvas, zBuffer);
  
  // Render radar
  if (radarSystem) {
    radarSystem.render(player, WORLD_MAP, sprites);
  } else {
    drawMinimap();
  }
  
  if (profiler) profiler.mark('radarRender');
  
  // Render weapon
  if (weaponRenderer) {
    weaponRenderer.render();
  }
  
  if (profiler) profiler.mark('weaponRender');
}

/**
 * Fallback minimap rendering
 */
function drawMinimap() {
  mCtx.fillStyle = '#0a140a';
  mCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
  
  const gridSize = WORLD_MAP.length;
  const tileSize = minimapCanvas.width / gridSize;
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (WORLD_MAP[x][y] > 0) {
        mCtx.fillStyle = '#1a2e1a';
        mCtx.fillRect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
      }
    }
  }
  
  const pX = player.x * tileSize;
  const pY = player.y * tileSize;
  
  mCtx.fillStyle = '#13ec13';
  mCtx.beginPath();
  mCtx.arc(pX, pY, 3, 0, Math.PI * 2);
  mCtx.fill();
  
  mCtx.strokeStyle = '#13ec13';
  mCtx.beginPath();
  mCtx.moveTo(pX, pY);
  mCtx.lineTo(pX + player.dirX * 10, pY + player.dirY * 10);
  mCtx.stroke();
}

/**
 * Handle window resize
 */
function resize() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  minimapCanvas.width = minimapCanvas.clientWidth;
  minimapCanvas.height = minimapCanvas.clientHeight;
  
  raycaster.resize();
  
  if (weaponRenderer) {
    weaponRenderer.resize(canvas.width, canvas.height);
  }
}

window.addEventListener('resize', resize);
resize();

// ============================================
// START GAME
// ============================================

// Initialize ammo UI
updateAmmoUI();

// Create and start game loop
const gameLoop = new GameLoop({
  onUpdate: update,
  onRender: render,
  profiler: profiler
});

gameLoop.start();

// Export test functions for debugging
window.testDamage = (amount = 10) => {
  player.health = Math.max(0, player.health - amount);
  if (hudController) hudController.update();
  effectsCanvas.triggerDamageFlash();
};

window.testArmorDamage = (amount = 5) => {
  player.armor = Math.max(0, player.armor - amount);
  if (hudController) hudController.update();
};

window.triggerDamageFlash = () => {
  effectsCanvas.triggerDamageFlash();
};

Logger.log('RayCaster Engine initialized');
