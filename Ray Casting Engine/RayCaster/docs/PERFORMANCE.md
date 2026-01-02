# Performance Optimization Guide

## Overview

This document outlines performance targets, optimization strategies, and profiling techniques for the RayCaster UI system.

## Performance Targets

### Frame Rate
- **Target**: 60 FPS (16.67ms per frame)
- **Minimum**: 30 FPS (33.33ms per frame)
- **Warning Threshold**: 16.67ms (logged when exceeded)

### System-Specific Targets

| System | Target Time | Max Time |
|--------|-------------|----------|
| World Render | < 8ms | 12ms |
| Weapon Render | < 1ms | 2ms |
| HUD Update | < 0.5ms | 1ms |
| Radar Render | < 1ms | 2ms |
| Crosshair Update | < 0.1ms | 0.5ms |
| Effects Render | < 0.5ms | 1ms |
| **Total UI** | < 2ms | 4ms |

## Profiling

### Enable Performance Profiler

```javascript
import { PerformanceProfiler } from './js/performance/ProfilerManager.js';

const profiler = new PerformanceProfiler();
profiler.setEnabled(true);

// In game loop
function gameLoop(deltaTime) {
  profiler.startFrame();
  
  renderWorld();
  profiler.mark('worldRender');
  
  weaponRenderer.render();
  profiler.mark('weaponRender');
  
  hudController.update();
  profiler.mark('hudUpdate');
  
  radarSystem.render();
  profiler.mark('radarRender');
  
  crosshairController.update();
  profiler.mark('crosshairUpdate');
  
  profiler.endFrame();
  
  // Log summary every 60 frames
  if (frameCount % 60 === 0) {
    console.log(profiler.getSummary());
  }
}
```

### Reading Profiler Output

```javascript
// Get average times
const averages = profiler.getAverages();
console.log('Average frame time:', averages.totalFrame);

// Get current frame time
const current = profiler.getCurrentFrameTime();

// Get full summary
console.log(profiler.getSummary());
```

## Optimization Strategies

### 1. Conditional Updates

Only update UI when values change:

```javascript
// Bad: Updates every frame
crosshairController.update();

// Good: Only updates when spread changes
if (crosshairController.currentSpread !== lastSpread) {
  crosshairController.update();
}
```

### 2. Spatial Culling

Limit processing to visible/active elements:

```javascript
// Radar only processes entities within range
const viewRange = radius * scale;
entities.forEach(entity => {
  const distance = calculateDistance(entity, player);
  if (distance > viewRange) return; // Skip
  // Process entity...
});
```

### 3. CSS vs Canvas

Use CSS for simple animations, Canvas for complex rendering:

```javascript
// Good: CSS animation (GPU accelerated)
.crosshair-line {
  transition: all 0.15s ease-out;
}

// Bad: Canvas animation (CPU bound)
ctx.clearRect();
ctx.drawLine();
// ... every frame
```

### 4. Frame Skipping

Update non-critical systems less frequently:

```javascript
let frameCount = 0;

function gameLoop() {
  frameCount++;
  
  // Update every frame
  crosshairController.update();
  
  // Update every 3rd frame
  if (frameCount % 3 === 0) {
    radarSystem.update();
  }
}
```

### 5. Canvas Optimization

- Use `will-change` CSS property for animated elements
- Cache static elements in offscreen canvas
- Minimize canvas operations (batch draws)
- Use `requestAnimationFrame` for smooth updates

### 6. DOM Query Caching

Cache DOM queries in constructors:

```javascript
// Bad: Queries DOM every update
update() {
  const element = document.getElementById('health-bar');
  element.style.width = percentage + '%';
}

// Good: Caches in constructor
constructor() {
  this.healthBar = document.getElementById('health-bar');
}

update() {
  this.healthBar.style.width = percentage + '%';
}
```

## Common Performance Issues

### Issue: High Frame Time (> 16.67ms)

**Causes**:
- Too many entities in radar
- Complex CSS animations
- Unoptimized canvas operations
- Memory leaks

**Solutions**:
1. Enable profiler to identify bottleneck
2. Reduce entity count or increase culling distance
3. Simplify animations or use CSS transforms
4. Profile memory usage (Chrome DevTools)

### Issue: Stuttering/Frame Drops

**Causes**:
- Garbage collection pauses
- Synchronous operations blocking main thread
- Too many DOM updates

**Solutions**:
1. Minimize object creation in hot paths
2. Use `requestAnimationFrame` for all updates
3. Batch DOM updates
4. Use Web Workers for heavy computations (if needed)

### Issue: High Memory Usage

**Causes**:
- Canvas not cleared properly
- Event listeners not removed
- Large texture arrays
- Profiler storing too many metrics

**Solutions**:
1. Clear canvas every frame
2. Remove event listeners on cleanup
3. Limit texture resolution
4. Limit profiler history (120 frames max)

## Performance Checklist

- [ ] Profiler enabled and showing < 16.67ms average
- [ ] No console warnings for frame time
- [ ] All UI systems update conditionally
- [ ] Spatial culling active for radar
- [ ] CSS animations used where possible
- [ ] DOM queries cached in constructors
- [ ] Canvas cleared every frame
- [ ] No memory leaks (check DevTools)
- [ ] Smooth 60fps on target hardware
- [ ] Performance acceptable at 4K resolution

## Hardware-Specific Optimizations

### Low-End Devices

- Disable CRT overlay effects
- Reduce radar update frequency
- Simplify weapon animations
- Lower texture resolution

### High-End Devices

- Enable all effects
- Increase radar range
- Add additional visual polish
- Higher resolution textures

## Monitoring in Production

```javascript
// Add performance monitoring
if (window.performance && window.performance.memory) {
  const memory = window.performance.memory;
  console.log('Memory:', {
    used: (memory.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
    total: (memory.totalJSHeapSize / 1048576).toFixed(2) + 'MB',
    limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + 'MB'
  });
}
```

## Best Practices

1. **Profile First**: Always measure before optimizing
2. **Optimize Hot Paths**: Focus on code that runs every frame
3. **Use Browser Tools**: Chrome DevTools Performance tab
4. **Test on Target Hardware**: Don't optimize for dev machine only
5. **Monitor Over Time**: Performance can degrade with memory leaks

