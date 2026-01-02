# Ray Casting Engine

A retro-style 3D raycasting engine built with vanilla JavaScript, featuring a complete UI system with tactical HUD, weapon rendering, radar, and visual effects.

## Project Structure

```
Ray Casting Engine/
├── README.md                    # This file
├── RayCaster/                   # Main engine directory
│   ├── index.html               # Main game HTML file
│   ├── main.js                  # Game loop and core logic
│   ├── map.js                   # World map definition
│   ├── player.js                # Player state and movement
│   ├── sprite.js                # Sprite rendering system
│   ├── textures.js               # Procedural texture generation
│   ├── js/                       # JavaScript modules
│   │   ├── effects-layer.js     # Screen effects (damage flash, shake)
│   │   ├── effects/
│   │   │   └── MuzzleFlash.js   # Muzzle flash effect
│   │   ├── performance/
│   │   │   └── ProfilerManager.js # Performance profiling
│   │   ├── rendering/
│   │   │   ├── WeaponRenderer.js  # Weapon rendering system
│   │   │   └── weapons/
│   │   │       └── PistolSprite.js # Procedural pistol sprite
│   │   └── ui/                   # UI system modules
│   │       ├── CrosshairController.js
│   │       ├── HUDController.js
│   │       ├── PlayerFaceIcon.js
│   │       ├── RadarSystem.js
│   │       ├── StatusBar.js
│   │       └── UIManager.js
│   ├── styles/                   # CSS stylesheets
│   │   ├── animations.css
│   │   ├── crosshair.css
│   │   ├── crt-overlay.css
│   │   ├── hud-panels.css
│   │   ├── layer-ordering.css
│   │   └── phosphor-glow.css
│   └── docs/                     # Documentation
│       ├── UI-ARCHITECTURE.md
│       └── PERFORMANCE.md
└── samples/                      # Sample/demo files
    ├── sample.html
    ├── sample2.html
    ├── sample3.html
    └── sample4.html
```

## Quick Start

1. Navigate to the `RayCaster` directory
2. Open `index.html` in a modern web browser
3. The game should load automatically

### Controls

- **WASD**: Move (W/S forward/backward, A/D strafe left/right)
- **Arrow Keys**: Rotate camera (Left/Right) or move (Up/Down)
- **Q/E**: Alternative rotation keys
- **Left Click**: Lock mouse pointer for mouse look
- **Right Click**: Shoot
- **H**: Toggle HUD visibility
- **M**: Toggle radar visibility
- **Numpad +/-**: Zoom radar in/out
- **R** (triple-tap): Weapon inspect animation
- **F12/PrintScreen**: Screenshot mode (hide all UI)
- **P**: Toggle performance profiler

## Features

### Core Engine
- **Raycasting Rendering**: Classic 3D raycasting algorithm for retro FPS feel
- **Texture Mapping**: Procedurally generated wall textures
- **Sprite System**: Dynamic sprite rendering with occlusion
- **Collision Detection**: Grid-based collision system

### UI Systems
- **Tactical HUD**: Angled panels with health, armor, and ammo displays
- **Weapon Rendering**: Procedural weapon sprites with recoil and animations
- **Radar System**: Circular minimap with enemy tracking and FOV cone
- **Dynamic Crosshair**: Spread system with enemy detection and hit markers
- **CRT Effects**: Scanlines, chromatic aberration, and phosphor glow
- **Screen Effects**: Damage flash, muzzle flash, and screen shake

### Performance
- **Optimized Rendering**: Efficient raycasting with z-buffer for sprites
- **Performance Profiler**: Built-in profiling system for frame time analysis
- **Layer Management**: Organized z-index system for UI elements

## Technical Details

### Architecture
The engine uses ES6 modules with a modular architecture:
- Core game logic in root-level files (`main.js`, `player.js`, `map.js`, etc.)
- UI systems organized in `js/ui/`
- Rendering systems in `js/rendering/`
- Effects in `js/effects/`
- Stylesheets organized by feature in `styles/`

### Layer Stacking (Z-Index)
1. World Canvas (z-index: 1)
2. Weapon Canvas (z-index: 12)
3. Effects Canvas (z-index: 15)
4. Radar (z-index: 4-5)
5. HUD Panels (z-index: 100-101)
6. Crosshair (z-index: 90)
7. CRT Overlay (z-index: 1000)

## Documentation

- **UI Architecture**: See `RayCaster/docs/UI-ARCHITECTURE.md`
- **Performance Guide**: See `RayCaster/docs/PERFORMANCE.md`
- **Integration Guide**: See `RayCaster/README-INTEGRATION.md`

## Browser Compatibility

Requires a modern browser with ES6 module support:
- Chrome/Edge 61+
- Firefox 60+
- Safari 11+

## Development

The engine uses vanilla JavaScript with ES6 modules. No build step required - simply open `index.html` in a browser. For local development, you may need to serve files via a local web server due to CORS restrictions with ES6 modules.

### Quick Local Server

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server)
npx http-server

# Then navigate to http://localhost:8000/RayCaster/
```

## License

See the main project LICENSE file.

