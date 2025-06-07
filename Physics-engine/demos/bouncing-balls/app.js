/**
 * Minimalistic Physics Sandbox - Multiple Bouncing Balls Demo
 * Clean interface focusing purely on canvas interactions with multiple balls
 */

// Canvas and context
let canvas;
let ctx;

// Animation state
let animationId;
let isRunning = false;

// Multiple balls array
let balls = [];
const MAX_BALLS = 10;

// Mouse interaction state
let isDragging = false;
let dragBall = null;
let dragOffset = new Vector2D(0, 0);

// Inertia tracking for drag release
let mouseHistory = [];
const MOUSE_HISTORY_LENGTH = 5;

// Ball size control
let currentBallSize = 20;
const MIN_BALL_SIZE = 10;
const MAX_BALL_SIZE = 40;

/**
 * Ball class to represent bouncing balls
 */
class Ball {
  constructor(x, y, radius = null, color = null) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(random(-15, 15), random(-10, 5)); // Much higher initial velocity for dramatic bouncing
    this.radius = radius || currentBallSize;
    this.mass = this.radius * 0.1; // Mass based on radius
    this.color = color || this.getRandomColor();
    this.trail = []; // For visual trail effect
    this.isDragging = false;
    this.opacity = 1.0;
  }

  /**
   * Get a random color from the palette
   * @returns {string} Hex color string
   */
  getRandomColor() {
    const colors = ["#666", "#777", "#555", "#888", "#999"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Check if a point is inside this ball
   * @param {Vector2D} point - Point to check
   * @returns {boolean} True if point is inside ball
   */
  containsPoint(point) {
    const distance = this.position.subtract(point).magnitude();
    return distance <= this.radius;
  }

  /**
   * Draw the ball on the canvas
   */
  draw() {
    // Draw trail
    this.drawTrail();

    // Draw ball shadow
    this.drawShadow();

    // Draw main ball with opacity for dragging
    ctx.globalAlpha = this.opacity;

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);

    // Create gradient for 3D effect
    const gradient = ctx.createRadialGradient(
      this.position.x - this.radius * 0.3,
      this.position.y - this.radius * 0.3,
      0,
      this.position.x,
      this.position.y,
      this.radius
    );
    gradient.addColorStop(0, "#999");
    gradient.addColorStop(1, this.color);

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add ball highlight
    ctx.beginPath();
    ctx.arc(
      this.position.x - this.radius * 0.4,
      this.position.y - this.radius * 0.4,
      this.radius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fill();

    // Reset opacity
    ctx.globalAlpha = 1.0;

    // Update trail
    this.updateTrail();
  }

  /**
   * Draw the ball's trail
   */
  drawTrail() {
    if (this.trail.length < 2) return;

    ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 1; i < this.trail.length; i++) {
      if (i === 1) {
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
      }
      ctx.lineTo(this.trail[i].x, this.trail[i].y);
    }

    ctx.stroke();
  }

  /**
   * Draw the ball's shadow
   */
  drawShadow() {
    const shadowY = canvas.height - 10; // Floor level for shadow
    const shadowOpacity = clamp(1 - (shadowY - this.position.y) / 300, 0, 0.15);

    if (shadowOpacity > 0) {
      ctx.beginPath();
      ctx.ellipse(
        this.position.x,
        shadowY,
        this.radius * 0.8,
        this.radius * 0.2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
      ctx.fill();
    }
  }

  /**
   * Update the trail array
   */
  updateTrail() {
    // Only update trail if not being dragged
    if (!this.isDragging) {
      this.trail.push({ x: this.position.x, y: this.position.y });

      // Limit trail length
      if (this.trail.length > 15) {
        this.trail.shift();
      }
    }
  }
}

/**
 * Initialize the application
 */
function init() {
  // Get canvas and context
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  // Create initial ball
  createBall(canvas.width / 2, canvas.height / 4);

  // Set up event listeners
  setupEventListeners();

  // Start animation
  startAnimation();

  // Hide help overlay after initial display
  setTimeout(() => {
    const helpOverlay = document.getElementById("helpOverlay");
    if (helpOverlay) {
      helpOverlay.style.display = "none";
    }
  }, 4000);
}

/**
 * Create a new ball at specified position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} radius - Optional radius override
 */
function createBall(x, y, radius = null) {
  // Remove oldest ball if at limit
  if (balls.length >= MAX_BALLS) {
    balls.shift(); // Remove the first (oldest) ball
  }

  const ball = new Ball(x, y, radius);
  balls.push(ball);
}

/**
 * Create a random ball
 */
function createRandomBall() {
  const x = random(50, canvas.width - 50);
  const y = random(50, 200);
  createBall(x, y);
}

/**
 * Get mouse position relative to canvas
 * @param {Event} event - Mouse event
 * @returns {Vector2D} Mouse position
 */
function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return new Vector2D(event.clientX - rect.left, event.clientY - rect.top);
}

/**
 * Find ball at given position
 * @param {Vector2D} position - Position to check
 * @returns {Ball|null} Ball at position or null
 */
function findBallAtPosition(position) {
  // Check balls in reverse order (top to bottom)
  for (let i = balls.length - 1; i >= 0; i--) {
    if (balls[i].containsPoint(position)) {
      return balls[i];
    }
  }
  return null;
}

/**
 * Track mouse position for inertia calculation
 * @param {Vector2D} mousePos - Current mouse position
 */
function trackMousePosition(mousePos) {
  mouseHistory.push({
    position: mousePos,
    timestamp: Date.now(),
  });

  // Keep only recent history
  if (mouseHistory.length > MOUSE_HISTORY_LENGTH) {
    mouseHistory.shift();
  }
}

/**
 * Calculate velocity from mouse movement history
 * @returns {Vector2D} Calculated velocity
 */
function calculateDragVelocity() {
  if (mouseHistory.length < 2) {
    return new Vector2D(0, 0);
  }

  const recent = mouseHistory[mouseHistory.length - 1];
  const older = mouseHistory[Math.max(0, mouseHistory.length - 3)];

  const timeDiff = recent.timestamp - older.timestamp;
  if (timeDiff === 0) {
    return new Vector2D(0, 0);
  }

  const positionDiff = recent.position.subtract(older.position);
  const velocity = positionDiff.multiply(16.67 / timeDiff); // Convert to pixels per frame (60fps)

  // Limit velocity magnitude
  const maxVelocity = 15;
  if (velocity.magnitude() > maxVelocity) {
    return velocity.normalize().multiply(maxVelocity);
  }

  return velocity;
}

/**
 * Adjust ball size
 * @param {number} delta - Size change amount
 */
function adjustBallSize(delta) {
  currentBallSize = clamp(
    currentBallSize + delta,
    MIN_BALL_SIZE,
    MAX_BALL_SIZE
  );
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Mouse down - start dragging or create ball
  canvas.addEventListener("mousedown", (event) => {
    const mousePos = getMousePosition(event);
    const ball = findBallAtPosition(mousePos);

    if (ball) {
      // Start dragging existing ball
      isDragging = true;
      dragBall = ball;
      dragBall.isDragging = true;
      dragBall.opacity = 0.7;
      dragOffset = mousePos.subtract(ball.position);

      // Initialize mouse tracking
      mouseHistory = [];
      trackMousePosition(mousePos);
    } else {
      // Create new ball at click position
      createBall(mousePos.x, mousePos.y);
    }
  });

  // Mouse move - handle dragging
  canvas.addEventListener("mousemove", (event) => {
    const mousePos = getMousePosition(event);

    if (isDragging && dragBall) {
      dragBall.position = mousePos.subtract(dragOffset);

      // Track mouse movement for inertia
      trackMousePosition(mousePos);

      // Clear velocity while dragging
      dragBall.velocity = new Vector2D(0, 0);
    }
  });

  // Mouse up - stop dragging and apply inertia
  canvas.addEventListener("mouseup", () => {
    if (isDragging && dragBall) {
      // Apply inertia based on drag movement
      const dragVelocity = calculateDragVelocity();
      dragBall.velocity = dragVelocity;

      // Reset drag state
      dragBall.isDragging = false;
      dragBall.opacity = 1.0;
      isDragging = false;
      dragBall = null;
      mouseHistory = [];
    }
  });

  // Mouse leave - stop dragging if mouse leaves canvas
  canvas.addEventListener("mouseleave", () => {
    if (isDragging && dragBall) {
      // Apply inertia on mouse leave
      const dragVelocity = calculateDragVelocity();
      dragBall.velocity = dragVelocity;

      dragBall.isDragging = false;
      dragBall.opacity = 1.0;
      isDragging = false;
      dragBall = null;
      mouseHistory = [];
    }
  });

  // Mouse wheel - adjust ball size
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -2 : 2;
    adjustBallSize(delta);
  });

  // Keyboard controls
  document.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "Space":
        event.preventDefault();
        createRandomBall();
        break;
      case "KeyP":
        event.preventDefault();
        togglePause();
        break;
      case "KeyR":
        event.preventDefault();
        // Drop ball from top
        const x = random(canvas.width * 0.1, canvas.width * 0.9);
        createBall(x, 0);
        break;
      case "KeyC":
        event.preventDefault();
        // Clear all balls
        balls = [];
        break;
      case "Equal":
      case "NumpadAdd":
        event.preventDefault();
        adjustBallSize(2);
        break;
      case "Minus":
      case "NumpadSubtract":
        event.preventDefault();
        adjustBallSize(-2);
        break;
    }
  });
}

/**
 * Toggle animation pause
 */
function togglePause() {
  if (isRunning) {
    stopAnimation();
  } else {
    startAnimation();
  }
}

/**
 * Start the animation loop
 */
function startAnimation() {
  if (!isRunning) {
    isRunning = true;
    animate();
  }
}

/**
 * Stop the animation loop
 */
function stopAnimation() {
  if (isRunning) {
    isRunning = false;
    cancelAnimationFrame(animationId);
  }
}

/**
 * Main animation loop
 */
function animate() {
  if (!isRunning) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update physics for all balls
  const boundaries = {
    left: 0,
    right: canvas.width,
    top: 0,
    bottom: canvas.height,
  };

  updateMultipleBallPhysics(balls, boundaries);

  // Draw all balls
  balls.forEach((ball) => ball.draw());

  // Update debug info
  updateDebugInfo();

  // Continue animation
  animationId = requestAnimationFrame(animate);
}

/**
 * Update minimal debug information
 */
function updateDebugInfo() {
  const debugElement = document.getElementById("debug");
  if (debugElement) {
    const totalKineticEnergy = balls.reduce((sum, ball) => {
      const speed = ball.velocity.magnitude();
      return sum + 0.5 * ball.mass * speed * speed;
    }, 0);

    debugElement.innerHTML = `
      Balls: ${balls.length}/${MAX_BALLS}<br>
      Size: ${currentBallSize}px<br>
      Energy: ${totalKineticEnergy.toFixed(1)}
    `;
  }
}

/**
 * Start the application when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", init);
