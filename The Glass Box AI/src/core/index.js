/**
 * @fileoverview Glass Box AI - Public API exports
 * 
 * This is the main entry point for the neural network engine.
 * Import from this file to use the library.
 * 
 * @module glass-box-ai
 * 
 * @example
 * import { Network, Sigmoid, ReLU } from './src/core/index.js';
 * 
 * const network = new Network({
 *   topology: [2, 2, 1],
 *   learningRate: 0.5,
 *   hiddenActivation: Sigmoid,
 *   outputActivation: Sigmoid
 * });
 */

// Core classes
export { Network } from './Network.js';
export { Layer } from './Layer.js';
export { Neuron } from './Neuron.js';

// Activation functions
export { Sigmoid, ReLU, getDerivative } from './activations.js';

// Math utilities
export { dot, addVec, randomInRange, validateNumberArray } from './math.js';
