/**
 * @fileoverview Minimal vector math utilities for the neural network engine.
 * 
 * These functions are intentionally simple and readable for educational purposes.
 * Each function includes input validation to catch common errors early.
 * 
 * @module math
 */

/**
 * Compute the dot product of two vectors.
 * 
 * Mathematical definition: dot(a, b) = Σ(a[i] * b[i])
 * 
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Scalar dot product
 * @throws {Error} If vectors have different lengths or contain NaN
 * 
 * @example
 * dot([1, 2, 3], [4, 5, 6]) // returns 32 (1*4 + 2*5 + 3*6)
 */
export function dot(a, b) {
  if (a.length !== b.length) {
    throw new Error(
      `Vector length mismatch in dot product: ${a.length} vs ${b.length}`
    );
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    if (Number.isNaN(a[i]) || Number.isNaN(b[i])) {
      throw new Error(`NaN detected in dot product at index ${i}`);
    }
    sum += a[i] * b[i];
  }

  if (Number.isNaN(sum)) {
    throw new Error('Dot product resulted in NaN');
  }

  return sum;
}

/**
 * Add two vectors element-wise.
 * 
 * Mathematical definition: addVec(a, b) = [a[0]+b[0], a[1]+b[1], ...]
 * 
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number[]} New vector with element-wise sum
 * @throws {Error} If vectors have different lengths
 * 
 * @example
 * addVec([1, 2], [3, 4]) // returns [4, 6]
 */
export function addVec(a, b) {
  if (a.length !== b.length) {
    throw new Error(
      `Vector length mismatch in addVec: ${a.length} vs ${b.length}`
    );
  }

  const result = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i];
  }
  return result;
}

// Initial seed
let currentSeed = Date.now();

/**
 * Set the seed for the random number generator.
 * @param {number} seed 
 */
export function setSeed(seed) {
    currentSeed = seed;
}

/**
 * Generate a random number between 0 and 1 (exclusive of 1).
 * Uses Mulberry32, a fast and high-quality 32-bit PRNG.
 * @returns {number}
 */
export function random() {
    let t = currentSeed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Generate a random number in the specified range.
 * 
 * Used for weight initialization. Default range [-0.5, 0.5] provides
 * symmetric initialization suitable for sigmoid activations.
 * 
 * @param {number} [min=-0.5] - Minimum value (inclusive)
 * @param {number} [max=0.5] - Maximum value (exclusive)
 * @returns {number} Random value in [min, max)
 * 
 * @example
 * randomInRange(-1, 1) // returns value like 0.374 or -0.821
 */
export function randomInRange(min = -0.5, max = 0.5) {
  return min + random() * (max - min);
}

/**
 * Check if a value is a valid finite number (not NaN, not Infinity).
 * 
 * @param {number} value - Value to check
 * @returns {boolean} True if value is a valid finite number
 */
export function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Validate that an array contains only valid numbers.
 * 
 * @param {number[]} arr - Array to validate
 * @param {string} [name='array'] - Name for error messages
 * @throws {Error} If array contains NaN or non-numeric values
 */
export function validateNumberArray(arr, name = 'array') {
  if (!Array.isArray(arr)) {
    throw new Error(`${name} must be an array, got ${typeof arr}`);
  }
  for (let i = 0; i < arr.length; i++) {
    if (!isValidNumber(arr[i])) {
      throw new Error(`${name}[${i}] is not a valid number: ${arr[i]}`);
    }
  }
}
