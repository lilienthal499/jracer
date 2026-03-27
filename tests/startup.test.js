import { test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { initializeGame } from '../public/js/application.js';

test('initializeGame runs without throwing', () => {
  // Load config and track data
  const config = JSON.parse(readFileSync('public/backend/config.json', 'utf-8'));
  const trackData = JSON.parse(readFileSync('public/backend/tracks/2.json', 'utf-8'));

  expect(() => initializeGame(config, trackData)).not.toThrow();
});
