import { describe, it, expect } from 'vitest';

describe('Module smoke tests', () => {
  it('should import application.js and all its dependencies', async () => {
    const module = await import('../../js/application.js');
    expect(module.startup).toBeDefined();
  });
});
