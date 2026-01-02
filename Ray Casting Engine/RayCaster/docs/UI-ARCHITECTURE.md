# UI System Architecture Documentation

## Overview

The RayCaster engine uses a multi-layered UI system with distinct rendering layers for optimal performance and visual clarity. This document describes the architecture, dependencies, and integration patterns.

## Layer Stacking Order (Z-Index)

The UI system uses the following z-index hierarchy (from bottom to top):

1. **World Canvas** (`#screen`) - `z-index: 1`
   - Main game rendering (raycasting, sprites)
   - Base layer for all game content

2. **Weapon Canvas** (`#weapon-canvas`) - `z-index: 12`
   - Procedural weapon sprite rendering
   - Recoil animations and muzzle flash
   - Positioned above world, below effects

3. **Effects Canvas** (`#effects-canvas`) - `z-index: 15`
   - Damage flash effects
   - Screen shake (CSS transform)
   - Muzzle flash overlay
   - Created dynamically by `EffectsCanvas` class

4. **Radar/Minimap** (`#minimap`) - `z-index: 4-5`
   - Circular radar display
   - Enemy tracking and FOV cone
   - Positioned in top-left corner

5. **HUD Panels** (`#hud-container`) - `z-index: 100-101`
   - Tactical HUD with health/armor bars
   - Weapon information and ammo display
   - Positioned at screen corners

6. **Crosshair** (`#crosshair-container`) - `z-index: 90`
   - Dynamic crosshair with hit feedback
   - Enemy detection indicators
   - Low ammo warnings

7. **CRT Overlay** (`.crt-overlay`) - `z-index: 1000`
   - Scanlines, chromatic aberration
   - Vignette and barrel distortion
   - Topmost visual effect layer

## System Components

### 1. EffectsCanvas (`js/effects-layer.js`)

**Purpose**: Screen-space post-processing effects

**Features**:
- Damage flash (radial gradient, 300ms fade)
- Muzzle flash (yellow circle, 100ms fade)
- Screen shake (CSS transform, 200ms)

**Dependencies**: None

**Initialization**:
```javascript
const effectsCanvas = new EffectsCanvas(gameViewport);
```

### 2. WeaponRenderer (`js/rendering/WeaponRenderer.js`)

**Purpose**: Procedural weapon sprite rendering

**Features**:
- Recoil animation (8 frames, cubic easing)
- Movement bobbing (sine wave)
- Low ammo shake (< 20% ammo)
- Muzzle flash integration

**Dependencies**: Canvas element, game dimensions

**Initialization**:
```javascript
const weaponRenderer = new WeaponRenderer('weapon-canvas', width, height);
```

### 3. HUDController (`js/ui/HUDController.js`)

**Purpose**: Tactical HUD panel management

**Features**:
- Health/armor status bars with smooth interpolation
- Procedural player face icon (health-based expressions)
- Ammo display with grid visualization
- Weapon information

**Dependencies**: Player object

**Initialization**:
```javascript
const hudController = new HUDController(player);
```

### 4. RadarSystem (`js/ui/RadarSystem.js`)

**Purpose**: Circular radar minimap with entity tracking

**Features**:
- Wall rendering with spatial culling
- Enemy tracking with direction indicators
- FOV cone visualization
- Scanner sweep animation

**Dependencies**: Canvas element, world map, entities array

**Initialization**:
```javascript
const radarSystem = new RadarSystem('minimap', radius, scale);
```

### 5. CrosshairController (`js/ui/CrosshairController.js`)

**Purpose**: Dynamic crosshair with feedback

**Features**:
- Spread system (recoil, movement, recovery)
- Enemy detection (cyan tint, pulse)
- Hit markers (X shape on successful hit)
- Kill indicators (points popup)
- Low ammo warnings

**Dependencies**: None

**Initialization**:
```javascript
const crosshairController = new CrosshairController();
```

## Update Order

The UI systems must be updated in a specific order to ensure dependencies are met:

1. **HUD Controller** - Updates based on player state
2. **Weapon Renderer** - Updates animations based on player state
3. **Crosshair Controller** - Updates spread and enemy detection
4. **Radar System** - Renders based on player position and entities
5. **Effects Canvas** - Has its own animation loop (no explicit update needed)

## Integration Pattern

Use the `UIManager` class to coordinate all systems:

```javascript
import { UIManager } from './js/ui/UIManager.js';

const uiManager = new UIManager(
  player,
  WORLD_MAP,
  sprites,
  canvas,
  gameViewport
);

// In game loop
function gameLoop(deltaTime) {
  // ... game logic ...
  
  const isMoving = /* movement detection */;
  uiManager.update(deltaTime, isMoving);
  uiManager.render();
  
  // ... rest of loop ...
}

// On player shoot
function handleShoot() {
  // ... shooting logic ...
  uiManager.handleShoot();
}

// On player damage
function handleDamage(amount) {
  player.health -= amount;
  uiManager.handleDamage(amount);
}
```

## Performance Considerations

### Optimization Strategies

1. **Conditional Updates**: Only update UI when values change
2. **Spatial Culling**: Radar only processes entities within range
3. **CSS Animations**: Use CSS for simple animations (crosshair, HUD)
4. **Canvas Caching**: Cache static elements when possible
5. **Frame Skipping**: Update non-critical systems every N frames

### Performance Targets

- **60 FPS**: Target frame time < 16.67ms
- **World Render**: < 8ms
- **UI Updates**: < 2ms total
- **Weapon Render**: < 1ms
- **Radar Render**: < 1ms

## Troubleshooting

### Z-Index Conflicts

If UI elements overlap incorrectly:
1. Check `styles/layer-ordering.css` for z-index values
2. Ensure proper stacking context (position: relative/absolute)
3. Verify canvas elements are siblings, not nested

### Performance Issues

If frame rate drops:
1. Enable performance profiler: `profiler.setEnabled(true)`
2. Check console for warnings (frames > 16.67ms)
3. Review `profiler.getAverages()` for bottlenecks
4. Disable non-essential effects (CRT overlay, scanner sweep)

### Missing UI Elements

If UI doesn't appear:
1. Check browser console for initialization errors
2. Verify all CSS files are loaded
3. Ensure HTML elements exist before initialization
4. Check `UIManager.isInitialized` flag

## Accessibility

### Colorblind Support

The system uses green (#0f0) as primary color. For colorblind users:
- Consider adding colorblind mode toggle
- Use patterns/textures in addition to color
- Ensure sufficient contrast ratios

### Keyboard Navigation

- **H**: Toggle HUD visibility
- **M**: Toggle radar visibility
- **Numpad +/-**: Zoom radar
- **R** (triple-tap): Weapon inspect animation

## Future Enhancements

- Settings menu for UI customization
- Multiple crosshair presets
- Damage direction indicators
- Accuracy heatmap overlay
- Fog of war for radar
- Waypoint markers

