/**
 * @fileoverview Tests for activation functions
 */

import { describe, it, expect } from 'vitest';
import { Sigmoid, ReLU, getDerivative } from '../src/core/activations.js';

describe('Sigmoid', () => {
  describe('forward', () => {
    it('returns 0.5 for input 0', () => {
      expect(Sigmoid.forward(0)).toBeCloseTo(0.5, 5);
    });

    it('returns value close to 1 for large positive input', () => {
      expect(Sigmoid.forward(10)).toBeCloseTo(1, 4);
    });

    it('returns value close to 0 for large negative input', () => {
      expect(Sigmoid.forward(-10)).toBeCloseTo(0, 4);
    });

    it('is symmetric around 0.5', () => {
      const a = Sigmoid.forward(2);
      const b = Sigmoid.forward(-2);
      expect(a + b).toBeCloseTo(1, 5);
    });
  });

  describe('derivativeFromActivation', () => {
    it('returns 0.25 when a = 0.5', () => {
      // a * (1 - a) = 0.5 * 0.5 = 0.25
      expect(Sigmoid.derivativeFromActivation(0.5)).toBe(0.25);
    });

    it('returns 0 when a = 0', () => {
      expect(Sigmoid.derivativeFromActivation(0)).toBe(0);
    });

    it('returns 0 when a = 1', () => {
      expect(Sigmoid.derivativeFromActivation(1)).toBe(0);
    });

    it('follows a * (1 - a) identity', () => {
      const a = 0.7;
      expect(Sigmoid.derivativeFromActivation(a)).toBeCloseTo(a * (1 - a), 10);
    });
  });
});

describe('ReLU', () => {
  describe('forward', () => {
    it('returns 0 for negative input', () => {
      expect(ReLU.forward(-5)).toBe(0);
      expect(ReLU.forward(-0.1)).toBe(0);
    });

    it('returns same value for positive input', () => {
      expect(ReLU.forward(5)).toBe(5);
      expect(ReLU.forward(0.1)).toBe(0.1);
    });

    it('returns 0 for input 0', () => {
      expect(ReLU.forward(0)).toBe(0);
    });
  });

  describe('derivativeFromZ', () => {
    it('returns 0 for negative z', () => {
      expect(ReLU.derivativeFromZ(-5)).toBe(0);
      expect(ReLU.derivativeFromZ(-0.001)).toBe(0);
    });

    it('returns 1 for positive z', () => {
      expect(ReLU.derivativeFromZ(5)).toBe(1);
      expect(ReLU.derivativeFromZ(0.001)).toBe(1);
    });

    it('returns 0 for z = 0', () => {
      expect(ReLU.derivativeFromZ(0)).toBe(0);
    });
  });
});

describe('getDerivative', () => {
  it('uses derivativeFromActivation for Sigmoid', () => {
    const a = 0.5;
    const z = 0; // doesn't matter for sigmoid
    expect(getDerivative(Sigmoid, z, a)).toBe(Sigmoid.derivativeFromActivation(a));
  });

  it('uses derivativeFromZ for ReLU', () => {
    const z = 1;
    const a = 1; // doesn't matter for relu
    expect(getDerivative(ReLU, z, a)).toBe(ReLU.derivativeFromZ(z));
  });

  it('throws for unknown activation', () => {
    const unknown = { name: 'unknown' };
    expect(() => getDerivative(unknown, 0, 0)).toThrow('Unknown activation function');
  });
});
