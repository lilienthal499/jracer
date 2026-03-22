import { test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { initializeGame } from '../js/application.js';
import { config } from '../js/config.js';
import { model } from '../js/model.js';

test('initializeGame creates game state without UI', () => {
  // Load real track data
  const trackData = JSON.parse(readFileSync('tracks/2.json', 'utf-8'));
  config.track.sections = trackData.sections;
  config.track.gridSize = trackData.gridSize;

  // Initialize game logic (no canvas/DOM)
  initializeGame(config);

  // Verify game state in model
  expect(model.cars).toHaveLength(config.players.length);
  expect(model.track.dimensions.width).toBeGreaterThan(0);
  expect(model.cars[0].position.x).toBeGreaterThan(0);
});
