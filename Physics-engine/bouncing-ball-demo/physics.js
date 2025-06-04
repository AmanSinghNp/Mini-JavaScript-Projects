/**
 * Advanced Physics Engine for Bouncing Ball Demo
 * Implements Velocity Verlet integration, sophisticated force modeling, and improved collision response
 */

/**
 * Enhanced Vector2D class with comprehensive vector operations
 */
class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Add another vector to this vector
   * @param {Vector2D} other - Vector to add
   * @returns {Vector2D} New vector result
   */
  add(other) {
    return new Vector2D(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another vector from this vector
   * @param {Vector2D} other - Vector to subtract
   * @returns {Vector2D} New vector result
   */
  subtract(other) {
    return new Vector2D(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply vector by a scalar
   * @param {number} scalar - Number to multiply by
   * @returns {Vector2D} New vector result
   */
  multiply(scalar) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide vector by a scalar
   * @param {number} scalar - Number to divide by
   * @returns {Vector2D} New vector result
   */
  divide(scalar) {
    if (scalar === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  /**
   * Get the magnitude (length) of the vector
   * @returns {number} Vector magnitude
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Get the squared magnitude (faster than magnitude for comparisons)
   * @returns {number} Squared magnitude
   */
  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize the vector (make it unit length)
   * @returns {Vector2D} Normalized vector
   */
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  /**
   * Get dot product with another vector
   * @param {Vector2D} other - Other vector
   * @returns {number} Dot product
   */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Get cross product with another vector (2D cross product returns scalar)
   * @param {Vector2D} other - Other vector
   * @returns {number} Cross product magnitude
   */
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  /**
   * Get the angle of this vector in radians
   * @returns {number} Angle in radians
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Rotate vector by given angle in radians
   * @param {number} angle - Angle in radians
   * @returns {Vector2D} Rotated vector
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  /**
   * Get perpendicular vector (rotated 90 degrees)
   * @returns {Vector2D} Perpendicular vector
   */
  perpendicular() {
    return new Vector2D(-this.y, this.x);
  }

  /**
   * Linear interpolation to another vector
   * @param {Vector2D} other - Target vector
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Vector2D} Interpolated vector
   */
  lerp(other, t) {
    return this.add(other.subtract(this).multiply(t));
  }

  /**
   * Create a copy of this vector
   * @returns {Vector2D} Copy of the vector
   */
  copy() {
    return new Vector2D(this.x, this.y);
  }

  /**
   * Set this vector's components
   * @param {number} x - X component
   * @param {number} y - Y component
   */
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Check if this vector is approximately equal to another
   * @param {Vector2D} other - Other vector
   * @param {number} epsilon - Tolerance
   * @returns {boolean} True if approximately equal
   */
  equals(other, epsilon = 0.001) {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon
    );
  }
}

/**
 * EXAGGERATED physics constants for dramatic motion and interactions
 */
const PHYSICS = {
  // Basic physics - EXTREME VALUES
  GRAVITY: 20000.5, // Gravitational acceleration (pixels/frame²) - INSANE GRAVITY!
  TIME_STEP: 1 / 60, // Fixed time step for consistent physics (60 FPS)

  // Collision response - SUPER BOUNCY
  BOUNCE_DAMPING: 1.2, // Energy GAIN on boundary bounce (>1 = gaining energy!)
  COLLISION_RESTITUTION: 1.5, // Energy amplification in ball-ball collisions (>1 = explosive!)
  COLLISION_DAMPING: 1.1, // Overall energy multiplication in collisions

  // Environmental forces - MINIMAL RESISTANCE
  AIR_DENSITY: 0.0001, // Extremely low air density (almost no drag)
  DRAG_COEFFICIENT: 0.1, // Very low drag coefficient
  FLOOR_FRICTION: 0.99, // Almost no friction when rolling on floor
  ROLLING_FRICTION: 0.999, // Almost no rolling resistance

  // Numerical integration - AGGRESSIVE
  POSITION_CORRECTION: 1.2, // Aggressive position correction for overlaps
  VELOCITY_THRESHOLD: 0.01, // Very low minimum velocity before rest

  // Stability - HIGH SPEED LIMITS
  MAX_VELOCITY: 50, // Much higher maximum velocity magnitude
  MIN_SEPARATION: 0.01, // Tighter minimum separation distance

  // NEW: Exaggeration factors
  COLLISION_AMPLIFICATION: 2.0, // Amplify collision forces
  CHAOS_FACTOR: 0.1, // Random chaos injection
  ENERGY_INJECTION: 1.05, // Continuous energy injection
};

/**
 * Calculate gravitational force on an object
 * @param {Object} ball - Ball object with mass
 * @returns {Vector2D} Gravitational force vector
 */
function calculateGravityForce(ball) {
  return new Vector2D(0, PHYSICS.GRAVITY * ball.mass);
}

/**
 * Calculate air drag force using quadratic drag equation (but much weaker)
 * @param {Vector2D} velocity - Current velocity
 * @param {number} radius - Object radius for cross-sectional area
 * @returns {Vector2D} Drag force vector
 */
function calculateDragForce(velocity, radius) {
  const speed = velocity.magnitude();
  if (speed === 0) return new Vector2D(0, 0);

  // F_drag = 0.5 * ρ * C_d * A * v² (but much weaker for dramatic effect)
  const crossSectionalArea = Math.PI * radius * radius;
  const dragMagnitude =
    0.5 *
    PHYSICS.AIR_DENSITY *
    PHYSICS.DRAG_COEFFICIENT *
    crossSectionalArea *
    speed *
    speed;

  // Apply drag opposite to velocity direction
  const dragDirection = velocity.normalize().multiply(-1);
  return dragDirection.multiply(dragMagnitude);
}

/**
 * Calculate rolling friction force (minimal for dramatic sliding)
 * @param {Vector2D} velocity - Current velocity
 * @param {number} mass - Object mass
 * @param {boolean} onGround - Whether object is on ground
 * @returns {Vector2D} Rolling friction force
 */
function calculateRollingFriction(velocity, mass, onGround) {
  if (!onGround || velocity.magnitude() < PHYSICS.VELOCITY_THRESHOLD) {
    return new Vector2D(0, 0);
  }

  const frictionMagnitude =
    mass * PHYSICS.GRAVITY * (1 - PHYSICS.ROLLING_FRICTION) * 0.1; // Much weaker
  const frictionDirection = velocity.normalize().multiply(-1);
  return frictionDirection.multiply(frictionMagnitude);
}

/**
 * Inject random chaos for unpredictable motion
 * @param {Object} ball - Ball object
 * @returns {Vector2D} Chaos force vector
 */
function calculateChaosForce(ball) {
  if (Math.random() < 0.02) {
    // 2% chance per frame
    const angle = Math.random() * Math.PI * 2;
    const magnitude =
      (Math.random() - 0.5) * PHYSICS.CHAOS_FACTOR * ball.mass * 100;
    return new Vector2D(Math.cos(angle), Math.sin(angle)).multiply(magnitude);
  }
  return new Vector2D(0, 0);
}

/**
 * Apply all forces to calculate net force on a ball
 * @param {Object} ball - Ball object
 * @param {boolean} onGround - Whether ball is touching ground
 * @returns {Vector2D} Net force vector
 */
function calculateNetForce(ball, onGround = false) {
  let netForce = new Vector2D(0, 0);

  // Skip forces if ball is being dragged
  if (ball.isDragging) {
    return netForce;
  }

  // Gravitational force (EXTREME)
  netForce = netForce.add(calculateGravityForce(ball));

  // Air drag force (minimal)
  const dragForce = calculateDragForce(ball.velocity, ball.radius);
  netForce = netForce.add(dragForce);

  // Rolling friction (minimal when on ground)
  if (onGround) {
    const rollingFriction = calculateRollingFriction(
      ball.velocity,
      ball.mass,
      onGround
    );
    netForce = netForce.add(rollingFriction);
  }

  // Chaos force for unpredictability
  const chaosForce = calculateChaosForce(ball);
  netForce = netForce.add(chaosForce);

  // Energy injection to maintain excitement
  const energyBoost = ball.velocity.multiply(PHYSICS.ENERGY_INJECTION - 1);
  netForce = netForce.add(energyBoost.multiply(ball.mass));

  return netForce;
}

/**
 * Velocity Verlet integration for improved accuracy and stability
 * @param {Object} ball - Ball object to update
 * @param {Object} boundaries - Canvas boundaries
 * @returns {Object} Updated ball state
 */
function integrateMotion(ball, boundaries) {
  if (ball.isDragging) {
    return ball;
  }

  const dt = PHYSICS.TIME_STEP;
  const onGround = ball.position.y + ball.radius >= boundaries.bottom - 5;

  // Store previous acceleration
  const previousAcceleration = ball.acceleration || new Vector2D(0, 0);

  // Calculate current net force and acceleration
  const netForce = calculateNetForce(ball, onGround);
  const currentAcceleration = netForce.divide(ball.mass);

  // Velocity Verlet position update
  // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
  const velocityTerm = ball.velocity.multiply(dt);
  const accelerationTerm = previousAcceleration.multiply(0.5 * dt * dt);
  ball.position = ball.position.add(velocityTerm).add(accelerationTerm);

  // Average acceleration for velocity update
  const averageAcceleration = previousAcceleration
    .add(currentAcceleration)
    .multiply(0.5);

  // Velocity Verlet velocity update
  // v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
  ball.velocity = ball.velocity.add(averageAcceleration.multiply(dt));

  // Store acceleration for next frame
  ball.acceleration = currentAcceleration;

  // Apply velocity limits for stability (but much higher limits)
  const speed = ball.velocity.magnitude();
  if (speed > PHYSICS.MAX_VELOCITY) {
    ball.velocity = ball.velocity.normalize().multiply(PHYSICS.MAX_VELOCITY);
  }

  // Much lower velocity threshold for continuous motion
  if (speed < PHYSICS.VELOCITY_THRESHOLD && onGround) {
    ball.velocity = ball.velocity.multiply(0.999); // Barely any damping
  }

  return ball;
}

/**
 * Enhanced collision detection between two balls
 * @param {Object} ballA - First ball
 * @param {Object} ballB - Second ball
 * @returns {Object|null} Collision info or null if no collision
 */
function detectBallCollision(ballA, ballB) {
  const displacement = ballB.position.subtract(ballA.position);
  const distance = displacement.magnitude();
  const minDistance = ballA.radius + ballB.radius;

  if (distance < minDistance) {
    const normal = distance > 0 ? displacement.normalize() : new Vector2D(1, 0);
    const penetration = minDistance - distance;

    return {
      normal,
      penetration,
      contactPoint: ballA.position.add(normal.multiply(ballA.radius)),
    };
  }

  return null;
}

/**
 * EXPLOSIVE collision response with amplified momentum conservation
 * @param {Object} ballA - First ball
 * @param {Object} ballB - Second ball
 * @param {Object} collision - Collision information
 */
function resolveCollision(ballA, ballB, collision) {
  const { normal, penetration } = collision;

  // Aggressive separation to prevent overlap
  const correctionPercent = PHYSICS.POSITION_CORRECTION;
  const correctionMagnitude =
    (penetration / (ballA.mass + ballB.mass)) * correctionPercent;
  const correction = normal.multiply(correctionMagnitude);

  ballA.position = ballA.position.subtract(correction.multiply(ballB.mass));
  ballB.position = ballB.position.add(correction.multiply(ballA.mass));

  // Calculate relative velocity
  const relativeVelocity = ballA.velocity.subtract(ballB.velocity);
  const velocityAlongNormal = relativeVelocity.dot(normal);

  // Don't resolve if velocities are separating
  if (velocityAlongNormal > 0) return;

  // Calculate EXPLOSIVE collision impulse with amplification
  const restitution = PHYSICS.COLLISION_RESTITUTION;
  const impulseScalar =
    (-(1 + restitution) * velocityAlongNormal) / (ballA.mass + ballB.mass);
  const impulse = normal.multiply(
    impulseScalar * PHYSICS.COLLISION_AMPLIFICATION
  );

  // Apply amplified impulse to velocities
  ballA.velocity = ballA.velocity.add(impulse.multiply(ballB.mass));
  ballB.velocity = ballB.velocity.subtract(impulse.multiply(ballA.mass));

  // Apply energy multiplication instead of damping
  ballA.velocity = ballA.velocity.multiply(PHYSICS.COLLISION_DAMPING);
  ballB.velocity = ballB.velocity.multiply(PHYSICS.COLLISION_DAMPING);

  // Add random collision chaos
  const chaosA = new Vector2D(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  );
  const chaosB = new Vector2D(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  );
  ballA.velocity = ballA.velocity.add(chaosA);
  ballB.velocity = ballB.velocity.add(chaosB);
}

/**
 * Enhanced boundary collision handling with SUPER BOUNCE
 * @param {Object} ball - Ball object
 * @param {Object} boundaries - Canvas boundaries
 * @returns {Object} Updated ball state
 */
function handleBoundaryCollisions(ball, boundaries) {
  let collided = false;

  // Left wall collision - SUPER BOUNCE
  if (ball.position.x - ball.radius <= boundaries.left) {
    ball.position.x = boundaries.left + ball.radius;
    ball.velocity.x = -ball.velocity.x * PHYSICS.BOUNCE_DAMPING;
    collided = true;
  }

  // Right wall collision - SUPER BOUNCE
  if (ball.position.x + ball.radius >= boundaries.right) {
    ball.position.x = boundaries.right - ball.radius;
    ball.velocity.x = -ball.velocity.x * PHYSICS.BOUNCE_DAMPING;
    collided = true;
  }

  // Ceiling collision - SUPER BOUNCE
  if (ball.position.y - ball.radius <= boundaries.top) {
    ball.position.y = boundaries.top + ball.radius;
    ball.velocity.y = -ball.velocity.y * PHYSICS.BOUNCE_DAMPING;
    collided = true;
  }

  // Floor collision - SUPER BOUNCE with minimal friction
  if (ball.position.y + ball.radius >= boundaries.bottom) {
    ball.position.y = boundaries.bottom - ball.radius;
    ball.velocity.y = -ball.velocity.y * PHYSICS.BOUNCE_DAMPING;

    // Minimal floor friction for sliding action
    ball.velocity.x *= PHYSICS.FLOOR_FRICTION;

    // Allow tiny bounces for continuous action
    // No velocity zeroing - keep the action going!

    collided = true;
  }

  // Add collision energy boost
  if (collided) {
    ball.velocity = ball.velocity.multiply(1.02); // 2% energy boost on collision
  }

  return ball;
}

/**
 * Handle collisions between all balls in an array with EXPLOSIVE collision response
 * @param {Array} balls - Array of ball objects
 */
function handleBallCollisions(balls) {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const collision = detectBallCollision(balls[i], balls[j]);
      if (collision) {
        resolveCollision(balls[i], balls[j], collision);
      }
    }
  }
}

/**
 * Update physics for multiple balls using EXTREME integration
 * @param {Array} balls - Array of ball objects
 * @param {Object} boundaries - Canvas boundaries
 */
function updateMultipleBallPhysics(balls, boundaries) {
  // Integrate motion for all balls
  balls.forEach((ball) => {
    integrateMotion(ball, boundaries);
    handleBoundaryCollisions(ball, boundaries);
  });

  // Handle EXPLOSIVE ball-to-ball collisions
  handleBallCollisions(balls);
}

// Legacy function for single ball physics (backwards compatibility)
function updateBallPhysics(ball, boundaries) {
  return handleBoundaryCollisions(
    integrateMotion(ball, boundaries),
    boundaries
  );
}
