/**
 * PerformanceProfiler - Comprehensive performance profiling system
 * Tracks render time for each UI system and logs warnings when frames exceed target
 */

export class PerformanceProfiler {
  constructor() {
    this.metrics = {
      worldRender: [],
      weaponRender: [],
      hudUpdate: [],
      radarRender: [],
      crosshairUpdate: [],
      effectsRender: [],
      totalFrame: []
    };
    this.enabled = false;
    this.frameStart = 0;
    this.frameCount = 0;
    this.warningThreshold = 16.67; // 60fps target (ms per frame)
  }

  /**
   * Enable or disable profiling
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      // Clear metrics when disabled
      for (const key in this.metrics) {
        this.metrics[key] = [];
      }
    }
  }

  /**
   * Start a new frame measurement
   */
  startFrame() {
    if (!this.enabled) return;
    this.frameStart = performance.now();
    this.frameCount++;
  }

  /**
   * Mark a specific operation with timing
   */
  mark(label) {
    if (!this.enabled) return;
    const time = performance.now();
    const elapsed = time - this.frameStart;
    
    if (this.metrics[label]) {
      this.metrics[label].push(elapsed);
      
      // Keep only last 120 frames (2 seconds at 60fps)
      if (this.metrics[label].length > 120) {
        this.metrics[label].shift();
      }
    }
    
    // Update frame start for next mark
    this.frameStart = time;
  }

  /**
   * End frame and log warnings if needed
   */
  endFrame() {
    if (!this.enabled) return;
    const totalTime = performance.now() - this.frameStart;
    this.metrics.totalFrame.push(totalTime);
    
    // Keep only last 120 frames
    if (this.metrics.totalFrame.length > 120) {
      this.metrics.totalFrame.shift();
    }
    
    // Log warning if frame exceeds target
    if (totalTime > this.warningThreshold) {
      console.warn(
        `[Performance] Frame ${this.frameCount} took ${totalTime.toFixed(2)}ms ` +
        `(target: ${this.warningThreshold}ms for 60fps)`
      );
    }
  }

  /**
   * Get average times for all metrics
   */
  getAverages() {
    const averages = {};
    for (const [key, values] of Object.entries(this.metrics)) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        averages[key] = sum / values.length;
      } else {
        averages[key] = 0;
      }
    }
    return averages;
  }

  /**
   * Get current frame time
   */
  getCurrentFrameTime() {
    if (this.metrics.totalFrame.length > 0) {
      return this.metrics.totalFrame[this.metrics.totalFrame.length - 1];
    }
    return 0;
  }

  /**
   * Get performance summary as string
   */
  getSummary() {
    const averages = this.getAverages();
    const summary = [];
    summary.push('=== Performance Summary ===');
    summary.push(`Total Frame: ${averages.totalFrame.toFixed(2)}ms`);
    summary.push(`World Render: ${averages.worldRender.toFixed(2)}ms`);
    summary.push(`Weapon Render: ${averages.weaponRender.toFixed(2)}ms`);
    summary.push(`HUD Update: ${averages.hudUpdate.toFixed(2)}ms`);
    summary.push(`Radar Render: ${averages.radarRender.toFixed(2)}ms`);
    summary.push(`Crosshair Update: ${averages.crosshairUpdate.toFixed(2)}ms`);
    summary.push(`Effects Render: ${averages.effectsRender.toFixed(2)}ms`);
    summary.push(`Target: ${this.warningThreshold}ms (60fps)`);
    return summary.join('\n');
  }

  /**
   * Reset all metrics
   */
  reset() {
    for (const key in this.metrics) {
      this.metrics[key] = [];
    }
    this.frameCount = 0;
  }
}



