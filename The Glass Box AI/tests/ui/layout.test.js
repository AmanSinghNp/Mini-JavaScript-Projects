import { describe, it, expect } from 'vitest';
import { computeLayout } from '../../src/ui/layout.js';

describe('computeLayout', () => {
  it('should return correct number of layers and positions', () => {
    // 2 inputs, 3 hidden, 1 output
    const layerSizes = [2, 3, 1];
    const width = 800;
    const height = 600;
    const padding = 50;

    const positions = computeLayout(layerSizes, width, height, padding);

    // Should have 3 layers
    expect(positions.length).toBe(3);
    
    // Check sizes of each layer
    expect(positions[0].length).toBe(2);
    expect(positions[1].length).toBe(3);
    expect(positions[2].length).toBe(1);
  });

  it('should space layers horizontally', () => {
    const layerSizes = [2, 2];
    const width = 100;
    const height = 100;
    const padding = 10;
    
    // usable width = 80
    // layer 0 should be at padding (10)
    // layer 1 should be at padding + usableWidth (90)
    
    const positions = computeLayout(layerSizes, width, height, padding);
    
    expect(positions[0][0].x).toBe(10);
    expect(positions[1][0].x).toBe(90);
  });

  it('should space neurons vertically', () => {
    const layerSizes = [3];
    const width = 100;
    const height = 100;
    const padding = 10;
    
    // usable height = 80
    // neuron 0 at 10
    // neuron 1 at 10 + 40 = 50
    // neuron 2 at 10 + 80 = 90
    
    const positions = computeLayout(layerSizes, width, height, padding);
    
    expect(positions[0][0].y).toBe(10);
    expect(positions[0][1].y).toBe(50);
    expect(positions[0][2].y).toBe(90);
  });

  it('should center single neuron vertically', () => {
    const layerSizes = [1];
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const positions = computeLayout(layerSizes, width, height, padding);
    
    expect(positions[0][0].y).toBe(50);
  });

  it('should handle edge case of single layer (centered horizontally)', () => {
    const layerSizes = [2];
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const positions = computeLayout(layerSizes, width, height, padding);
    
    // Should be at center X = 50
    expect(positions[0][0].x).toBe(50);
    expect(positions[0][1].x).toBe(50);
  });
});
