import { test, expect } from 'vitest';
import { Vector } from '../../js/vector.js';

const close = (a, b) => Math.abs(a - b) < 1e-10;

test('Vector constructor', () => {
  expect(new Vector(5, 10)).toEqual({ x: 5, y: 10 });
  expect(new Vector(NaN, NaN)).toEqual({ x: 0, y: 0 });
});

test('Vector.copy creates independent copy', () => {
  const v = new Vector(3, 7);
  const c = v.copy();
  c.x = 100;
  expect(v.x).toBe(3);
});

test('Vector.rotate', () => {
  const v = new Vector(1, 0);
  v.rotate(Math.PI / 2);
  expect(close(v.x, 0) && close(v.y, 1)).toBe(true);
});

test('Vector.copyFrom', () => {
  const v1 = new Vector(1, 2);
  v1.copyFrom(new Vector(5, 10));
  expect(v1).toEqual({ x: 5, y: 10 });
});

test('Vector.equals', () => {
  expect(new Vector(5, 10).equals(new Vector(5, 10))).toBe(true);
  expect(new Vector(5, 10).equals(new Vector(6, 10))).toBe(false);
});
