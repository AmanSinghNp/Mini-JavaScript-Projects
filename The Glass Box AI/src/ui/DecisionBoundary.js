/**
 * @fileoverview Visualizes the network's decision boundary as a heatmap on a canvas.
 */

export class DecisionBoundary {
  /**
   * @param {Network} network - The neural network instance
   * @param {HTMLCanvasElement} canvas - The canvas to render onto
   * @param {Object} [options] - Configuration options
   * @param {number} [options.resolution=100] - Internal resolution of the heatmap
   * @param {number} [options.updateEveryFrames=10] - Render every N frames
   * @param {boolean} [options.showPoints=true] - Whether to overlay training points
   */
  constructor(network, canvas, options = {}) {
    this.network = network;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true }); // optimize for read/write
    
    this.resolution = options.resolution || 100;
    this.updateEveryFrames = options.updateEveryFrames || 10;
    this.showPoints = options.showPoints !== undefined ? options.showPoints : true;

    // XOR Dataset for visualization
    this.dataset = [
        { input: [0, 0], target: [0] },
        { input: [0, 1], target: [1] },
        { input: [1, 0], target: [1] },
        { input: [1, 1], target: [0] }
    ];

    // Setup canvas resolution
    // We keep internal resolution low for performance, and rely on CSS for scaling
    this.canvas.width = this.resolution;
    this.canvas.height = this.resolution;
  }

  setNetwork(network) {
    this.network = network;
  }

  /**
   * Render only if the frame count determines it's time.
   * @param {number} frameCount 
   */
  renderIfDue(frameCount) {
    if (frameCount % this.updateEveryFrames === 0) {
      this.render();
    }
  }

  /**
   * Perform a full render of the decision boundary.
   */
  render() {
    if (!this.network) return;

    const width = this.resolution;
    const height = this.resolution;
    const imgData = this.ctx.createImageData(width, height);
    const data = imgData.data;

    // 1. Compute Heatmap
    // Iterate over every pixel
    for (let py = 0; py < height; py++) {
      // Inputs are in [0, 1] range. 
      // y corresponds to 2nd input. In canvas, y goes down.
      // Let's map canvas y=0 to input y=1? Or y=0 to input y=0? 
      // Usually plots have (0,0) at bottom-left. 
      // So canvas py=height is y=0, py=0 is y=1.
      const y = 1 - (py / (height - 1));
      
      for (let px = 0; px < width; px++) {
        const x = px / (width - 1);
        
        // Predict
        const output = this.network.predict([x, y])[0];
        
        // Map output to color
        // let's do a simple Blue gradient: White (0) -> Blue (1)
        // or Red (0) -> Blue (1) with White in middle (0.5)? 
        // Let's stick to the prompt suggestion: 0->Light, 1->Blue or similar.
        // Or specific color map: 
        // 0 -> #f8f9fa (Light/White)
        // 1 -> #1a73e8 (Blue)
        
        // Interpolate colors
        // Clean implementation:
        // Output 0: 248, 249, 250
        // Output 1: 26, 115, 232
        
        const r = 248 + (26 - 248) * output;
        const g = 249 + (115 - 249) * output;
        const b = 250 + (232 - 250) * output;
        
        const index = (py * width + px) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255; // Alpha
      }
    }

    this.ctx.putImageData(imgData, 0, 0);

    // 2. Overlay Data Points
    if (this.showPoints) {
      this.drawPoints();
    }
  }

  drawPoints() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    // Config
    const radius = 3; 
    
    this.dataset.forEach(point => {
        // Map input coords to canvas coords
        // x: 0->0, 1->width
        // y: 0->height, 1->0
        
        const cx = point.input[0] * width; // 0 or width
        // Handle edge case for 1.0 being exactly at edge, maybe pad slightly?
        // Actually, let's just draw.
        
        // Correct y-flip
        const cy = (1 - point.input[1]) * height;
        
        // Clamp to ensure visibility at edges (e.g. shift by radius)
        const padX = point.input[0] === 0 ? radius + 2 : (point.input[0] === 1 ? -radius - 2 : 0);
        const padY = point.input[1] === 0 ? -radius - 2 : (point.input[1] === 1 ? radius + 2 : 0);
        
        const px = cx + padX;
        const py = cy + padY;

        this.ctx.beginPath();
        this.ctx.arc(px, py, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = point.target[0] === 1 ? '#1a73e8' : '#fff'; 
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1.5;
        this.ctx.fill();
        this.ctx.stroke();
    });
  }

  destroy() {
    // Canvas context auto-cleans up mostly, 
    // but we can clear refs
    this.network = null;
    this.ctx = null;
  }
}
