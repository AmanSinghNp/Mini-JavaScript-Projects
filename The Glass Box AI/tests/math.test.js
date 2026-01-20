/**
 * @fileoverview Tests for math utilities
 */

import { describe, it, expect } from 'vitest';
import { dot, addVec, randomInRange, validateNumberArray } from '../src/core/math.js';

describe('dot', () => {
  it('computes dot product of two vectors', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32); // 1*4 + 2*5 + 3*6 = 32
  });

  it('handles zero vectors', () => {
    expect(dot([0, 0, 0], [1, 2, 3])).toBe(0);
  });

  it('handles negative values', () => {
    expect(dot([1, -1], [1, 1])).toBe(0); // 1*1 + (-1)*1 = 0
  });

  it('throws on length mismatch', () => {
    expect(() => dot([1, 2], [1, 2, 3])).toThrow('Vector length mismatch');
  });

  it('throws on NaN values', () => {
    expect(() => dot([1, NaN], [1, 2])).toThrow('NaN detected');
  });
});

describe('addVec', () => {
  it('adds two vectors element-wise', () => {
    expect(addVec([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9]);
  });

  it('handles zero vectors', () => {
    expect(addVec([0, 0], [1, 2])).toEqual([1, 2]);
  });

  it('handles negative values', () => {
    expect(addVec([1, -1], [-1, 1])).toEqual([0, 0]);
  });

  it('throws on length mismatch', () => {
    expect(() => addVec([1, 2], [1, 2, 3])).toThrow('Vector length mismatch');
  });
});

describe('randomInRange', () => {
  it('generates values within specified range', () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInRange(-1, 1);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThan(1);
    }
  });

  it('uses default range [-0.5, 0.5]', () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInRange();
      expect(value).toBeGreaterThanOrEqual(-0.5);
      expect(value).toBeLessThan(0.5);
    }
  });
});

describe('validateNumberArray', () => {
  it('passes for valid arrays', () => {
    expect(() => validateNumberArray([1, 2, 3])).not.toThrow();
    expect(() => validateNumberArray([0, -1, 0.5])).not.toThrow();
  });

  it('throws for non-arrays', () => {
    expect(() => validateNumberArray('not an array')).toThrow('must be an array');
  });

  it('throws for arrays with NaN', () => {
    expect(() => validateNumberArray([1, NaN, 3])).toThrow('not a valid number');
  });

  it('throws for arrays with Infinity', () => {
    expect(() => validateNumberArray([1, Infinity])).toThrow('not a valid number');
  });
});
