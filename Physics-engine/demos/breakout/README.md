# 🧱 Breakout Game

A classic **Breakout** clone built using the shared physics engine from the bouncing ball demo. This game demonstrates modular architecture, collision detection, and game state management.

## 🎮 How to Play

### Controls

- **A/D Keys** or **Arrow Keys**: Move paddle left/right
- **Mouse**: Move paddle to mouse position
- **P**: Pause/Resume game
- **R**: Restart game (when game over or victory)

### Objective

Break all the bricks without letting the ball fall off the screen! You have 3 lives to complete the challenge.

### Scoring

- Higher rows of bricks give more points
- Bottom row (red): 60 points per brick
- Top row (purple): 10 points per brick

## 🏗️ Architecture

This Breakout implementation demonstrates the **shared physics engine** approach:

### Shared Core Components

```
src/core/
├── vector.js       # Vec class with 2D vector math
└── collision.js    # Collision detection utilities
```

### Game-Specific Components

```
src/demo/breakout/
├── ball.js         # Game ball with trail effects
├── paddle.js       # Player-controlled paddle
├── brick.js        # Destructible bricks with animations
├── main.js         # Game loop and logic
├── index.html      # Game interface
├── styles.css      # Modern CSS styling
└── README.md       # This documentation
```

## ⚙️ Technical Features

### Physics Engine Integration

- **Vector Mathematics**: Uses shared `Vec` class for all 2D calculations
- **Collision Detection**: Leverages `circleRect()` for ball-brick collisions
- **Modular Design**: Game logic separated from physics calculations

### Game Mechanics

- **Fixed Timestep**: 60 FPS physics updates for consistent gameplay
- **Paddle Physics**: Ball angle varies based on paddle hit position
- **Brick Destruction**: Animated brick destruction with scaling and rotation
- **State Management**: Pause, game over, and victory states

### Visual Effects

- **3D Rendering**: Gradient shading for realistic ball and paddle appearance
- **Trail Effects**: Ball leaves a glowing trail as it moves
- **Animations**: Smooth brick destruction with scale and rotation
- **Responsive UI**: Modern interface that adapts to different screen sizes

## 🔧 Customization

### Game Constants

You can modify these values in `main.js`:

```javascript
const CANVAS_WIDTH = 800; // Game area width
const CANVAS_HEIGHT = 600; // Game area height
const BRICK_ROWS = 6; // Number of brick rows
const BRICK_COLS = 10; // Number of brick columns
const PADDLE_WIDTH = 100; // Paddle width
```

### Ball Physics

Modify ball behavior in the `Ball` class constructor:

```javascript
constructor(x, y, speed = 350, radius = 8) {
  // Adjust speed and size as needed
}
```

### Visual Styling

The game uses CSS custom properties and can be easily themed by modifying `styles.css`.

## 🎨 Design Philosophy

### Shared Engine Benefits

1. **Code Reuse**: Vector math and collision detection shared between demos
2. **Consistency**: Same physics behavior across different games
3. **Maintainability**: Bug fixes in core components benefit all demos
4. **Extensibility**: Easy to add new game types using the same foundation

### Game-Specific Enhancements

1. **Custom Mechanics**: Paddle angle physics specific to Breakout
2. **Visual Polish**: Trail effects and animations enhance gameplay
3. **User Experience**: Intuitive controls and clear visual feedback
4. **Progressive Difficulty**: Scoring system encourages skilled play

## 🚀 Performance

- **Optimized Rendering**: Efficient canvas drawing with minimal overdraw
- **Smart Updates**: Only active bricks are updated and rendered
- **Memory Management**: Trail arrays are length-limited to prevent memory leaks
- **Smooth Animation**: Fixed timestep ensures consistent 60 FPS performance

## 🔄 Game States

The game manages four distinct states:

1. **Playing**: Normal gameplay with physics and collision detection
2. **Paused**: Game frozen, physics stopped, overlay displayed
3. **Game Over**: All lives lost, final score shown, restart available
4. **Victory**: All bricks destroyed, celebration screen, restart available

## 📚 Learning Objectives

This demo teaches:

- **Modular Architecture**: How to structure shared vs. game-specific code
- **Physics Integration**: Using a physics engine for game mechanics
- **State Management**: Handling different game states cleanly
- **Canvas Graphics**: Advanced 2D rendering techniques
- **Input Handling**: Multiple input methods (keyboard, mouse)
- **Game Design**: Classic game mechanics and user experience

---

**Part of the Physics-engine demo collection**  
_Demonstrates modular physics engine architecture and classic game development_
