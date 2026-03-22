import { test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { initializeGame } from '../js/application.js';

test('initializeGame runs without throwing', () => {
  // Load config and track data
  const config = JSON.parse(readFileSync('backend/config.json', 'utf-8'));
  const trackData = JSON.parse(readFileSync('backend/tracks/2.json', 'utf-8'));

  config.track.sections = trackData.sections;

  expect(() => initializeGame(config)).not.toThrow();
});
