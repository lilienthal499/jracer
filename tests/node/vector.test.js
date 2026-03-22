import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Vector } from '../../js/vector.js';

const close = (a, b) => Math.abs(a - b) < 1e-10;

describe('Vector', () => {
  test('constructor', () => {
    const v = new Vector(5, 10);
    assert.equal(v.x, 5);
    assert.equal(v.y, 10);
    assert.equal(new Vector(NaN, NaN).x, 0);
  });

  test('copy', () => {
    const v = new Vector(3, 7);
    const c = v.copy();
    c.x = 100;
    assert.equal(v.x, 3);
  });

  test('rotate', () => {
    const v = new Vector(1, 0);
    v.rotate(Math.PI / 2);
    assert.ok(close(v.x, 0) && close(v.y, 1));
  });

  test('copyFrom', () => {
    const v = new Vector(1, 2);
    v.copyFrom(new Vector(5, 10));
    assert.equal(v.x, 5);
    assert.equal(v.y, 10);
  });

  test('equals', () => {
    assert.ok(new Vector(5, 10).equals(new Vector(5, 10)));
    assert.ok(!new Vector(5, 10).equals(new Vector(6, 10)));
  });
});
