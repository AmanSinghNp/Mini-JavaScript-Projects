/**
 * GameLoop - Manages the main game loop with timing and profiling
 * Extracted from main.js for better separation of concerns
 */

import { Logger } from '../utils/Logger.js';

export class GameLoop {
  /**
   * Create a new game loop
   * @param {Object} options
   * @param {Function} options.onUpdate - Called each frame with delta time (seconds)
   * @param {Function} options.onRender - Called each frame after update
   * @param {Object} [options.profiler] - Optional PerformanceProfiler instance
   */
  constructor({ onUpdate, onRender, profiler = null }) {
    this.onUpdate = onUpdate;
    this.onRender = onRender;
    this.profiler = profiler;

    this.lastTime = 0;
    this.isRunning = false;
    this.animationFrameId = null;
    
    // FPS tracking
    this.currentFps = 0;
    this.fpsElement = document.getElementById('fps-counter');
    
    // Bind the loop to preserve 'this' context
    this._loop = this._loop.bind(this);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this._loop);
    
    Logger.debug('GameLoop', 'Started');
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    Logger.debug('GameLoop', 'Stopped');
  }

  /**
   * Main loop function
   * @private
   */
  _loop(time) {
    if (!this.isRunning) return;

    // Start profiling frame
    if (this.profiler) {
      this.profiler.startFrame();
    }

    // Calculate delta time in seconds
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Update FPS display
    this.currentFps = Math.round(1 / dt);
    if (this.fpsElement) {
      this.fpsElement.textContent = this.currentFps;
    }

    // Run game update
    if (this.onUpdate) {
      this.onUpdate(dt);
    }
    
    if (this.profiler) {
      this.profiler.mark('update');
    }

    // Run game render
    if (this.onRender) {
      this.onRender();
    }
    
    if (this.profiler) {
      this.profiler.mark('render');
    }

    // End profiling frame
    if (this.profiler) {
      this.profiler.endFrame();
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this._loop);
  }

  /**
   * Get current FPS
   * @returns {number}
   */
  getFps() {
    return this.currentFps;
  }

  /**
   * Set the profiler instance
   * @param {Object} profiler - PerformanceProfiler instance
   */
  setProfiler(profiler) {
    this.profiler = profiler;
  }
}

export default GameLoop;
