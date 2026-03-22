import { test } from 'node:test';

test('import all modules', async () => {
  await import('../../js/application.js');
});
