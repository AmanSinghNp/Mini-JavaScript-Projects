# 🚀 Physics Engine Project

A modular 2D physics engine with interactive demos showcasing real-world physics concepts and game development techniques.

## 🏗️ Project Structure

```
Physics-engine/
├── README.md                    # This overview
├── core/                        # 🔧 Shared Physics Engine
│   ├── vector.js               # Enhanced 2D vector mathematics
│   └── collision.js            # Collision detection utilities
└── demos/                       # 🎮 Interactive Demonstrations
    └── bouncing-balls/         # Multi-ball physics sandbox
```

## 🎯 Demo

### 🏀 Bouncing Balls Demo

**Location:** `demos/bouncing-balls/`

An advanced physics sandbox featuring:

- **Realistic Physics**: Gravity, drag, friction, and bouncing
- **Multi-Ball Support**: Up to 10 balls with ball-to-ball collisions
- **Interactive Controls**: Mouse drag-and-throw with inertia
- **Visual Effects**: 3D rendering, trails, and dynamic shadows
- **Real-time Physics**: Velocity Verlet integration at 60 FPS

**Features:**

- Proper collision response with energy dissipation
- Ball settling (balls come to rest naturally)
- Multiple input methods (keyboard, mouse, scroll)
- Advanced force modeling (gravity, drag, floor friction)
- Pause functionality with visual indicator

## 🔧 Core Physics Engine

### Vector Mathematics (`core/vector.js`)

Enhanced `Vec` class with comprehensive 2D operations:

- Basic math: add, subtract, multiply, divide
- Advanced operations: normalize, dot product, cross product
- Utilities: rotation, distance, interpolation, reflection
- `limit()` and `setMagnitude()` for convenience
- Both immutable and mutating versions for performance

### Collision Detection (`core/collision.js`)

Optimized collision detection utilities:

- Circle-rectangle collision
- Circle-circle collision (for ball interactions)
- Point-in-shape tests
- Collision normal and penetration calculation
- Edge case handling for invalid inputs

## 🎮 Quick Start

### Running the Demo

1. **Bouncing Balls**: Open `demos/bouncing-balls/index.html` in any modern browser

The demo works immediately with no build step required.

### Controls

- **Mouse Click**: Create new ball at cursor position
- **Mouse Drag**: Drag and throw balls with inertia
- **Mouse Wheel**: Adjust size for next ball
- **Space**: Create random ball
- **R**: Drop ball from top
- **+/-**: Adjust ball size
- **P**: Pause/Resume
- **C**: Clear all balls

## 🎓 Educational Value

### Physics Concepts

- **Kinematics**: Position, velocity, acceleration relationships
- **Force Dynamics**: Multiple force types and Verlet integration
- **Collision Response**: Elastic collisions with proper impulse
- **Energy Systems**: Conservation, damping, and settling

### Programming Concepts

- **Modular Architecture**: Shared core with demo-specific implementations
- **Canvas Graphics**: Advanced 2D rendering techniques
- **Game Loops**: Fixed timestep physics with smooth animation
- **Object Pooling**: Memory-efficient vector operations

### Mathematical Applications

- **Vector Algebra**: 2D vector operations and transformations
- **Numerical Integration**: Velocity Verlet for stable physics
- **Collision Geometry**: Circle intersection algorithms
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
4. Update this README

## 🚀 Performance

- **Optimized Physics**: Efficient vector operations and collision detection
- **Spatial Partitioning**: Grid-based optimization for many balls
- **Object Pooling**: Reduced garbage collection overhead
- **Smart Rendering**: Minimal overdraw and strategic updates
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
Start with the [Bouncing Balls Demo](demos/bouncing-balls/) for realistic physics simulation!

_Built with modern JavaScript, HTML5 Canvas, and a passion for physics simulation._

## License

Open source under the MIT License. See the root `LICENSE` file in the repository for full details.