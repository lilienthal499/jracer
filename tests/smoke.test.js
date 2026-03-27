import { test } from 'vitest';

test('import all modules', async () => {
  await import('../public/js/application.js');
});
