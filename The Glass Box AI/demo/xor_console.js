/**
 * @fileoverview XOR Console Demo - Demonstrates neural network training
 * 
 * This demo builds a [2, 2, 1] network and trains it to solve the XOR problem.
 * XOR is a classic neural network benchmark that requires at least one hidden layer.
 * 
 * Run with: npm run demo
 * 
 * Expected output:
 * - Loss decreases over epochs
 * - Final predictions close to: [0,0]→0, [0,1]→1, [1,0]→1, [1,1]→0
 */

import { Network, Sigmoid } from '../src/core/index.js';

// XOR training dataset
const XOR_DATA = [
  { input: [0, 0], target: [0] },
  { input: [0, 1], target: [1] },
  { input: [1, 0], target: [1] },
  { input: [1, 1], target: [0] },
];

// Training configuration
const CONFIG = {
  topology: [2, 2, 1],        // 2 inputs, 2 hidden neurons, 1 output
  learningRate: 0.8,           // Learning rate for gradient descent
  maxEpochs: 50000,            // Maximum training epochs
  logInterval: 5000,            // Log loss every N epochs
  targetLoss: 0.01,            // Stop training when loss falls below this
};

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║              Glass Box AI - XOR Training Demo                ║');
console.log('╠══════════════════════════════════════════════════════════════╣');
console.log(`║ Network Architecture: ${CONFIG.topology.join(' → ').padEnd(38)}║`);
console.log(`║ Learning Rate: ${CONFIG.learningRate.toString().padEnd(45)}║`);
console.log(`║ Target Loss: ${CONFIG.targetLoss.toString().padEnd(47)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// Create the network
const network = new Network({
  topology: CONFIG.topology,
  learningRate: CONFIG.learningRate,
  hiddenActivation: Sigmoid,
  outputActivation: Sigmoid,
});

console.log('Training started...\n');

// Training loop
let epoch = 0;
let loss = Infinity;
const startTime = performance.now();

while (epoch < CONFIG.maxEpochs && loss > CONFIG.targetLoss) {
  // Train on all 4 XOR samples (one epoch)
  loss = network.trainEpoch(XOR_DATA);
  epoch++;

  // Log progress periodically
  if (epoch % CONFIG.logInterval === 0 || loss <= CONFIG.targetLoss) {
    console.log(`Epoch ${epoch.toString().padStart(5)}: Loss = ${loss.toFixed(6)}`);
  }
}

const endTime = performance.now();
const trainingTime = ((endTime - startTime) / 1000).toFixed(2);

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║                      Training Complete                       ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`   Epochs: ${epoch}`);
console.log(`   Final Loss: ${loss.toFixed(6)}`);
console.log(`   Training Time: ${trainingTime}s`);
console.log(`   Converged: ${loss <= CONFIG.targetLoss ? '✓ YES' : '✗ NO'}`);

console.log('\n┌──────────────────────────────────────────────────────────────┐');
console.log('│                      Final Predictions                        │');
console.log('├──────────────────────────────────────────────────────────────┤');

for (const sample of XOR_DATA) {
  const prediction = network.predict(sample.input)[0];
  const expected = sample.target[0];
  const error = Math.abs(prediction - expected);
  const status = error < 0.1 ? '✓' : '✗';
  
  console.log(
    `│  [${sample.input.join(', ')}] → ${prediction.toFixed(4).padEnd(8)} ` +
    `(expected: ${expected}) ${status.padStart(2)}                  │`
  );
}

console.log('└──────────────────────────────────────────────────────────────┘');

// Verify convergence criteria
const allPredictions = XOR_DATA.map(s => network.predict(s.input)[0]);
const maxError = Math.max(
  ...XOR_DATA.map((s, i) => Math.abs(allPredictions[i] - s.target[0]))
);

if (loss <= CONFIG.targetLoss && maxError < 0.1) {
  console.log('\n✅ SUCCESS: XOR solved within target tolerances!');
  process.exit(0);
} else {
  console.log('\n⚠️  WARNING: Did not meet all convergence criteria.');
  console.log('   This can happen with unlucky weight initialization.');
  console.log('   Try running the demo again or increasing maxEpochs.');
  process.exit(1);
}
