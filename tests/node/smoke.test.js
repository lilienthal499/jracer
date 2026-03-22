import { describe, it } from 'node:test';

describe('Module smoke tests', () => {
  it('should import application.js and all its dependencies', async () => {
    await import('../../js/application.js');
  });
});
