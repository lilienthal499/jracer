import { describe, expect, test } from 'vitest';
import { Vector } from '../js/vector.js';

const close = (a, b) => Math.abs(a - b) < 1e-10;

describe('Vector', () => {
  test('constructor', () => {
    const v = new Vector(5, 10);
    expect(v.x).toBe(5);
    expect(v.y).toBe(10);
    expect(new Vector(NaN, NaN).x).toBe(0);
  });

  test('copy', () => {
    const v = new Vector(3, 7);
    const c = v.copy();
    c.x = 100;
    expect(v.x).toBe(3);
  });

  test('rotate', () => {
    const v = new Vector(1, 0);
    v.rotate(Math.PI / 2);
    expect(close(v.x, 0) && close(v.y, 1)).toBe(true);
  });

  test('copyFrom', () => {
    const v = new Vector(1, 2);
    v.copyFrom(new Vector(5, 10));
    expect(v.x).toBe(5);
    expect(v.y).toBe(10);
  });

  test('equals', () => {
    expect(new Vector(5, 10).equals(new Vector(5, 10))).toBe(true);
    expect(new Vector(5, 10).equals(new Vector(6, 10))).toBe(false);
  });
});
