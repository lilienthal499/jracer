import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Dynamic import to load application.js
// This runs the code which sets globalThis.jracer
await import('../../js/application.js');

// jracer is now available globally
const { jracer } = globalThis;

describe('Vector', () => {
  describe('constructor', () => {
    it('should create a vector with given x and y coordinates', () => {
      const vec = new jracer.Vector(5, 10);

      assert.strictEqual(vec.x, 5);
      assert.strictEqual(vec.y, 10);
    });

    it('should default NaN values to 0', () => {
      const vec1 = new jracer.Vector(NaN, 10);
      const vec2 = new jracer.Vector(5, NaN);
      const vec3 = new jracer.Vector(NaN, NaN);

      assert.strictEqual(vec1.x, 0);
      assert.strictEqual(vec1.y, 10);
      assert.strictEqual(vec2.x, 5);
      assert.strictEqual(vec2.y, 0);
      assert.strictEqual(vec3.x, 0);
      assert.strictEqual(vec3.y, 0);
    });

    it('should handle undefined values as NaN and convert to 0', () => {
      const vec = new jracer.Vector(undefined, undefined);

      assert.strictEqual(vec.x, 0);
      assert.strictEqual(vec.y, 0);
    });
  });

  describe('copy', () => {
    it('should create a new vector with same values', () => {
      const original = new jracer.Vector(3, 7);
      const copy = original.copy();

      assert.strictEqual(copy.x, 3);
      assert.strictEqual(copy.y, 7);
    });

    it('should create independent copy (not reference)', () => {
      const original = new jracer.Vector(3, 7);
      const copy = original.copy();

      copy.x = 100;
      copy.y = 200;

      assert.strictEqual(original.x, 3);
      assert.strictEqual(original.y, 7);
    });
  });

  describe('rotate', () => {
    it('should rotate vector by 90 degrees (π/2)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(Math.PI / 2);

      // Due to floating point precision, use custom closeTo assertion
      assertCloseTo(vec.x, 0, 1e-10);
      assertCloseTo(vec.y, 1, 1e-10);
    });

    it('should rotate vector by 180 degrees (π)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(Math.PI);

      assertCloseTo(vec.x, -1, 1e-10);
      assertCloseTo(vec.y, 0, 1e-10);
    });

    it('should rotate vector by 270 degrees (3π/2)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(3 * Math.PI / 2);

      assertCloseTo(vec.x, 0, 1e-10);
      assertCloseTo(vec.y, -1, 1e-10);
    });

    it('should rotate vector by 360 degrees (2π) back to original', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(2 * Math.PI);

      assertCloseTo(vec.x, 1, 1e-10);
      assertCloseTo(vec.y, 0, 1e-10);
    });

    it('should rotate non-unit vector correctly', () => {
      const vec = new jracer.Vector(3, 4);
      vec.rotate(Math.PI / 2);

      assertCloseTo(vec.x, -4, 1e-10);
      assertCloseTo(vec.y, 3, 1e-10);
    });

    it('should handle negative rotation (clockwise)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(-Math.PI / 2);

      assertCloseTo(vec.x, 0, 1e-10);
      assertCloseTo(vec.y, -1, 1e-10);
    });
  });

  describe('copyFrom', () => {
    it('should copy values from another vector', () => {
      const vec1 = new jracer.Vector(1, 2);
      const vec2 = new jracer.Vector(5, 10);

      vec1.copyFrom(vec2);

      assert.strictEqual(vec1.x, 5);
      assert.strictEqual(vec1.y, 10);
    });

    it('should not create a reference', () => {
      const vec1 = new jracer.Vector(1, 2);
      const vec2 = new jracer.Vector(5, 10);

      vec1.copyFrom(vec2);
      vec2.x = 100;

      assert.strictEqual(vec1.x, 5);
    });
  });

  describe('equals', () => {
    it('should return true for vectors with same coordinates', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(5, 10);

      assert.strictEqual(vec1.equals(vec2), true);
    });

    it('should return false for vectors with different x', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(6, 10);

      assert.strictEqual(vec1.equals(vec2), false);
    });

    it('should return false for vectors with different y', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(5, 11);

      assert.strictEqual(vec1.equals(vec2), false);
    });

    it('should return false for vectors with different x and y', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(6, 11);

      assert.strictEqual(vec1.equals(vec2), false);
    });

    it('should work with zero vectors', () => {
      const vec1 = new jracer.Vector(0, 0);
      const vec2 = new jracer.Vector(0, 0);

      assert.strictEqual(vec1.equals(vec2), true);
    });
  });

  describe('integration tests', () => {
    it('should handle chained operations', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(Math.PI / 4); // 45 degrees
      const copy = vec.copy();
      copy.rotate(Math.PI / 4); // Another 45 degrees = 90 total

      assertCloseTo(copy.x, 0, 1e-10);
      assertCloseTo(copy.y, 1, 1e-10);
    });

    it('should preserve original after copy and modifications', () => {
      const original = new jracer.Vector(10, 20);
      const modified = original.copy();
      modified.rotate(Math.PI);
      modified.x += 5;

      assert.strictEqual(original.x, 10);
      assert.strictEqual(original.y, 20);
    });
  });
});

// Helper function for floating point comparison
function assertCloseTo(actual, expected, tolerance = 1e-10) {
  const diff = Math.abs(actual - expected);
  assert.ok(
    diff < tolerance,
    `Expected ${actual} to be close to ${expected} (within ${tolerance}), but difference was ${diff}`
  );
}
