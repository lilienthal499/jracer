import { test } from 'vitest';

test('import all modules', async () => {
  await import('../../js/application.js');
});
