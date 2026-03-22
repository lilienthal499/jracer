import { test } from 'vitest';
import { startup } from '../js/application.js';
import { config } from '../js/config.js';

// TODO: Full startup test requires canvas mocking (happy-dom doesn't support canvas 2D)
// For now, the smoke test (import check) is sufficient
test.skip('startup runs without throwing', () => {
  expect(() => startup(config)).not.toThrow();
});
