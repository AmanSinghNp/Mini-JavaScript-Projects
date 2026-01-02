/**
 * InputManager - Centralized input handling for keyboard, mouse, and touch
 * Extracted from main.js for better separation of concerns
 */

import { Config } from './Config.js';
import { Logger } from '../utils/Logger.js';

export class InputManager {
  constructor(canvas) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    
    /** @type {Object<string, boolean>} Currently pressed keys */
    this.keys = {};
    
    /** @type {boolean} Is pointer currently locked */
    this.isPointerLocked = false;
    
    /** @type {number} Mouse sensitivity for look */
    this.mouseSensitivity = Config.Visuals.mouseSensitivity;
    
    // R key triple-tap tracking for weapon inspect
    this.rKeyPressCount = 0;
    this.lastRKeyTime = 0;
    this.rKeyWindow = 500; // ms window for triple-tap
    
    // Callbacks for game events
    this.onShoot = null;
    this.onWeaponInspect = null;
    this.onRadarToggle = null;
    this.onRadarZoomIn = null;
    this.onRadarZoomOut = null;
    this.onScreenshotMode = null;
    this.onProfilerToggle = null;
    this.onHUDToggle = null;
    this.onMouseMove = null;
    this.onFullscreenToggle = null;
    
    this._bindEvents();
  }

  /**
   * Bind all input event listeners
   * @private
   */
  _bindEvents() {
    // Keyboard events
    window.addEventListener('keydown', this._handleKeyDown.bind(this));
    window.addEventListener('keyup', this._handleKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('click', this._handleClick.bind(this));
    this.canvas.addEventListener('contextmenu', this._handleContextMenu.bind(this));
    this.canvas.addEventListener('mousedown', this._handleMouseDown.bind(this));
    document.addEventListener('mousemove', this._handleMouseMove.bind(this));

    // Pointer lock events
    document.addEventListener('pointerlockchange', this._handlePointerLockChange.bind(this));
    document.addEventListener('mozpointerlockchange', this._handlePointerLockChange.bind(this));
    document.addEventListener('webkitpointerlockchange', this._handlePointerLockChange.bind(this));

    // Mobile touch events
    this._bindMobileControls();
    
    Logger.debug('Input', 'Input events bound');
  }

  /**
   * Handle keydown events
   * @private
   */
  _handleKeyDown(e) {
    this.keys[e.code] = true;

    // Weapon inspect (triple-tap R)
    if (e.code === 'KeyR') {
      const now = Date.now();
      if (now - this.lastRKeyTime < this.rKeyWindow) {
        this.rKeyPressCount++;
      } else {
        this.rKeyPressCount = 1;
      }
      this.lastRKeyTime = now;

      if (this.rKeyPressCount >= 3) {
        this.onWeaponInspect?.();
        this.rKeyPressCount = 0;
      }
    }

    // HUD toggle (H key)
    if (e.code === 'KeyH') {
      this.onHUDToggle?.();
    }

    // Radar toggle (M key)
    if (e.code === 'KeyM') {
      this.onRadarToggle?.();
    }

    // Radar zoom
    if (e.code === 'NumpadAdd' || e.code === 'Equal') {
      this.onRadarZoomIn?.();
    }
    if (e.code === 'NumpadSubtract' || e.code === 'Minus') {
      this.onRadarZoomOut?.();
    }

    // Screenshot mode (F12 or PrintScreen)
    if (e.code === 'F12' || e.code === 'PrintScreen') {
      e.preventDefault();
      this.onScreenshotMode?.();
    }

    // Performance profiler toggle (P key)
    if (e.code === 'KeyP') {
      this.onProfilerToggle?.();
    }

    // Fullscreen toggle (F key)
    if (e.code === 'KeyF') {
      this.onFullscreenToggle?.();
    }
  }

  /**
   * Handle keyup events
   * @private
   */
  _handleKeyUp(e) {
    this.keys[e.code] = false;
  }

  /**
   * Handle click for pointer lock and shooting
   * @private
   */
  _handleClick(e) {
    if (e.button === 0) {
      if (!this.isPointerLocked) {
        // First click locks pointer
        const requestPointerLock = 
          this.canvas.requestPointerLock || 
          this.canvas.mozRequestPointerLock || 
          this.canvas.webkitRequestPointerLock;
        
        if (requestPointerLock) {
          requestPointerLock.call(this.canvas);
        }
      } else {
        // Subsequent clicks shoot
        this.onShoot?.();
      }
    }
  }

  /**
   * Prevent context menu on right click
   * @private
   */
  _handleContextMenu(e) {
    e.preventDefault();
  }

  /**
   * Handle mouse button for shooting (backup for right-click)
   * @private
   */
  _handleMouseDown(e) {
    // Left click is handled in _handleClick
    // Right click can also shoot as backup
    if (e.button === 2 && this.isPointerLocked) {
      e.preventDefault();
      this.onShoot?.();
    }
  }

  /**
   * Handle mouse movement for look
   * @private
   */
  _handleMouseMove(e) {
    if (!this.isPointerLocked) return;

    const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    const rotSpeed = -movementX * this.mouseSensitivity;

    if (rotSpeed !== 0) {
      this.onMouseMove?.(rotSpeed);
    }
  }

  /**
   * Handle pointer lock state changes
   * @private
   */
  _handlePointerLockChange() {
    this.isPointerLocked = 
      document.pointerLockElement === this.canvas ||
      document.mozPointerLockElement === this.canvas ||
      document.webkitPointerLockElement === this.canvas;
  }

  /**
   * Bind mobile touch controls
   * @private
   */
  _bindMobileControls() {
    const dpad = document.getElementById('dpad');
    const btnShoot = document.getElementById('btn-shoot');

    if (dpad) {
      const handleDpad = (e) => {
        e.preventDefault();
        const touch = e.targetTouches[0];
        if (!touch) {
          this.keys['KeyW'] = false;
          this.keys['KeyS'] = false;
          this.keys['ArrowLeft'] = false;
          this.keys['ArrowRight'] = false;
          return;
        }

        const rect = dpad.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const threshold = 10;

        this.keys['KeyW'] = dy < -threshold;
        this.keys['KeyS'] = dy > threshold;
        this.keys['ArrowLeft'] = dx < -threshold;
        this.keys['ArrowRight'] = dx > threshold;
      };

      dpad.addEventListener('touchstart', handleDpad);
      dpad.addEventListener('touchmove', handleDpad);
      dpad.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys['KeyW'] = false;
        this.keys['KeyS'] = false;
        this.keys['ArrowLeft'] = false;
        this.keys['ArrowRight'] = false;
      });
    }

    if (btnShoot) {
      btnShoot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.onShoot?.();
      });
    }
  }

  /**
   * Check if a movement key is pressed
   * @returns {{forward: boolean, backward: boolean, strafeLeft: boolean, strafeRight: boolean, rotateLeft: boolean, rotateRight: boolean, sprint: boolean}}
   */
  getMovementState() {
    return {
      forward: this.keys['KeyW'] || this.keys['ArrowUp'],
      backward: this.keys['KeyS'] || this.keys['ArrowDown'],
      strafeLeft: this.keys['KeyA'],
      strafeRight: this.keys['KeyD'],
      rotateLeft: this.keys['ArrowLeft'] || this.keys['KeyQ'],
      rotateRight: this.keys['ArrowRight'] || this.keys['KeyE'],
      sprint: this.keys['ShiftLeft']
    };
  }

  /**
   * Check if player is moving (for weapon bobbing, crosshair spread)
   * @returns {boolean}
   */
  isMoving() {
    const state = this.getMovementState();
    return state.forward || state.backward || state.strafeLeft || state.strafeRight;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    // Events are automatically cleaned up when page unloads
    // but we could remove them explicitly if needed
    Logger.debug('Input', 'Input manager destroyed');
  }
}

export default InputManager;
