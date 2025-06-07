/**
 * Enhanced 2D Vector Class
 * Comprehensive vector mathematics for physics engine
 *
 * Provides both immutable and mutable operations for performance optimization
 */

export class Vec {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // ===== BASIC IMMUTABLE OPERATIONS =====

  /**
   * Create a copy of this vector
   * @returns {Vec} New vector instance
   */
  clone() {
    return new Vec(this.x, this.y);
  }

  /**
   * Add another vector (immutable)
   * @param {Vec} v - Vector to add
   * @returns {Vec} New vector result
   */
  add(v) {
    return new Vec(this.x + v.x, this.y + v.y);
  }

  /**
   * Subtract another vector (immutable)
   * @param {Vec} v - Vector to subtract
   * @returns {Vec} New vector result
   */
  subtract(v) {
    return new Vec(this.x - v.x, this.y - v.y);
  }

  /**
   * Multiply by scalar (immutable)
   * @param {number} scalar - Scalar value
   * @returns {Vec} New vector result
   */
  multiply(scalar) {
    return new Vec(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide by scalar (immutable)
   * @param {number} scalar - Scalar value
   * @returns {Vec} New vector result
   */
  divide(scalar) {
    if (scalar === 0) throw new Error("Division by zero");
    return new Vec(this.x / scalar, this.y / scalar);
  }

  // ===== MUTABLE OPERATIONS (PERFORMANCE) =====

  /**
   * Set vector components
   * @param {number} x - X component
   * @param {number} y - Y component
   * @returns {Vec} This vector for chaining
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Add another vector (mutable)
   * @param {Vec} v - Vector to add
   * @returns {Vec} This vector for chaining
   */
  addSelf(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtract another vector (mutable)
   * @param {Vec} v - Vector to subtract
   * @returns {Vec} This vector for chaining
   */
  subSelf(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Multiply by scalar (mutable)
   * @param {number} scalar - Scalar value
   * @returns {Vec} This vector for chaining
   */
  mulSelf(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Divide by scalar (mutable)
   * @param {number} scalar - Scalar value
   * @returns {Vec} This vector for chaining
   */
  divSelf(scalar) {
    if (scalar === 0) throw new Error("Division by zero");
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  // ===== ADVANCED VECTOR OPERATIONS =====

  /**
   * Calculate magnitude (length) of vector
   * @returns {number} Vector magnitude
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Calculate squared magnitude (faster than magnitude)
   * @returns {number} Squared magnitude
   */
  magnitudeSquared() {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize vector to unit length (immutable)
   * @returns {Vec} New normalized vector
   */
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vec(0, 0);
    return new Vec(this.x / mag, this.y / mag);
  }

  /**
   * Normalize vector to unit length (mutable)
   * @returns {Vec} This vector for chaining
   */
  normalizeSelf() {
    const mag = this.magnitude();
    if (mag === 0) {
      this.x = 0;
      this.y = 0;
    } else {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }

  /**
   * Calculate dot product with another vector
   * @param {Vec} v - Other vector
   * @returns {number} Dot product
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculate cross product with another vector (2D gives scalar)
   * @param {Vec} v - Other vector
   * @returns {number} Cross product (z-component)
   */
  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  /**
   * Calculate distance to another vector
   * @param {Vec} v - Other vector
   * @returns {number} Distance
   */
  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance to another vector (faster)
   * @param {Vec} v - Other vector
   * @returns {number} Squared distance
   */
  distanceToSquared(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  // ===== GEOMETRIC OPERATIONS =====

  /**
   * Rotate vector by angle (immutable)
   * @param {number} angle - Angle in radians
   * @returns {Vec} New rotated vector
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  /**
   * Rotate vector by angle (mutable)
   * @param {number} angle - Angle in radians
   * @returns {Vec} This vector for chaining
   */
  rotateSelf(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;
    this.x = newX;
    this.y = newY;
    return this;
  }

  /**
   * Get perpendicular vector (90° counter-clockwise)
   * @returns {Vec} Perpendicular vector
   */
  perpendicular() {
    return new Vec(-this.y, this.x);
  }

  /**
   * Get angle of vector in radians
   * @returns {number} Angle in radians
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Linear interpolation between this and another vector
   * @param {Vec} v - Target vector
   * @param {number} t - Interpolation factor (0-1)
   * @returns {Vec} Interpolated vector
   */
  lerp(v, t) {
    return new Vec(this.x + (v.x - this.x) * t, this.y + (v.y - this.y) * t);
  }

  /**
   * Clamp vector magnitude to maximum value
   * @param {number} max - Maximum magnitude
   * @returns {Vec} New clamped vector
   */
  clamp(max) {
    const mag = this.magnitude();
    if (mag > max) {
      return this.normalize().multiply(max);
    }
    return this.clone();
  }

  /**
   * Clamp vector magnitude to maximum value (mutable)
   * @param {number} max - Maximum magnitude
   * @returns {Vec} This vector for chaining
   */
  clampSelf(max) {
    const mag = this.magnitude();
    if (mag > max) {
      this.normalizeSelf().mulSelf(max);
    }
    return this;
  }

  // ===== UTILITY METHODS =====

  /**
   * Check if vector is zero
   * @returns {boolean} True if zero vector
   */
  isZero() {
    return this.x === 0 && this.y === 0;
  }

  /**
   * Check if vectors are equal
   * @param {Vec} v - Other vector
   * @param {number} epsilon - Tolerance for comparison
   * @returns {boolean} True if equal
   */
  equals(v, epsilon = 0.0001) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }

  /**
   * Convert to array
   * @returns {number[]} [x, y] array
   */
  toArray() {
    return [this.x, this.y];
  }

  /**
   * String representation
   * @returns {string} Vector as string
   */
  toString() {
    return `Vec(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  // ===== STATIC FACTORY METHODS =====

  /**
   * Create zero vector
   * @returns {Vec} Zero vector
   */
  static zero() {
    return new Vec(0, 0);
  }

  /**
   * Create unit vector along X axis
   * @returns {Vec} Unit X vector
   */
  static unitX() {
    return new Vec(1, 0);
  }

  /**
   * Create unit vector along Y axis
   * @returns {Vec} Unit Y vector
   */
  static unitY() {
    return new Vec(0, 1);
  }

  /**
   * Create vector from angle and magnitude
   * @param {number} angle - Angle in radians
   * @param {number} magnitude - Vector magnitude
   * @returns {Vec} New vector
   */
  static fromAngle(angle, magnitude = 1) {
    return new Vec(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  /**
   * Create random unit vector
   * @returns {Vec} Random unit vector
   */
  static random() {
    const angle = Math.random() * Math.PI * 2;
    return Vec.fromAngle(angle);
  }

  /**
   * Create random vector within bounds
   * @param {number} minX - Minimum X value
   * @param {number} maxX - Maximum X value
   * @param {number} minY - Minimum Y value
   * @param {number} maxY - Maximum Y value
   * @returns {Vec} Random vector
   */
  static randomBounds(minX, maxX, minY, maxY) {
    return new Vec(
      minX + Math.random() * (maxX - minX),
      minY + Math.random() * (maxY - minY)
    );
  }
}
