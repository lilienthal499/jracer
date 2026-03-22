import assert from 'node:assert';
import { describe, it } from 'node:test';

describe('Module smoke tests', () => {
  it('should import application.js and all its dependencies', async () => {
    const module = await import('../../js/application.js');
    assert.ok(module.startup, 'startup should be exported');
  });
});
