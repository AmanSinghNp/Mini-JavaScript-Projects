import { Network } from './core/Network.js';
import { NetworkRenderer } from './ui/NetworkRenderer.js';
import { TrainerController } from './ui/TrainerController.js';
import { DecisionBoundary } from './ui/DecisionBoundary.js';
import './ui/styles.css';

// DOM Elements
const container = document.getElementById('network-container');
const canvas = document.getElementById('boundary-canvas');
const architectureSelect = document.getElementById('architecture-select');
const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const slLR = document.getElementById('sl-lr');
const valLR = document.getElementById('val-lr');
const slSpeed = document.getElementById('sl-speed');
const valSpeed = document.getElementById('val-speed');
const selProbe = document.getElementById('sel-probe');
const valLoss = document.getElementById('val-loss');

const valProbeInput = document.getElementById('probe-input-val');
const valProbeTarget = document.getElementById('probe-target-val');
const valProbeOutput = document.getElementById('probe-output-val');
const valProbeError = document.getElementById('probe-error-val');

let network;
let renderer;
let trainer;
let boundary;

/**
 * Update Probe Panel UI
 */
function updateProbeUI() {
    if (!trainer) return;
    
    const input = trainer.probeInput;
    // Find target for this input if it exists in dataset
    const sample = trainer.dataset.find(d => d.input[0] === input[0] && d.input[1] === input[1]);
    const target = sample ? sample.target[0] : '?';
    
    // Get current output
    // Note: network state might have changed since last predict, so predict again to be sure
    const output = network.predict(input)[0];
    const error = typeof target === 'number' ? Math.abs(output - target) : 0;

    valProbeInput.textContent = `[${input.join(', ')}]`;
    valProbeTarget.textContent = target;
    valProbeOutput.textContent = output.toFixed(4);
    valProbeError.textContent = error.toFixed(4);
}

/**
 * Initialize a new network, renderer, trainer, and boundary
 */
function init(topology) {
  // Cleanup old instances
  if (trainer) trainer.destroy();
  if (renderer) renderer.destroy();
  if (boundary) boundary.destroy();

  // Create Network
  network = new Network({
    topology: topology,
    learningRate: parseFloat(slLR.value)
  });

  // Create Renderer
  renderer = new NetworkRenderer(network, container);
  renderer.draw();

  // Create Decision Boundary
  boundary = new DecisionBoundary(network, canvas, {
      resolution: 120,
      updateEveryFrames: 5 // smoother than 10
  });
  boundary.render(); // Initial render

  // Create Trainer
  trainer = new TrainerController(network, renderer, {
      learningRate: parseFloat(slLR.value),
      stepsPerFrame: parseInt(slSpeed.value)
  });

  // Setup Trainer callbacks
  trainer.onLossUpdate = (current, avg) => {
      valLoss.textContent = avg.toFixed(4);
  };
  
  trainer.onFrame = (frameCount) => {
      // Update heatmap based on frame count
      boundary.renderIfDue(frameCount);
      
      // Update Probe Stats less frequently to save DOM
      if (frameCount % 5 === 0) {
          updateProbeUI();
      }
  };
  
  // Set initial probe
  const probeParts = selProbe.value.split(',').map(Number);
  trainer.setProbeInput(probeParts);
  updateProbeUI();

  // Reset UI state
  btnToggle.textContent = 'Start';
  valLoss.textContent = '0.000';
  
  console.log('Initialized:', topology);
}

// Event Listeners

// Architecture Change
architectureSelect.addEventListener('change', (e) => {
  const value = e.target.value;
  const topology = value.split(',').map(Number);
  init(topology);
});

// Start/Pause
btnToggle.addEventListener('click', () => {
   if (!trainer) return;
   const isRunning = trainer.toggle();
   btnToggle.textContent = isRunning ? 'Pause' : 'Start';
});

// Reset
btnReset.addEventListener('click', () => {
    const value = architectureSelect.value;
    const topology = value.split(',').map(Number);
    init(topology);
});

// Learning Rate
slLR.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    valLR.textContent = val;
    if (trainer) trainer.setLearningRate(val);
});

// Speed
slSpeed.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    valSpeed.textContent = val;
    if (trainer) trainer.setStepsPerFrame(val);
});

// Probe Input
selProbe.addEventListener('change', (e) => {
    const val = e.target.value.split(',').map(Number);
    if (trainer) {
        trainer.setProbeInput(val);
        updateProbeUI();
    }
});

// Initial Load
init([2, 2, 1]); // Default

