/**
 * Computes the x,y coordinates for every neuron in the network.
 * 
 * Strategy:
 * - Even horizontal spacing for layers.
 * - Even vertical spacing for neurons within a layer.
 * 
 * @param {number[]} layerSizes - Array of neuron counts per layer (including input)
 * @param {number} width - Container width in pixels
 * @param {number} height - Container height in pixels
 * @param {number} padding - Padding in pixels around the diagram
 * @returns {Array<Array<{x: number, y: number}>>} positions[layerIndex][neuronIndex]
 */
export function computeLayout(layerSizes, width, height, padding = 40) {
  const positions = [];
  const usableWidth = width - 2 * padding;
  const usableHeight = height - 2 * padding;

  // Horizontal spacing
  // If only 1 layer (unlikely for net, but possible for single input), center it? 
  // Normally at least 2 layers.
  // x = padding + (layerIndex / (numLayers - 1)) * usableWidth
  const numLayers = layerSizes.length;
  
  for (let l = 0; l < numLayers; l++) {
    const layerPositions = [];
    const numNeurons = layerSizes[l];
    
    // Calculate X
    // Edge case: if numLayers === 1, place in center
    let x;
    if (numLayers > 1) {
      x = padding + (l / (numLayers - 1)) * usableWidth;
    } else {
      x = width / 2;
    }

    // Calculate Y for each neuron
    // y = padding + (neuronIndex / (numNeurons - 1)) * usableHeight
    // If 1 neuron, place in middle
    for (let n = 0; n < numNeurons; n++) {
      let y;
      if (numNeurons > 1) {
        y = padding + (n / (numNeurons - 1)) * usableHeight;
      } else {
        y = height / 2;
      }
      layerPositions.push({ x, y });
    }
    
    positions.push(layerPositions);
  }

  return positions;
}
