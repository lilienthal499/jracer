import { describe, it, expect } from 'vitest';

// jracer.Vector is loaded via setup.js

describe('Vector', () => {
  describe('constructor', () => {
    it('should create a vector with given x and y coordinates', () => {
      const vec = new jracer.Vector(5, 10);

      expect(vec.x).toBe(5);
      expect(vec.y).toBe(10);
    });

    it('should default NaN values to 0', () => {
      const vec1 = new jracer.Vector(NaN, 10);
      const vec2 = new jracer.Vector(5, NaN);
      const vec3 = new jracer.Vector(NaN, NaN);

      expect(vec1.x).toBe(0);
      expect(vec1.y).toBe(10);
      expect(vec2.x).toBe(5);
      expect(vec2.y).toBe(0);
      expect(vec3.x).toBe(0);
      expect(vec3.y).toBe(0);
    });

    it('should handle undefined values as NaN and convert to 0', () => {
      const vec = new jracer.Vector(undefined, undefined);

      expect(vec.x).toBe(0);
      expect(vec.y).toBe(0);
    });
  });

  describe('copy', () => {
    it('should create a new vector with same values', () => {
      const original = new jracer.Vector(3, 7);
      const copy = original.copy();

      expect(copy.x).toBe(3);
      expect(copy.y).toBe(7);
    });

    it('should create independent copy (not reference)', () => {
      const original = new jracer.Vector(3, 7);
      const copy = original.copy();

      copy.x = 100;
      copy.y = 200;

      expect(original.x).toBe(3);
      expect(original.y).toBe(7);
    });
  });

  describe('rotate', () => {
    it('should rotate vector by 90 degrees (π/2)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(Math.PI / 2);

      // Due to floating point precision, use toBeCloseTo
      expect(vec.x).toBeCloseTo(0, 10);
      expect(vec.y).toBeCloseTo(1, 10);
    });

    it('should rotate vector by 180 degrees (π)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(Math.PI);

      expect(vec.x).toBeCloseTo(-1, 10);
      expect(vec.y).toBeCloseTo(0, 10);
    });

    it('should rotate vector by 270 degrees (3π/2)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(3 * Math.PI / 2);

      expect(vec.x).toBeCloseTo(0, 10);
      expect(vec.y).toBeCloseTo(-1, 10);
    });

    it('should rotate vector by 360 degrees (2π) back to original', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(2 * Math.PI);

      expect(vec.x).toBeCloseTo(1, 10);
      expect(vec.y).toBeCloseTo(0, 10);
    });

    it('should rotate non-unit vector correctly', () => {
      const vec = new jracer.Vector(3, 4);
      vec.rotate(Math.PI / 2);

      expect(vec.x).toBeCloseTo(-4, 10);
      expect(vec.y).toBeCloseTo(3, 10);
    });

    it('should handle negative rotation (clockwise)', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(-Math.PI / 2);

      expect(vec.x).toBeCloseTo(0, 10);
      expect(vec.y).toBeCloseTo(-1, 10);
    });
  });

  describe('copyFrom', () => {
    it('should copy values from another vector', () => {
      const vec1 = new jracer.Vector(1, 2);
      const vec2 = new jracer.Vector(5, 10);

      vec1.copyFrom(vec2);

      expect(vec1.x).toBe(5);
      expect(vec1.y).toBe(10);
    });

    it('should not create a reference', () => {
      const vec1 = new jracer.Vector(1, 2);
      const vec2 = new jracer.Vector(5, 10);

      vec1.copyFrom(vec2);
      vec2.x = 100;

      expect(vec1.x).toBe(5);
    });
  });

  describe('equals', () => {
    it('should return true for vectors with same coordinates', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(5, 10);

      expect(vec1.equals(vec2)).toBe(true);
    });

    it('should return false for vectors with different x', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(6, 10);

      expect(vec1.equals(vec2)).toBe(false);
    });

    it('should return false for vectors with different y', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(5, 11);

      expect(vec1.equals(vec2)).toBe(false);
    });

    it('should return false for vectors with different x and y', () => {
      const vec1 = new jracer.Vector(5, 10);
      const vec2 = new jracer.Vector(6, 11);

      expect(vec1.equals(vec2)).toBe(false);
    });

    it('should work with zero vectors', () => {
      const vec1 = new jracer.Vector(0, 0);
      const vec2 = new jracer.Vector(0, 0);

      expect(vec1.equals(vec2)).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should handle chained operations', () => {
      const vec = new jracer.Vector(1, 0);
      vec.rotate(Math.PI / 4); // 45 degrees
      const copy = vec.copy();
      copy.rotate(Math.PI / 4); // Another 45 degrees = 90 total

      expect(copy.x).toBeCloseTo(0, 10);
      expect(copy.y).toBeCloseTo(1, 10);
    });

    it('should preserve original after copy and modifications', () => {
      const original = new jracer.Vector(10, 20);
      const modified = original.copy();
      modified.rotate(Math.PI);
      modified.x += 5;

      expect(original.x).toBe(10);
      expect(original.y).toBe(20);
    });
  });
});
