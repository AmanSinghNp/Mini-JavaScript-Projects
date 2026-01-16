import { computeLayout } from './layout.js';

/**
 * Visualizes a Neural Network instance using a hybrid HTML/SVG approach.
 * Neurons are interactive HTML elements; connections are SVG lines.
 */
export class NetworkRenderer {
  /**
   * @param {Network} network - The network instance to visualize
   * @param {HTMLElement} containerElement - The DOM element to render into
   * @param {Object} [options] - Configuration options
   * @param {number} [options.padding=40] - Padding around the diagram
   */
  constructor(network, containerElement, options = {}) {
    this.network = network;
    this.container = containerElement;
    this.options = { 
      padding: 40,
      ...options 
    };

    // Internal state
    this.nodeElements = [];
    this.lineElements = [];
    this.positions = [];
    
    // Resize observer to handle window resizing
    this.resizeObserver = new ResizeObserver(() => {
        this.draw();
    });
    this.resizeObserver.observe(this.container);
  }

  /**
   * Determine the sizes of all layers including the implicit input layer.
   * @returns {number[]} Array of layer sizes
   */
  getLayerSizes() {
    // 1. Infer input size from the first hidden layer's weights
    // Network has layers[0] as the first hidden layer.
    // layers[0].neurons[0].weightsIn.length is the input size.
    if (!this.network.layers || this.network.layers.length === 0) {
      return [];
    }

    const firstHiddenLayer = this.network.layers[0];
    const inputSize = firstHiddenLayer.neurons[0].weightsIn.length;

    // 2. Get sizes of all other layers
    const hiddenAndOutputSizes = this.network.layers.map(layer => layer.neurons.length);

    // 3. Combine
    return [inputSize, ...hiddenAndOutputSizes];
  }

  /**
   * Compute positions for all neurons.
   */
  layout() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    // Avoid drawing if container has no size (e.g. hidden), or very small
    if (width === 0 || height === 0) return;

    const layerSizes = this.getLayerSizes();
    this.positions = computeLayout(layerSizes, width, height, this.options.padding);
  }

  /**
   * Main render loop.
   * 1. Clear container.
   * 2. Compute Layout.
   * 3. Draw Lines (SVG).
   * 4. Draw Nodes (HTML).
   */
  draw() {
    // Clear previous render
    this.container.innerHTML = '';
    this.nodeElements = [];
    this.lineElements = []; // Clear old references

    // Safety check
    if (!this.network) return;

    // Compute layout
    this.layout();
    if (!this.positions || this.positions.length === 0) return;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'glass-box-network';
    this.container.appendChild(wrapper);

    // 1. SVG Layer for connections
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "network-svg-layer");
    wrapper.appendChild(svg);

    // 2. HTML Layer for nodes
    const nodeLayer = document.createElement('div');
    nodeLayer.className = 'network-node-layer';
    wrapper.appendChild(nodeLayer);

    // Draw Lines
    this.network.layers.forEach((layer, layerIndex) => {
        const prevLayoutIndex = layerIndex;
        const currLayoutIndex = layerIndex + 1;
        
        const prevPositions = this.positions[prevLayoutIndex];
        const currPositions = this.positions[currLayoutIndex];

        layer.neurons.forEach((neuron, neuronIndex) => {
             const targetPos = currPositions[neuronIndex];
             
             neuron.weightsIn.forEach((weight, inputIndex) => {
                 const sourcePos = prevPositions[inputIndex];
                 
                 const line = document.createElementNS(svgNS, "line");
                 line.setAttribute("x1", sourcePos.x);
                 line.setAttribute("y1", sourcePos.y);
                 line.setAttribute("x2", targetPos.x);
                 line.setAttribute("y2", targetPos.y);
                 line.setAttribute("class", "connection-line");
                 
                 const title = document.createElementNS(svgNS, "title");
                 title.textContent = ""; // Will be updated
                 line.appendChild(title);
                 
                 svg.appendChild(line);

                 // Store reference to line and the specific weight it represents
                 this.lineElements.push({
                     element: line,
                     titleElement: title,
                     neuron: neuron,
                     weightIndex: inputIndex,
                     layerIndex: layerIndex
                 });
             });
        });
    });

    // Draw Nodes
    this.positions.forEach((layerPositions, lIndex) => {
        layerPositions.forEach((pos, nIndex) => {
            const node = document.createElement('div');
            node.className = 'neuron';
            node.style.left = `${pos.x}px`;
            node.style.top = `${pos.y}px`;
            
            node.title = `Layer ${lIndex}, Neuron ${nIndex}`;
            
            nodeLayer.appendChild(node);
            
            // Store reference
            this.nodeElements.push({
                element: node,
                layerIndex: lIndex,
                neuronIndex: nIndex
            });
        });
    });

    // Initial visual update
    this.updateVisuals();
  }

  /**
   * Update visuals (colors, opacity, width) based on current network state.
   * Efficiently updates attributes without DOM recreation.
   * 
   * @param {Object} [options]
   * @param {number[]} [options.input] - Current input value to display on input nodes
   */
  updateVisuals(options = {}) {
    if (!this.network) return;

    // 1. Update Connection Lines (Weights)
    const maxWeight = 3.0; // Scale factor for weight visualization
    
    this.lineElements.forEach(item => {
        const weight = item.neuron.weightsIn[item.weightIndex];
        const line = item.element;
        
        // Color: Green for positive, Red for negative
        // HSL: Green ~120, Red ~0
        const hue = weight >= 0 ? 120 : 0;
        
        // Opacity/Saturation based on magnitude
        const magnitude = Math.min(Math.abs(weight) / maxWeight, 1.0);
        
        // Stroke width
        const minWidth = 1;
        const maxWidth = 4;
        const width = minWidth + (maxWidth - minWidth) * magnitude;
        
        // Opacity
        const minOpacity = 0.2;
        const maxOpacity = 1.0;
        const opacity = minOpacity + (maxOpacity - minOpacity) * magnitude;

        line.style.stroke = `hsla(${hue}, 70%, 50%, ${opacity})`;
        line.setAttribute("stroke-width", width);
        
        // Update tooltip
        item.titleElement.textContent = `Weight: ${weight.toFixed(4)}`;
    });

    // 2. Update Nodes (Activations)
    // Map existing node elements to network state
    // We stored indices in nodeElements: { element, layerIndex, neuronIndex }
    
    // Flatten input vector matching layout layer 0
    const inputs = options.input || [];

    this.nodeElements.forEach(item => {
        const { element, layerIndex, neuronIndex } = item;
        
        let activation = 0;
        let diff = 0; // For later bias viz if needed

        if (layerIndex === 0) {
            // Input Layer
            activation = inputs[neuronIndex] !== undefined ? inputs[neuronIndex] : 0;
            // Show input value text?
            element.textContent = activation.toFixed(1);
            // Input nodes usually just opaque
            element.style.opacity = 1.0;
            element.style.backgroundColor = `rgba(255, 255, 255, ${0.5 + 0.5 * activation})`;
        } else {
            // Hidden/Output Layers
            const netLayerIndex = layerIndex - 1; // Network layers start at 0
            if (this.network.layers[netLayerIndex]) {
                const neuron = this.network.layers[netLayerIndex].neurons[neuronIndex];
                activation = neuron.a;
                
                // Visual clamp for display (ReLU can go > 1, but we clamp opacity)
                const visAlpha = Math.max(0, Math.min(1, activation));
                
                // Set opacity or background brightness
                // Let's use opacity of the fill color
                // White fill, but opacity changes? Or background darkness?
                // Let's go with: Bright White = Active, Dark = Inactive
                const intensity = Math.floor(visAlpha * 255);
                element.style.backgroundColor = `rgb(${intensity}, ${intensity}, ${intensity})`;
                
                // Text could be 'a' value
                // For small nodes, maybe just tooltip?
                // element.textContent = activation.toFixed(2);
                
                // Let's use border color for bias? Or just simple activation for now.
                // Text inside:
                element.textContent = activation.toFixed(2);
                
                // Fix text color for contrast
                element.style.color = visAlpha > 0.5 ? '#000' : '#888';
            }
        }
    });
  }

  /**
   * Cleanup
   */
  destroy() {
    this.resizeObserver.disconnect();
    this.container.innerHTML = '';
  }
}
