import { test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { initializeGame } from '../js/application.js';
import { config } from '../js/config.js';

test('initializeGame creates game state without UI', () => {
  // Load real track data
  const trackData = JSON.parse(readFileSync('tracks/2.json', 'utf-8'));
  config.track.sections = trackData.sections;
  config.track.gridSize = trackData.gridSize;

  // Initialize game logic (no canvas/DOM)
  const gameState = initializeGame(config);

  // Verify game state was created
  expect(gameState.cars).toHaveLength(config.players.length);
  expect(gameState.controllers).toHaveLength(config.players.length);
  expect(gameState.physicsEngine).toBeDefined();
  expect(gameState.cars[0].position.x).toBeGreaterThan(0);
});
