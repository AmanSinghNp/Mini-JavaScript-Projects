# 🚀 Physics Engine Project

A modular 2D physics engine with multiple interactive demos showcasing real-world physics concepts and game development techniques.

## 🏗️ Project Structure

```
Physics-engine/
├── README.md                    # This overview
├── core/                        # 🔧 Shared Physics Engine
│   ├── vector.js               # Enhanced 2D vector mathematics
│   ├── collision.js            # Collision detection utilities
│   └── world.js                # Physics world management (future)
├── systems/                     # ⚙️ Shared Systems
│   ├── input.js                # Input handling utilities (future)
│   └── renderer.js             # Canvas rendering helpers (future)
└── demos/                       # 🎮 Interactive Demonstrations
    ├── bouncing-balls/         # Multi-ball physics sandbox
    └── breakout/               # Classic brick-breaking game
```

## 🎯 Demos Overview

### 🏀 Bouncing Balls Demo

**Location:** `demos/bouncing-balls/`

An advanced physics sandbox featuring:

- **Extreme Physics**: Exaggerated constants for dramatic motion
- **Multi-Ball Support**: Up to 10 balls with ball-to-ball collisions
- **Interactive Controls**: Mouse drag-and-throw with inertia
- **Visual Effects**: 3D rendering, trails, and dynamic shadows
- **Real-time Physics**: Velocity Verlet integration with 60 FPS

**Features:**

- Explosive collision response with energy amplification
- Chaos force injection for unpredictable motion
- Multiple input methods (keyboard, mouse, scroll)
- Advanced force modeling (gravity, drag, friction)

### 🧱 Breakout Game

**Location:** `demos/breakout/`

A complete Breakout clone demonstrating:

- **Shared Engine**: Uses core physics components
- **Game Mechanics**: Lives, scoring, state management
- **Advanced Collision**: Circle-rectangle detection with proper reflection
- **Visual Polish**: Animated brick destruction, trail effects
- **Multiple Controls**: Keyboard and mouse paddle control

**Features:**

- 6 rows × 10 columns of destructible bricks
- Progressive scoring (higher rows = more points)
- Paddle angle physics for ball control
- Game states: playing, paused, game over, victory

## 🔧 Core Physics Engine

### Vector Mathematics (`core/vector.js`)

Enhanced `Vec` class with comprehensive 2D operations:

- Basic math: add, subtract, multiply, divide
- Advanced operations: normalize, dot product, cross product
- Utilities: rotation, distance, interpolation
- Both immutable and mutating versions for performance

### Collision Detection (`core/collision.js`)

Optimized collision detection utilities:

- Circle-rectangle collision (for Breakout)
- Circle-circle collision (for ball interactions)
- Point-in-shape tests
- Collision normal and penetration calculation

## 🎮 Quick Start

### Running the Demos

1. **Bouncing Balls**: Open `demos/bouncing-balls/index.html`
2. **Breakout Game**: Open `demos/breakout/index.html`

Both demos work immediately in any modern browser with ES module support.

### Controls Overview

**Bouncing Balls:**

- Mouse: Drag and throw balls
- Space: Create random ball
- +/-: Adjust ball size
- P: Pause/Resume
- C: Clear all balls

**Breakout:**

- A/D or Arrow Keys: Move paddle
- Mouse: Direct paddle control
- P: Pause/Resume
- R: Restart (when game over)

## 🎓 Educational Value

### Physics Concepts

- **Kinematics**: Position, velocity, acceleration relationships
- **Force Dynamics**: Multiple force types and integration
- **Collision Response**: Elastic and inelastic collisions
- **Energy Systems**: Conservation, damping, and amplification

### Programming Concepts

- **Modular Architecture**: Shared core with game-specific implementations
- **ES Modules**: Modern JavaScript import/export patterns
- **Canvas Graphics**: Advanced 2D rendering techniques
- **Game Loops**: Fixed timestep physics with smooth animation
- **State Management**: Clean game state transitions

### Mathematical Applications

- **Vector Algebra**: 2D vector operations and transformations
- **Numerical Integration**: Velocity Verlet for stable physics
- **Collision Geometry**: Circle-rectangle intersection algorithms
- **Trigonometry**: Angle calculations and rotations

## 🛠️ Development

### Architecture Benefits

- **Code Reuse**: Physics components shared between demos
- **Maintainability**: Bug fixes in core benefit all demos
- **Extensibility**: Easy to add new demos using existing foundation
- **Performance**: Optimized physics calculations and rendering

### Adding New Demos

1. Create new directory in `demos/`
2. Import shared components from `core/`
3. Implement game-specific logic
4. Add to this README

## 🚀 Performance

- **Optimized Physics**: Efficient vector operations and collision detection
- **Smart Rendering**: Minimal overdraw and strategic updates
- **Memory Management**: Limited object creation and array sizes
- **60 FPS Target**: Consistent performance across devices

## 📁 File Organization

Each demo is **self-contained** with its own:

- HTML entry point
- CSS styling
- JavaScript logic
- Documentation

**Shared components** in `core/` are imported as needed, promoting:

- Code reuse
- Consistent behavior
- Easy maintenance
- Modular development

---

**🎮 Ready to explore physics in action?**  
Start with the [Bouncing Balls Demo](demos/bouncing-balls/) for dramatic physics, or jump into the [Breakout Game](demos/breakout/) for classic gameplay!

_Built with modern JavaScript, HTML5 Canvas, and a passion for physics simulation._
