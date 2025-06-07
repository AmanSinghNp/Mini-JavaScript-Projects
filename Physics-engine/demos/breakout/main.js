/**
 * Breakout Game - Main Logic
 * Complete game implementation using shared physics engine
 */

import { Ball } from "./ball.js";
import { Paddle } from "./paddle.js";
import { Brick } from "./brick.js";
import { circleRect } from "../../core/collision.js";

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 14;
const BRICK_ROWS = 6;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;

// Game state
let canvas, ctx;
let paddle,
  ball,
  bricks = [];
let lives = 3;
let score = 0;
let gameState = "playing"; // 'playing', 'paused', 'gameOver', 'victory'

// Timing
let lastTime = 0;
let accumulator = 0;
const FIXED_TIMESTEP = 1 / 60; // 60 FPS

// Input handling
const keys = {
  left: false,
  right: false,
  space: false,
};

/**
 * Initialize the game
 */
function init() {
  // Get canvas and context
  canvas = document.getElementById("game");
  ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Create game objects
  paddle = new Paddle(PADDLE_WIDTH, PADDLE_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT);
  ball = new Ball(CANVAS_WIDTH / 2, paddle.pos.y - 30);

  // Create brick layout
  createBricks();

  // Set up event listeners
  setupInput();

  // Start game loop
  requestAnimationFrame(gameLoop);
}

/**
 * Create the brick layout
 */
function createBricks() {
  bricks = [];

  const colors = [
    "#FF5722", // Red
    "#FF9800", // Orange
    "#FFC107", // Amber
    "#4CAF50", // Green
    "#2196F3", // Blue
    "#9C27B0", // Purple
  ];

  const startX =
    (CANVAS_WIDTH -
      (BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) /
    2;
  const startY = 60;

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      const x = startX + col * (BRICK_WIDTH + BRICK_PADDING);
      const y = startY + row * (BRICK_HEIGHT + BRICK_PADDING);
      const color = colors[row % colors.length];
      const points = (BRICK_ROWS - row) * 10; // Higher rows worth more points

      bricks.push(new Brick(x, y, BRICK_WIDTH, BRICK_HEIGHT, color, points));
    }
  }
}

/**
 * Set up input handling
 */
function setupInput() {
  // Keyboard events
  document.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        keys.left = true;
        e.preventDefault();
        break;
      case "ArrowRight":
      case "KeyD":
        keys.right = true;
        e.preventDefault();
        break;
      case "Space":
        keys.space = true;
        e.preventDefault();
        break;
      case "KeyP":
        togglePause();
        e.preventDefault();
        break;
      case "KeyR":
        if (gameState === "gameOver" || gameState === "victory") {
          resetGame();
        }
        e.preventDefault();
        break;
    }
  });

  document.addEventListener("keyup", (e) => {
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        keys.left = false;
        break;
      case "ArrowRight":
      case "KeyD":
        keys.right = false;
        break;
      case "Space":
        keys.space = false;
        break;
    }
  });

  // Mouse events for paddle control
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Move paddle to mouse position
    paddle.pos.x = mouseX;

    // Keep within bounds
    const halfWidth = paddle.size.w / 2;
    paddle.pos.x = Math.max(
      halfWidth,
      Math.min(CANVAS_WIDTH - halfWidth, paddle.pos.x)
    );
  });
}

/**
 * Main game loop
 */
function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  accumulator += deltaTime;

  // Fixed timestep updates
  while (accumulator >= FIXED_TIMESTEP) {
    update(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }

  render();
  requestAnimationFrame(gameLoop);
}

/**
 * Update game logic
 */
function update(dt) {
  if (gameState !== "playing") return;

  // Handle input
  handleInput();

  // Update game objects
  paddle.update(dt);
  ball.update(dt);

  // Update brick animations
  bricks.forEach((brick) => brick.update(dt));

  // Handle collisions
  handleWallCollisions();
  handlePaddleCollision();
  handleBrickCollisions();

  // Check for ball falling off screen
  if (ball.pos.y - ball.radius > CANVAS_HEIGHT) {
    loseLife();
  }

  // Check win condition
  if (bricks.every((brick) => !brick.alive)) {
    gameState = "victory";
  }
}

/**
 * Handle input
 */
function handleInput() {
  let moveDirection = 0;

  if (keys.left) moveDirection -= 1;
  if (keys.right) moveDirection += 1;

  paddle.setMovement(moveDirection);
}

/**
 * Handle wall collisions
 */
function handleWallCollisions() {
  // Left and right walls
  if (ball.pos.x - ball.radius <= 0) {
    ball.pos.x = ball.radius;
    ball.vel.x = Math.abs(ball.vel.x);
  }

  if (ball.pos.x + ball.radius >= CANVAS_WIDTH) {
    ball.pos.x = CANVAS_WIDTH - ball.radius;
    ball.vel.x = -Math.abs(ball.vel.x);
  }

  // Top wall
  if (ball.pos.y - ball.radius <= 0) {
    ball.pos.y = ball.radius;
    ball.vel.y = Math.abs(ball.vel.y);
  }
}

/**
 * Handle paddle collision
 */
function handlePaddleCollision() {
  const paddleRect = paddle.getRect();

  if (
    circleRect(ball.pos.x, ball.pos.y, ball.radius, paddleRect) &&
    ball.vel.y > 0
  ) {
    // Calculate hit position for angle variation
    const hitPosition = paddle.getHitPosition(ball.pos.x);

    // Calculate new angle based on hit position
    const maxAngle = Math.PI / 3; // 60 degrees max
    const angle = hitPosition * maxAngle;

    // Set new velocity maintaining speed
    ball.setVelocityFromAngle(angle);

    // Ensure ball moves upward
    ball.vel.y = -Math.abs(ball.vel.y);

    // Position ball above paddle to prevent sticking
    ball.pos.y = paddleRect.y - ball.radius - 1;
  }
}

/**
 * Handle brick collisions
 */
function handleBrickCollisions() {
  bricks.forEach((brick) => {
    if (!brick.alive) return;

    const brickRect = brick.getRect();

    if (circleRect(ball.pos.x, ball.pos.y, ball.radius, brickRect)) {
      // Destroy brick
      brick.destroy();
      score += brick.points;

      // Calculate collision response
      const ballCenterX = ball.pos.x;
      const ballCenterY = ball.pos.y;
      const brickCenterX = brick.x + brick.w / 2;
      const brickCenterY = brick.y + brick.h / 2;

      // Determine collision side based on ball position relative to brick
      const deltaX = ballCenterX - brickCenterX;
      const deltaY = ballCenterY - brickCenterY;

      // Calculate overlaps
      const overlapX = Math.min(
        brick.x + brick.w - (ballCenterX - ball.radius),
        ballCenterX + ball.radius - brick.x
      );
      const overlapY = Math.min(
        brick.y + brick.h - (ballCenterY - ball.radius),
        ballCenterY + ball.radius - brick.y
      );

      // Reflect based on smallest overlap
      if (overlapX < overlapY) {
        ball.vel.x = -ball.vel.x;
      } else {
        ball.vel.y = -ball.vel.y;
      }
    }
  });
}

/**
 * Lose a life
 */
function loseLife() {
  lives--;

  if (lives <= 0) {
    gameState = "gameOver";
  } else {
    // Reset ball position
    ball.reset(CANVAS_WIDTH / 2, paddle.pos.y - 30);
  }
}

/**
 * Toggle pause
 */
function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
  } else if (gameState === "paused") {
    gameState = "playing";
  }
}

/**
 * Reset game
 */
function resetGame() {
  lives = 3;
  score = 0;
  gameState = "playing";

  // Reset ball and paddle
  ball.reset(CANVAS_WIDTH / 2, paddle.pos.y - 30);
  paddle.pos.x = CANVAS_WIDTH / 2;

  // Reset bricks
  createBricks();
}

/**
 * Render everything
 */
function render() {
  // Clear canvas
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw game objects
  bricks.forEach((brick) => brick.draw(ctx));
  paddle.draw(ctx);
  ball.draw(ctx);

  // Draw UI
  drawUI();

  // Draw game state overlays
  if (gameState === "paused") {
    drawPauseOverlay();
  } else if (gameState === "gameOver") {
    drawGameOverOverlay();
  } else if (gameState === "victory") {
    drawVictoryOverlay();
  }
}

/**
 * Draw UI elements
 */
function drawUI() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px Arial";

  // Score
  ctx.fillText(`Score: ${score}`, 20, 30);

  // Lives
  ctx.fillText(`Lives: ${lives}`, CANVAS_WIDTH - 100, 30);
}

/**
 * Draw pause overlay
 */
function drawPauseOverlay() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#ffffff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  ctx.font = "24px Arial";
  ctx.fillText("Press P to resume", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

  ctx.textAlign = "start";
}

/**
 * Draw game over overlay
 */
function drawGameOverOverlay() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#ff4444";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText("Press R to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

  ctx.textAlign = "start";
}

/**
 * Draw victory overlay
 */
function drawVictoryOverlay() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "#44ff44";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("VICTORY!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText(
    "Press R to play again",
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2 + 50
  );

  ctx.textAlign = "start";
}

// Initialize game when page loads
document.addEventListener("DOMContentLoaded", init);
