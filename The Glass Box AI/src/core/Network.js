/**
 * @fileoverview Network class orchestrating forward pass, backpropagation, and training.
 * 
 * The Network is the top-level API for the neural network engine.
 * It manages layers and provides methods for prediction and training.
 * 
 * @module Network
 */

import { Layer } from './Layer.js';
import { Sigmoid } from './activations.js';
import { validateNumberArray, random } from './math.js';

/**
 * A feedforward neural network with configurable architecture.
 * 
 * Example: A network with topology [2, 3, 1] has:
 * - 2 input nodes (not a layer, just input size)
 * - 1 hidden layer with 3 neurons
 * - 1 output layer with 1 neuron
 */
export class Network {
  /**
   * Create a new neural network with the specified architecture.
   * 
   * @param {Object} config - Network configuration
   * @param {number[]} config.topology - Array of layer sizes, e.g. [2, 3, 1]
   *   First element is input size, last is output size.
   * @param {number} [config.learningRate=0.5] - Learning rate for gradient descent
   * @param {Object} [config.hiddenActivation=Sigmoid] - Activation for hidden layers
   * @param {Object} [config.outputActivation=Sigmoid] - Activation for output layer
   * @throws {Error} If topology has less than 2 elements
   * @throws {Error} If learningRate is not positive
   * 
   * @example
   * // Create a network for XOR: 2 inputs, 2 hidden neurons, 1 output
   * const net = new Network({
   *   topology: [2, 2, 1],
   *   learningRate: 0.5,
   *   hiddenActivation: Sigmoid,
   *   outputActivation: Sigmoid
   * });
   */
  constructor(config) {
    const {
      topology,
      learningRate = 0.5,
      hiddenActivation = Sigmoid,
      outputActivation = Sigmoid,
    } = config;

    // Validate topology
    if (!Array.isArray(topology) || topology.length < 2) {
      throw new Error(
        'topology must be an array with at least 2 elements (input size and output size)'
      );
    }
    for (let i = 0; i < topology.length; i++) {
      if (!Number.isInteger(topology[i]) || topology[i] < 1) {
        throw new Error(`topology[${i}] must be a positive integer, got ${topology[i]}`);
      }
    }

    // Validate learning rate
    if (typeof learningRate !== 'number' || learningRate <= 0) {
      throw new Error(`learningRate must be positive, got ${learningRate}`);
    }
    if (learningRate > 10) {
      console.warn(`Warning: learningRate ${learningRate} is unusually high, may cause instability`);
    }

    /**
     * Learning rate for gradient descent.
     * @type {number}
     */
    this.learningRate = learningRate;

    /**
     * Network topology (layer sizes).
     * @type {number[]}
     */
    this.topology = topology;

    /**
     * Array of layers (excluding input "layer" which has no neurons).
     * layers[0] is the first hidden layer, layers[layers.length-1] is output.
     * @type {Layer[]}
     */
    this.layers = [];

    // Create layers
    // topology = [inputSize, hidden1Size, hidden2Size, ..., outputSize]
    // We create (topology.length - 1) layers
    for (let l = 1; l < topology.length; l++) {
      const numNeurons = topology[l];
      const numInputs = topology[l - 1];
      const isOutput = l === topology.length - 1;
      const activation = isOutput ? outputActivation : hiddenActivation;

      this.layers.push(new Layer(numNeurons, numInputs, activation));
    }
  }

  /**
   * Get the expected input size.
   * @type {number}
   */
  get inputSize() {
    return this.topology[0];
  }

  /**
   * Get the expected output size.
   * @type {number}
   */
  get outputSize() {
    return this.topology[this.topology.length - 1];
  }

  /**
   * Perform forward pass to get network prediction.
   * 
   * Propagates input through all layers and returns the output.
   * Also updates internal state (z, a) for each neuron.
   * 
   * @param {number[]} inputs - Input vector
   * @returns {number[]} Output vector (predictions)
   * @throws {Error} If input length doesn't match expected size
   */
  predict(inputs) {
    validateNumberArray(inputs, 'inputs');
    
    if (inputs.length !== this.inputSize) {
      throw new Error(
        `Input length ${inputs.length} doesn't match expected ${this.inputSize}`
      );
    }

    let activations = inputs;
    for (const layer of this.layers) {
      activations = layer.forward(activations);
    }

    return activations;
  }

  /**
   * Perform one complete training step on a single sample.
   * 
   * This implements the full backpropagation algorithm:
   * 
   * 1. **Forward pass**: Compute predictions
   * 2. **Compute loss**: MSE = 0.5 * Σ(a - t)²
   * 3. **Backward pass**:
   *    - Output layer: δ = (a - t) * f'(z)
   *    - Hidden layers: δ = (Σ w*δ_next) * f'(z)
   * 4. **Update weights**: w = w - lr * δ * input
   * 
   * @param {number[]} inputs - Training input
   * @param {number[]} targets - Target output
   * @returns {number} MSE loss for this sample
   * @throws {Error} If input or target shapes don't match expected sizes
   * 
   * @example
   * // Train on XOR sample
   * const loss = network.trainStep([1, 0], [1]);
   * console.log(`Loss: ${loss}`);
   */
  trainStep(inputs, targets) {
    validateNumberArray(inputs, 'inputs');
    validateNumberArray(targets, 'targets');

    if (targets.length !== this.outputSize) {
      throw new Error(
        `Target length ${targets.length} doesn't match expected ${this.outputSize}`
      );
    }

    // === FORWARD PASS ===
    const outputs = this.predict(inputs);

    // === COMPUTE LOSS ===
    // MSE: L = 0.5 * Σ(a - t)²
    let loss = 0;
    for (let i = 0; i < outputs.length; i++) {
      const diff = outputs[i] - targets[i];
      loss += 0.5 * diff * diff;
    }

    // === BACKWARD PASS ===
    // Output layer: compute deltas from targets
    const outputLayer = this.layers[this.layers.length - 1];
    outputLayer.computeOutputDeltas(targets);

    // Hidden layers: propagate deltas backward
    for (let l = this.layers.length - 2; l >= 0; l--) {
      this.layers[l].computeHiddenDeltas(this.layers[l + 1]);
    }

    // === UPDATE WEIGHTS ===
    for (const layer of this.layers) {
      layer.applyGradients(this.learningRate);
    }
    
    if (!Number.isFinite(loss)) {
        throw new Error(`Training step produced non-finite loss: ${loss}. Try reducing learning rate.`);
    }

    return loss;
  }

  trainEpoch(dataset) {
    // Determine shuffle using seeded random for reproducibility
    const shuffled = [...dataset];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let totalLoss = 0;
    for (const sample of shuffled) {
      totalLoss += this.trainStep(sample.input, sample.target);
    }
    return totalLoss / dataset.length;
  }
}
