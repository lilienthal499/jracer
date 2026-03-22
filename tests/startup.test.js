import { test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { initializeGame } from '../js/application.js';
import { config } from '../js/config.js';

test('initializeGame runs without throwing', () => {
  // Load real track data
  const trackData = JSON.parse(readFileSync('tracks/2.json', 'utf-8'));
  config.track.sections = trackData.sections;
  config.track.gridSize = trackData.gridSize;

  // Just verify it doesn't throw
  expect(() => initializeGame(config)).not.toThrow();
});
