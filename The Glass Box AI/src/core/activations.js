/**
 * @fileoverview Activation functions and their derivatives for neural network layers.
 * 
 * Each activation object provides:
 * - `forward(z)`: Compute the activation value from pre-activation z
 * - Derivative function: Compute the gradient for backpropagation
 * 
 * @module activations
 */

/**
 * Sigmoid activation function.
 * 
 * Forward: σ(z) = 1 / (1 + e^(-z))
 * 
 * The sigmoid function squashes any real number into the range (0, 1),
 * making it useful for binary classification outputs.
 * 
 * @type {Object}
 */
export const Sigmoid = {
  name: 'sigmoid',

  /**
   * Compute sigmoid activation.
   * @param {number} z - Pre-activation value (weighted sum + bias)
   * @returns {number} Activation in range (0, 1)
   */
  forward(z) {
    // Clamp z to prevent overflow in exp()
    const clampedZ = Math.max(-500, Math.min(500, z));
    return 1 / (1 + Math.exp(-clampedZ));
  },

  /**
   * Compute sigmoid derivative from the activation value.
   * 
   * Mathematical derivation:
   * σ'(z) = σ(z) * (1 - σ(z)) = a * (1 - a)
   * 
   * This form is efficient because we already have `a` stored from forward pass.
   * 
   * @param {number} a - Activation value (output of forward pass)
   * @returns {number} Derivative value
   */
  derivativeFromActivation(a) {
    return a * (1 - a);
  },
};

/**
 * ReLU (Rectified Linear Unit) activation function.
 * 
 * Forward: ReLU(z) = max(0, z)
 * 
 * ReLU is computationally efficient and helps mitigate the vanishing gradient
 * problem for deep networks. However, it can cause "dead neurons" if z is
 * always negative.
 * 
 * @type {Object}
 */
export const ReLU = {
  name: 'relu',

  /**
   * Compute ReLU activation.
   * @param {number} z - Pre-activation value (weighted sum + bias)
   * @returns {number} max(0, z)
   */
  forward(z) {
    return Math.max(0, z);
  },

  /**
   * Compute ReLU derivative from the pre-activation value.
   * 
   * Mathematical derivation:
   * ReLU'(z) = 1 if z > 0, else 0
   * 
   * Note: For ReLU, we need the original z (not a) because the derivative
   * depends on whether z was positive or negative.
   * 
   * @param {number} z - Pre-activation value
   * @returns {number} 1 if z > 0, else 0
   */
  derivativeFromZ(z) {
    return z > 0 ? 1 : 0;
  },
};

/**
 * Get the derivative value for any activation function.
 * 
 * This helper handles the different derivative interfaces:
 * - Sigmoid uses derivativeFromActivation(a)
 * - ReLU uses derivativeFromZ(z)
 * 
 * @param {Object} activation - Activation function object (Sigmoid or ReLU)
 * @param {number} z - Pre-activation value
 * @param {number} a - Activation value
 * @returns {number} Derivative value
 * @throws {Error} If activation function is not recognized
 */
export function getDerivative(activation, z, a) {
  if (activation.derivativeFromActivation) {
    return activation.derivativeFromActivation(a);
  } else if (activation.derivativeFromZ) {
    return activation.derivativeFromZ(z);
  } else {
    throw new Error(`Unknown activation function: ${activation.name || 'unnamed'}`);
  }
}
