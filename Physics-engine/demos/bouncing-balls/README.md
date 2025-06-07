# 🏀 Bouncing Ball Physics Demo

A realistic bouncing ball simulation built with HTML5 Canvas and JavaScript, demonstrating fundamental physics concepts like gravity, collision detection, and energy conservation.

## 🎯 What This Project Does

This interactive demo simulates a ball bouncing within a bounded area using real physics calculations. The ball:

- Falls under the influence of gravity
- Bounces off walls, floor, and ceiling
- Loses energy with each bounce (realistic physics)
- Experiences air resistance
- Shows visual trail and shadow effects

## ✨ Features

### Core Physics

- **Gravity**: Constant downward acceleration
- **Collision Detection**: Ball vs. boundaries collision system
- **Energy Loss**: Realistic bounce damping
- **Air Resistance**: Velocity reduction over time
- **Friction**: Surface friction when rolling

### Visual Effects

- **3D Ball Rendering**: Gradient and highlight effects
- **Motion Trail**: Visual trail showing ball's path
- **Dynamic Shadow**: Ground shadow with distance-based opacity
- **Smooth Animation**: 60 FPS using `requestAnimationFrame`

### Interactive Controls

- **Click to Create**: Click anywhere on canvas to create a new ball
- **Reset Button**: Reset ball to random position
- **Keyboard Controls**:
  - `SPACE`: Reset ball
  - `P`: Pause/Resume animation

## 📁 File Structure

```
/bouncing-ball-demo
├── index.html          # Main webpage with canvas
├── styles.css          # Visual styling and layout
├── app.js              # Main application logic & animation loop
├── physics.js          # Physics engine (vectors, forces, collisions)
├── utils.js            # Helper utilities (clamp, random, etc.)
└── README.md           # This documentation
```

## 🧠 Learning Goals & Concepts

### Physics Concepts

- [x] **Vector Mathematics**: 2D vector operations (add, subtract, multiply)
- [x] **Kinematics**: Position, velocity, acceleration relationships
- [x] **Forces**: Gravity as constant acceleration
- [x] **Collision Response**: Elastic and inelastic collisions
- [x] **Energy Conservation**: Energy loss through damping factors

### Programming Concepts

- [x] **Object-Oriented Design**: Ball and Vector2D classes
- [x] **Game Loop**: Animation loop with `requestAnimationFrame`
- [x] **Canvas API**: 2D graphics rendering
- [x] **Event Handling**: Mouse and keyboard interactions
- [x] **Modular Architecture**: Separation of concerns across files

### Mathematical Applications

- [x] **Coordinate Systems**: 2D Cartesian coordinates
- [x] **Trigonometry**: Circle drawing and vector calculations
- [x] **Linear Interpolation**: Smooth animations and effects
- [x] **Boundary Conditions**: Collision detection algorithms

## 🚀 How to Run

1. Open `index.html` in any modern web browser
2. Watch the ball bounce automatically
3. Click anywhere on the canvas to create a new ball at that position
4. Use keyboard controls for additional interactions

## 🔧 Physics Parameters

You can modify these values in `physics.js` to experiment:

```javascript
const PHYSICS = {
  GRAVITY: 0.5, // Gravitational acceleration
  BOUNCE_DAMPING: 0.8, // Energy loss on bounce (0-1)
  AIR_RESISTANCE: 0.999, // Air resistance factor
  FLOOR_FRICTION: 0.95, // Rolling friction
};
```

## 🎨 Visual Customization

The ball appearance can be customized in the `Ball` class constructor:

- `color`: Ball color (default: '#FF6B6B')
- `radius`: Ball size (randomized between 15-30px)
- Trail length and shadow effects

## 🧪 Experimentation Ideas

### Physics Modifications

- [ ] Add multiple balls with ball-to-ball collisions
- [ ] Implement different gravity strengths
- [ ] Add wind force (horizontal acceleration)
- [ ] Create different surface materials with varying friction

### Visual Enhancements

- [ ] Particle effects on bounce
- [ ] Ball deformation on collision
- [ ] Background textures and patterns
- [ ] Sound effects for bounces

### Interactive Features

- [ ] Ball size controls
- [ ] Gravity direction controls
- [ ] Multiple ball spawning
- [ ] Save/load ball configurations

## 📚 Technical Notes

### Performance Optimizations

- Uses `requestAnimationFrame` for smooth 60 FPS animation
- Trail array limited to 20 points to prevent memory issues
- Efficient collision detection with early exits

### Browser Compatibility

- Works in all modern browsers supporting HTML5 Canvas
- No external dependencies required
- Responsive design adapts to different screen sizes

### Code Architecture

- **Modular Design**: Physics, utilities, and app logic separated
- **Clean Interfaces**: Clear function signatures and documentation
- **Extensible Structure**: Easy to add new features and physics

---

**Created as part of Mini JavaScript Projects collection**  
_Focus: Physics simulation, Canvas graphics, and interactive animations_
