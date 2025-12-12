/**
 * Optimized Physics Engine for Bouncing Ball Demo
 * Performance-focused implementation with object pooling and optimized calculations
 */

// Object pool for Vector2D to reduce garbage collection
const vector2DPool = [];
const POOL_SIZE = 100;

// Pre-allocate vectors for the pool
for (let i = 0; i < POOL_SIZE; i++) {
  vector2DPool.push({ x: 0, y: 0, inUse: false });
}

/**
 * Get a vector from the pool
 */
function getVector(x = 0, y = 0) {
  for (let i = 0; i < vector2DPool.length; i++) {
    if (!vector2DPool[i].inUse) {
      vector2DPool[i].x = x;
      vector2DPool[i].y = y;
      vector2DPool[i].inUse = true;
      return vector2DPool[i];
    }
  }
  // Fallback if pool is exhausted
  return { x, y, inUse: true };
}

/**
 * Release a vector back to the pool
 */
function releaseVector(v) {
  if (v && v.inUse) {
    v.inUse = false;
  }
}

/**
 * Optimized Vector2D class with minimal object creation
 */
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // Mutating methods for better performance
  addMut(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtractMut(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiplyMut(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divideMut(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  // Non-mutating methods when needed
  add(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  multiply(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    if (scalar === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  normalizeMut() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  rotateMut(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }

  copyTo(target) {
    target.x = this.x;
    target.y = this.y;
    return target;
  }
}

/**
 * Optimized physics constants for proper bouncing
 */
const PHYSICS = {
  GRAVITY: 400, // Realistic gravity for canvas scale
  TIME_STEP: 1 / 60,
  BOUNCE_DAMPING: 0.85, // FIXED: Must be < 1 to lose energy on wall bounce (was 1.9 which amplified!)
  COLLISION_RESTITUTION: 0.9, // Slightly reduced for more realistic collisions
  COLLISION_DAMPING: 0.99, // Minor damping after collision
  AIR_DENSITY: 0.0002,
  DRAG_COEFFICIENT: 0.02,
  FLOOR_FRICTION: 0.98, // Reasonable floor friction
  ROLLING_FRICTION: 0.999,
  POSITION_CORRECTION: 0.8,
  VELOCITY_THRESHOLD: 0.5, // Threshold for settling
  MAX_VELOCITY: 50,
  MAX_VELOCITY_SQUARED: 2500,
  MIN_SEPARATION: 0.1,
  COLLISION_AMPLIFICATION: 1.0,
  CHAOS_FACTOR: 0.0,
  ENERGY_INJECTION: 1.0,

  // Pre-calculated constants
  HALF_AIR_DENSITY: 0.0001,
  DRAG_CONSTANT: 0.000002,
  PI: Math.PI,
  TWO_PI: Math.PI * 2,
};

// Pre-allocated temporary vectors to avoid creation in hot paths
const temp1 = new Vector2D();
const temp2 = new Vector2D();
const temp3 = new Vector2D();
const netForceTemp = new Vector2D();

/**
 * Optimized force calculations using pre-allocated vectors
 */
function calculateNetForce(ball, onGround = false) {
  // Reset net force
  netForceTemp.set(0, 0);

  if (ball.isDragging) {
    return netForceTemp;
  }

  // Gravity (simplified)
  netForceTemp.y += PHYSICS.GRAVITY * ball.mass;

  // Air drag (optimized)
  const vx = ball.velocity.x;
  const vy = ball.velocity.y;
  const speedSquared = vx * vx + vy * vy;

  if (speedSquared > 1) {
    // Only apply drag at higher speeds for bouncy action
    const speed = Math.sqrt(speedSquared);
    const dragMagnitude =
      PHYSICS.DRAG_CONSTANT * ball.crossSection * speedSquared;
    netForceTemp.x -= (vx / speed) * dragMagnitude * 0.3; // Reduce drag significantly
    netForceTemp.y -= (vy / speed) * dragMagnitude * 0.3;
  }

  // Rolling friction (minimal for bouncy action)
  if (
    onGround &&
    speedSquared > 4 // Only apply at higher speeds
  ) {
    const frictionMagnitude = ball.mass * PHYSICS.GRAVITY * 0.001; // Much lower friction
    const speed = Math.sqrt(speedSquared);
    netForceTemp.x -= (vx / speed) * frictionMagnitude;
  }

  return netForceTemp;
}

/**
 * Optimized Velocity Verlet integration
 */
function integrateMotion(ball, boundaries) {
  if (ball.isDragging) return ball;

  const dt = PHYSICS.TIME_STEP;
  const halfDt = dt * 0.5;
  const dtSquared = dt * dt;
  const onGround = ball.position.y + ball.radius >= boundaries.bottom - 5;

  // Pre-calculate cross section if not exists
  if (!ball.crossSection) {
    ball.crossSection = PHYSICS.PI * ball.radius * ball.radius;
  }

  // Initialize acceleration if needed
  if (!ball.acceleration) {
    ball.acceleration = new Vector2D(0, 0);
  }

  // Store previous acceleration
  const ax = ball.acceleration.x;
  const ay = ball.acceleration.y;

  // Calculate forces and new acceleration
  const force = calculateNetForce(ball, onGround);
  ball.acceleration.x = force.x / ball.mass;
  ball.acceleration.y = force.y / ball.mass;

  // Update position (Velocity Verlet)
  ball.position.x += ball.velocity.x * dt + ax * halfDt * dt;
  ball.position.y += ball.velocity.y * dt + ay * halfDt * dt;

  // Update velocity
  ball.velocity.x += (ax + ball.acceleration.x) * halfDt;
  ball.velocity.y += (ay + ball.acceleration.y) * halfDt;

  // Velocity limiting (optimized)
  const speedSquared =
    ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y;
  if (speedSquared > PHYSICS.MAX_VELOCITY_SQUARED) {
    const scale = PHYSICS.MAX_VELOCITY / Math.sqrt(speedSquared);
    ball.velocity.x *= scale;
    ball.velocity.y *= scale;
  }

  // Minimal damping when on ground
  if (
    speedSquared < PHYSICS.VELOCITY_THRESHOLD * PHYSICS.VELOCITY_THRESHOLD &&
    onGround
  ) {
    ball.velocity.x *= 0.999;
    ball.velocity.y *= 0.999;
  }

  return ball;
}

/**
 * Optimized collision detection
 */
function detectBallCollision(ballA, ballB) {
  const dx = ballB.position.x - ballA.position.x;
  const dy = ballB.position.y - ballA.position.y;
  const distanceSquared = dx * dx + dy * dy;
  const minDistance = ballA.radius + ballB.radius;
  const minDistanceSquared = minDistance * minDistance;

  if (distanceSquared < minDistanceSquared) {
    const distance = Math.sqrt(distanceSquared);
    const invDistance = distance > 0 ? 1 / distance : 1;

    return {
      normalX: dx * invDistance,
      normalY: dy * invDistance,
      penetration: minDistance - distance,
      distance: distance,
    };
  }

  return null;
}

/**
 * Optimized collision resolution
 */
function resolveCollision(ballA, ballB, collision) {
  const { normalX, normalY, penetration } = collision;

  // Position correction
  const totalMass = ballA.mass + ballB.mass;
  const correctionMagnitude =
    (penetration / totalMass) * PHYSICS.POSITION_CORRECTION;
  const correctionX = normalX * correctionMagnitude;
  const correctionY = normalY * correctionMagnitude;

  ballA.position.x -= correctionX * ballB.mass;
  ballA.position.y -= correctionY * ballB.mass;
  ballB.position.x += correctionX * ballA.mass;
  ballB.position.y += correctionY * ballA.mass;

  // Relative velocity
  const rvx = ballA.velocity.x - ballB.velocity.x;
  const rvy = ballA.velocity.y - ballB.velocity.y;
  const velocityAlongNormal = rvx * normalX + rvy * normalY;

  if (velocityAlongNormal > 0) return;

  // Impulse calculation - FIXED: Use correct formula with inverse mass sum
  const restitution = PHYSICS.COLLISION_RESTITUTION;
  const invMassSum = 1 / ballA.mass + 1 / ballB.mass;
  const impulseScalar = (-(1 + restitution) * velocityAlongNormal) / invMassSum;
  const impulseX = normalX * impulseScalar;
  const impulseY = normalY * impulseScalar;

  // Apply impulse - FIXED: Divide by each ball's own mass (not multiply by other's mass)
  ballA.velocity.x += impulseX / ballA.mass;
  ballA.velocity.y += impulseY / ballA.mass;
  ballB.velocity.x -= impulseX / ballB.mass;
  ballB.velocity.y -= impulseY / ballB.mass;

  // Damping
  ballA.velocity.x *= PHYSICS.COLLISION_DAMPING;
  ballA.velocity.y *= PHYSICS.COLLISION_DAMPING;
  ballB.velocity.x *= PHYSICS.COLLISION_DAMPING;
  ballB.velocity.y *= PHYSICS.COLLISION_DAMPING;
}

/**
 * Optimized boundary collision handling
 */
function handleBoundaryCollisions(ball, boundaries) {
  const radius = ball.radius;
  const damping = PHYSICS.BOUNCE_DAMPING;

  // Left wall
  if (ball.position.x <= boundaries.left + radius) {
    ball.position.x = boundaries.left + radius;
    ball.velocity.x = -ball.velocity.x * damping;
  }
  // Right wall
  else if (ball.position.x >= boundaries.right - radius) {
    ball.position.x = boundaries.right - radius;
    ball.velocity.x = -ball.velocity.x * damping;
  }

  // Ceiling
  if (ball.position.y <= boundaries.top + radius) {
    ball.position.y = boundaries.top + radius;
    ball.velocity.y = -ball.velocity.y * damping;
  }
  // Floor
  else if (ball.position.y >= boundaries.bottom - radius) {
    ball.position.y = boundaries.bottom - radius;
    ball.velocity.y = -ball.velocity.y * damping;
    ball.velocity.x *= PHYSICS.FLOOR_FRICTION;
  }

  return ball;
}

/**
 * Spatial partitioning for collision detection optimization
 */
class SpatialGrid {
  constructor(width, height, cellSize) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Array(this.cols * this.rows);
    this.clear();
  }

  clear() {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = [];
    }
  }

  getIndex(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return -1;
    }
    return row * this.cols + col;
  }

  insert(ball) {
    const minX = Math.floor((ball.position.x - ball.radius) / this.cellSize);
    const maxX = Math.floor((ball.position.x + ball.radius) / this.cellSize);
    const minY = Math.floor((ball.position.y - ball.radius) / this.cellSize);
    const maxY = Math.floor((ball.position.y + ball.radius) / this.cellSize);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const idx = this.getIndex(x * this.cellSize, y * this.cellSize);
        if (idx >= 0 && idx < this.grid.length) {
          this.grid[idx].push(ball);
        }
      }
    }
  }

  getPotentialCollisions(ball) {
    const nearby = new Set();
    const minX = Math.floor((ball.position.x - ball.radius) / this.cellSize);
    const maxX = Math.floor((ball.position.x + ball.radius) / this.cellSize);
    const minY = Math.floor((ball.position.y - ball.radius) / this.cellSize);
    const maxY = Math.floor((ball.position.y + ball.radius) / this.cellSize);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const idx = this.getIndex(x * this.cellSize, y * this.cellSize);
        if (idx >= 0 && idx < this.grid.length) {
          this.grid[idx].forEach((b) => nearby.add(b));
        }
      }
    }

    nearby.delete(ball);
    return Array.from(nearby);
  }
}

// Global spatial grid (initialize based on canvas size)
let spatialGrid = null;

/**
 * Optimized collision detection with spatial partitioning
 */
function handleBallCollisions(balls, boundaries) {
  if (balls.length < 2) return;

  // Initialize spatial grid if needed
  if (!spatialGrid) {
    const maxRadius = Math.max(...balls.map((b) => b.radius));
    spatialGrid = new SpatialGrid(
      boundaries.right - boundaries.left,
      boundaries.bottom - boundaries.top,
      maxRadius * 4
    );
  }

  // Use spatial partitioning for many balls
  if (balls.length > 10) {
    spatialGrid.clear();
    balls.forEach((ball) => spatialGrid.insert(ball));

    for (let i = 0; i < balls.length; i++) {
      const ballA = balls[i];
      const nearby = spatialGrid.getPotentialCollisions(ballA);

      for (const ballB of nearby) {
        if (ballA.id < ballB.id) {
          // Avoid duplicate checks
          const collision = detectBallCollision(ballA, ballB);
          if (collision) {
            resolveCollision(ballA, ballB, collision);
          }
        }
      }
    }
  } else {
    // Brute force for small numbers
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const collision = detectBallCollision(balls[i], balls[j]);
        if (collision) {
          resolveCollision(balls[i], balls[j], collision);
        }
      }
    }
  }
}

/**
 * Main physics update with optimizations
 */
function updateMultipleBallPhysics(balls, boundaries) {
  // Ensure balls have IDs for spatial partitioning
  balls.forEach((ball, i) => {
    if (!ball.id) ball.id = i;
  });

  // Update physics
  for (let i = 0; i < balls.length; i++) {
    integrateMotion(balls[i], boundaries);
    handleBoundaryCollisions(balls[i], boundaries);
  }

  // Handle collisions
  handleBallCollisions(balls, boundaries);
}

// Legacy function for single ball physics (backwards compatibility)
function updateBallPhysics(ball, boundaries) {
  return handleBoundaryCollisions(
    integrateMotion(ball, boundaries),
    boundaries
  );
}
