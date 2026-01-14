/**
 * @fileoverview Neuron class representing a single computational unit in the network.
 * 
 * Each neuron stores its incoming weights and maintains state for backpropagation.
 * The neuron is intentionally "dumb" - it computes forward pass only.
 * Weight updates are handled by the Layer class for cleaner separation of concerns.
 * 
 * @module Neuron
 */

import { dot, randomInRange, isValidNumber } from './math.js';

/**
 * A single neuron in a neural network layer.
 * 
 * Stores:
 * - `weightsIn`: Array of incoming connection weights from previous layer
 * - `bias`: Bias term added before activation
 * - `z`: Pre-activation value (weighted sum + bias) - stored for backprop
 * - `a`: Activation value (output after activation function) - stored for backprop
 * - `delta`: Error gradient δ = dLoss/dz - computed during backward pass
 */
export class Neuron {
  /**
   * Create a new neuron with random weight initialization.
   * 
   * @param {number} numInputs - Number of inputs from previous layer
   * @param {number} [weightMin=-0.5] - Minimum initial weight value
   * @param {number} [weightMax=0.5] - Maximum initial weight value
   * @throws {Error} If numInputs is not a positive integer
   */
  constructor(numInputs, weightMin = -1, weightMax = 1) {
    if (!Number.isInteger(numInputs) || numInputs < 1) {
      throw new Error(`numInputs must be a positive integer, got ${numInputs}`);
    }

    /**
     * Incoming weights from previous layer neurons.
     * weightsIn[k] = weight from previous layer neuron k to this neuron.
     * @type {number[]}
     */
    this.weightsIn = new Array(numInputs);
    for (let i = 0; i < numInputs; i++) {
      this.weightsIn[i] = randomInRange(weightMin, weightMax);
    }

    /**
     * Bias term, added to weighted sum before activation.
     * @type {number}
     */
    this.bias = randomInRange(weightMin, weightMax);

    /**
     * Pre-activation value: z = dot(weightsIn, inputs) + bias.
     * Stored during forward pass for use in backpropagation.
     * @type {number}
     */
    this.z = 0;

    /**
     * Activation value: a = activation(z).
     * This is the neuron's output, stored for backpropagation.
     * @type {number}
     */
    this.a = 0;

    /**
     * Error gradient: δ = dLoss/dz.
     * Computed during backward pass, used for weight updates.
     * @type {number}
     */
    this.delta = 0;
  }

  /**
   * Compute the forward pass for this neuron.
   * 
   * Computes:
   * 1. z = dot(weightsIn, inputs) + bias  (pre-activation)
   * 2. a = activation.forward(z)          (activation)
   * 
   * Both `z` and `a` are stored internally for later use in backpropagation.
   * 
   * @param {number[]} inputs - Input values from previous layer
   * @param {Object} activation - Activation function object with forward() method
   * @returns {number} The activation value `a`
   * @throws {Error} If input length doesn't match weights length
   * @throws {Error} If forward pass produces NaN
   * 
   * @example
   * const neuron = new Neuron(2);
   * const output = neuron.forward([0.5, 0.8], Sigmoid);
   */
  forward(inputs, activation) {
    if (inputs.length !== this.weightsIn.length) {
      throw new Error(
        `Input length ${inputs.length} doesn't match expected ${this.weightsIn.length}`
      );
    }

    // Compute pre-activation: z = Σ(w_k * x_k) + b
    this.z = dot(this.weightsIn, inputs) + this.bias;

    // Apply activation function
    this.a = activation.forward(this.z);

    // Sanity check for numerical stability
    if (!isValidNumber(this.a)) {
      throw new Error(
        `Forward pass produced invalid activation: z=${this.z}, a=${this.a}`
      );
    }

    return this.a;
  }
}
