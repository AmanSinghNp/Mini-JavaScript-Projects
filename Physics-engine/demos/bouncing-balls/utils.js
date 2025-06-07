/**
 * Optimized Utility Functions for Physics Engine
 * Performance-focused implementations with lookup tables and inline operations
 */

// Lookup tables for common trigonometric operations
const SIN_TABLE = new Float32Array(361);
const COS_TABLE = new Float32Array(361);

// Pre-populate trigonometric lookup tables
for (let i = 0; i <= 360; i++) {
  const rad = (i * Math.PI) / 180;
  SIN_TABLE[i] = Math.sin(rad);
  COS_TABLE[i] = Math.cos(rad);
}

// Pre-calculated conversion constants
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Optimized utility functions using arrow functions for better inlining
 */

// Math utilities - inline for performance
const clamp = (value, min, max) =>
  value < min ? min : value > max ? max : value;
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const lerp = (start, end, t) => start + (end - start) * t;
const map = (value, fromMin, fromMax, toMin, toMax) =>
  toMin + ((value - fromMin) * (toMax - toMin)) / (fromMax - fromMin);

// Angle conversion - inline with pre-calculated constants
const toRadians = (degrees) => degrees * DEG_TO_RAD;
const toDegrees = (radians) => radians * RAD_TO_DEG;

// Fast trigonometric functions using lookup tables
const fastSin = (degrees) => {
  const index = Math.round(degrees) % 360;
  return SIN_TABLE[index < 0 ? index + 360 : index];
};

const fastCos = (degrees) => {
  const index = Math.round(degrees) % 360;
  return COS_TABLE[index < 0 ? index + 360 : index];
};

// Distance calculations - optimized
const distance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

const distanceSquared = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
};

// Fast approximate square root for non-critical calculations
const fastSqrt = (n) => {
  if (n === 0) return 0;
  if (n < 0) return NaN;

  let x = n;
  let y = (x + 1) * 0.5;
  while (y < x) {
    x = y;
    y = (x + n / x) * 0.5;
  }
  return x;
};

// Fast inverse square root (Quake algorithm variant)
const fastInvSqrt = (n) => {
  if (n <= 0) return 0;
  const halfN = n * 0.5;
  let i = new Float32Array([n]);
  let j = new Uint32Array(i.buffer);
  j[0] = 0x5f3759df - (j[0] >> 1);
  let y = new Float32Array(j.buffer)[0];
  y = y * (1.5 - halfN * y * y);
  return y;
};

// Geometric utilities
const pointInCircle = (px, py, cx, cy, radius) => {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
};

const pointInRect = (px, py, x, y, width, height) => {
  return px >= x && px <= x + width && py >= y && py <= y + height;
};

// Color utilities - optimized
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const interpolateColor = (color1, color2, t) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  return rgbToHex(
    Math.round(lerp(c1.r, c2.r, t)),
    Math.round(lerp(c1.g, c2.g, t)),
    Math.round(lerp(c1.b, c2.b, t))
  );
};

// Random color generator with performance optimization
const getRandomColor = () => {
  return (
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
  );
};

// Array utilities - optimized
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const removeFromArray = (array, item) => {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};

// Performance monitoring utilities
const createTimer = () => {
  let startTime = 0;
  return {
    start: () => (startTime = performance.now()),
    end: () => performance.now() - startTime,
    reset: () => (startTime = 0),
  };
};

// Debounce function for performance-critical events
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for high-frequency events
const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Object pooling utility
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.inUse = new Set();

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    this.inUse.forEach((obj) => {
      this.resetFn(obj);
      this.pool.push(obj);
    });
    this.inUse.clear();
  }

  get poolSize() {
    return this.pool.length;
  }

  get inUseCount() {
    return this.inUse.size;
  }
}

// Export all utilities for global use
if (typeof window !== "undefined") {
  // Browser environment
  window.Utils = {
    // Math
    clamp,
    random,
    randomInt,
    lerp,
    map,
    toRadians,
    toDegrees,
    fastSin,
    fastCos,
    distance,
    distanceSquared,
    fastSqrt,
    fastInvSqrt,

    // Geometry
    pointInCircle,
    pointInRect,

    // Colors
    hexToRgb,
    rgbToHex,
    interpolateColor,
    getRandomColor,

    // Arrays
    shuffle,
    removeFromArray,

    // Performance
    createTimer,
    debounce,
    throttle,
    ObjectPool,

    // Constants
    DEG_TO_RAD,
    RAD_TO_DEG,
  };
} else {
  // Node.js environment
  module.exports = {
    clamp,
    random,
    randomInt,
    lerp,
    map,
    toRadians,
    toDegrees,
    fastSin,
    fastCos,
    distance,
    distanceSquared,
    fastSqrt,
    fastInvSqrt,
    pointInCircle,
    pointInRect,
    hexToRgb,
    rgbToHex,
    interpolateColor,
    getRandomColor,
    shuffle,
    removeFromArray,
    createTimer,
    debounce,
    throttle,
    ObjectPool,
    DEG_TO_RAD,
    RAD_TO_DEG,
  };
}
