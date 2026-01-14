/**
 * @fileoverview Layer class managing neurons and implementing backpropagation.
 * 
 * The Layer class is responsible for:
 * 1. Forward pass: propagate inputs through all neurons
 * 2. Backward pass: compute delta (error gradient) for each neuron
 * 3. Gradient application: update weights and biases
 * 
 * @module Layer
 */

import { Neuron } from './Neuron.js';
import { getDerivative } from './activations.js';
import { validateNumberArray } from './math.js';

/**
 * A layer of neurons in a neural network.
 * 
 * Manages an array of neurons and stores state needed for backpropagation:
 * - `lastInput`: The input vector from the previous layer (or network input)
 * - `lastActivations`: The output vector of this layer after forward pass
 */
export class Layer {
  /**
   * Create a new layer with the specified number of neurons.
   * 
   * @param {number} numNeurons - Number of neurons in this layer
   * @param {number} numInputs - Number of inputs per neuron (size of previous layer)
   * @param {Object} activation - Activation function object (Sigmoid or ReLU)
   * @throws {Error} If numNeurons or numInputs is not a positive integer
   */
  constructor(numNeurons, numInputs, activation) {
    if (!Number.isInteger(numNeurons) || numNeurons < 1) {
      throw new Error(`numNeurons must be a positive integer, got ${numNeurons}`);
    }
    if (!Number.isInteger(numInputs) || numInputs < 1) {
      throw new Error(`numInputs must be a positive integer, got ${numInputs}`);
    }
    if (!activation || typeof activation.forward !== 'function') {
      throw new Error('activation must have a forward() method');
    }

    /**
     * Array of neurons in this layer.
     * @type {Neuron[]}
     */
    this.neurons = new Array(numNeurons);
    for (let i = 0; i < numNeurons; i++) {
      this.neurons[i] = new Neuron(numInputs);
    }

    /**
     * Activation function used by all neurons in this layer.
     * @type {Object}
     */
    this.activation = activation;

    /**
     * Input to this layer during last forward pass.
     * Stored for gradient computation.
     * @type {number[]}
     */
    this.lastInput = [];

    /**
     * Output of this layer during last forward pass.
     * @type {number[]}
     */
    this.lastActivations = [];
  }

  /**
   * Number of neurons in this layer.
   * @type {number}
   */
  get size() {
    return this.neurons.length;
  }

  /**
   * Compute forward pass through all neurons in this layer.
   * 
   * For each neuron j:
   * 1. z_j = dot(weightsIn, inputs) + bias
   * 2. a_j = activation(z_j)
   * 
   * @param {number[]} inputs - Input vector from previous layer
   * @returns {number[]} Output vector of activations
   * @throws {Error} If input shape doesn't match expected size
   */
  forward(inputs) {
    validateNumberArray(inputs, 'inputs');
    
    // Store for gradient computation
    this.lastInput = inputs;

    // Compute activation for each neuron
    this.lastActivations = new Array(this.neurons.length);
    for (let j = 0; j < this.neurons.length; j++) {
      this.lastActivations[j] = this.neurons[j].forward(inputs, this.activation);
    }

    return this.lastActivations;
  }

  /**
   * Compute delta (error gradient) for output layer neurons.
   * 
   * For MSE loss L = 0.5 * Σ(a - t)², the output layer delta is:
   * 
   *   δ_j = (a_j - t_j) * f'(z_j)
   * 
   * Where:
   * - a_j is the neuron's activation (output)
   * - t_j is the target value
   * - f'(z_j) is the activation derivative
   * 
   * Note: The sign is (a - t), NOT (t - a). This works with gradient DESCENT
   * where we update: w = w - lr * gradient
   * 
   * @param {number[]} targets - Target values for each output neuron
   * @throws {Error} If targets length doesn't match number of neurons
   */
  computeOutputDeltas(targets) {
    if (targets.length !== this.neurons.length) {
      throw new Error(
        `Targets length ${targets.length} doesn't match output neurons ${this.neurons.length}`
      );
    }

    for (let j = 0; j < this.neurons.length; j++) {
      const neuron = this.neurons[j];
      const error = neuron.a - targets[j]; // (a - t)
      const derivative = getDerivative(this.activation, neuron.z, neuron.a);
      
      neuron.delta = error * derivative;
    }
  }

  /**
   * Compute delta (error gradient) for hidden layer neurons.
   * 
   * The hidden layer delta is computed using the chain rule:
   * 
   *   δ_i = (Σ_j w_ji * δ_j) * f'(z_i)
   * 
   * Where:
   * - w_ji is the weight from this layer's neuron i to next layer's neuron j
   * - δ_j is the delta of next layer's neuron j
   * - f'(z_i) is the activation derivative for this neuron
   * 
   * This propagates error backwards through the network, hence "backpropagation".
   * 
   * @param {Layer} nextLayer - The layer immediately after this one
   */
  computeHiddenDeltas(nextLayer) {
    for (let i = 0; i < this.neurons.length; i++) {
      const neuron = this.neurons[i];
      
      // Sum weighted deltas from all neurons in next layer
      let sum = 0;
      for (let j = 0; j < nextLayer.neurons.length; j++) {
        const nextNeuron = nextLayer.neurons[j];
        // nextNeuron.weightsIn[i] connects this layer's neuron i to next layer's neuron j
        sum += nextNeuron.weightsIn[i] * nextNeuron.delta;
      }

      const derivative = getDerivative(this.activation, neuron.z, neuron.a);
      neuron.delta = sum * derivative;
    }
  }

  /**
   * Apply gradient descent to update weights and biases.
   * 
   * For each neuron j and each weight k:
   * 
   *   gradient_w = δ_j * input_k
   *   w_jk = w_jk - lr * gradient_w
   *   
   *   gradient_b = δ_j
   *   b_j = b_j - lr * gradient_b
   * 
   * The minus sign implements gradient DESCENT (moving opposite to gradient).
   * 
   * @param {number} learningRate - Step size for gradient descent (typically 0.01 to 1.0)
   * @throws {Error} If learningRate is not a positive number
   */
  applyGradients(learningRate) {
    if (typeof learningRate !== 'number' || learningRate <= 0) {
      throw new Error(`learningRate must be positive, got ${learningRate}`);
    }

    for (let j = 0; j < this.neurons.length; j++) {
      const neuron = this.neurons[j];

      // Update each weight
      for (let k = 0; k < neuron.weightsIn.length; k++) {
        const gradientW = neuron.delta * this.lastInput[k];
        neuron.weightsIn[k] = neuron.weightsIn[k] - learningRate * gradientW;
      }

      // Update bias
      neuron.bias = neuron.bias - learningRate * neuron.delta;
    }
  }
}
