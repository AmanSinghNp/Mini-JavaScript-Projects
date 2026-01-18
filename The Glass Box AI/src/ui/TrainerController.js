/**
 * @fileoverview Manages the training loop and UI coordination.
 */

export class TrainerController {
  /**
   * @param {Network} network - The neural network instance
   * @param {NetworkRenderer} renderer - The renderer instance
   * @param {Object} [options] - Configuration options
   * @param {number} [options.learningRate=0.1] - Initial learning rate
   * @param {number} [options.stepsPerFrame=50] - Training steps per animation frame
   */
  constructor(network, renderer, options = {}) {
    this.network = network;
    this.renderer = renderer;
    
    // Training state
    this.isRunning = false;
    this.stepsPerFrame = options.stepsPerFrame || 50;
    this.learningRate = options.learningRate || 0.1;
    this.lossStats = {
      current: 0,
      history: [], // Running average buffer
      avg: 0
    };
    
    // Default probe input (can be changed by UI)
    this.probeInput = [0, 0];
    
    // Dataset: XOR problem
    this.dataset = [
      { input: [0, 0], target: [0] },
      { input: [0, 1], target: [1] },
      { input: [1, 0], target: [1] },
      { input: [1, 1], target: [0] }
    ];

    // Bind loop to preserve 'this'
    this.loop = this.loop.bind(this);
    this.animationFrameId = null;
    this.frameCount = 0;

    // Callbacks for UI updates
    this.onLossUpdate = null; // function(currentLoss, avgLoss)
    this.onFrame = null; // function(frameCount)
  }

  /**
   * Start the training loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.network.learningRate = this.learningRate;
    this.loop();
  }

  /**
   * Pause the training loop
   */
  pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Toggle start/pause
   */
  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
    return this.isRunning;
  }

  setLearningRate(value) {
    this.learningRate = value;
    // Update network immediately if we can
    if (this.network) {
      this.network.learningRate = this.learningRate;
    }
  }

  setStepsPerFrame(value) {
    this.stepsPerFrame = value;
  }

  setProbeInput(inputVector) {
    this.probeInput = inputVector;
    // Immediate visual update if paused
    if (!this.isRunning) {
      this.network.predict(this.probeInput);
      this.renderer.updateVisuals({ input: this.probeInput });
    }
  }

  /**
   * One animation frame
   */
  loop() {
    if (!this.isRunning) return;

    // 1. Train Batch
    let totalFrameLoss = 0;
    for (let i = 0; i < this.stepsPerFrame; i++) {
      // Pick random sample
      const sample = this.dataset[Math.floor(Math.random() * this.dataset.length)];
      const loss = this.network.trainStep(sample.input, sample.target);
      totalFrameLoss += loss;
    }
    
    // Update stats
    const avgFrameLoss = totalFrameLoss / this.stepsPerFrame;
    this.updateLossStats(avgFrameLoss);

    // 2. Forward pass for Probe (to set activations for visualization)
    this.network.predict(this.probeInput);

    // 3. Update Visuals
    // Pass current input so renderer can show it on input nodes
    this.renderer.updateVisuals({ input: this.probeInput });

    // 4. Update UI
    if (this.onLossUpdate) {
      this.onLossUpdate(avgFrameLoss, this.lossStats.avg);
    }

    // 5. Frame Callback (e.g. for heatmap)
    this.frameCount++;
    if (this.onFrame) {
        this.onFrame(this.frameCount);
    }

    // 6. Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  updateLossStats(newLoss) {
    this.lossStats.current = newLoss;
    
    // Simple exponential moving average for smoothness
    const alpha = 0.05;
    if (this.lossStats.avg === 0) {
        this.lossStats.avg = newLoss;
    } else {
        this.lossStats.avg = (alpha * newLoss) + ((1 - alpha) * this.lossStats.avg);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.pause();
    this.network = null;
    this.renderer = null;
  }
}
