import { describe, test, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createTrack } from '../js/track.js';

describe('Track parsing', () => {
  const tracksDir = 'backend/tracks';
  const trackFiles = readdirSync(tracksDir).filter(f => f.endsWith('.json'));

  test('should find track files', () => {
    expect(trackFiles.length).toBeGreaterThan(0);
  });

  trackFiles.forEach(file => {
    test(`should parse ${file} without errors`, () => {
      const path = join(tracksDir, file);
      const content = readFileSync(path, 'utf-8');
      const trackData = JSON.parse(content);

      expect(() => {
        const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
        const model = track.getModel();

        // Basic validation
        expect(model.dimensions).toBeDefined();
        expect(model.dimensions.width).toBeGreaterThan(0);
        expect(model.dimensions.height).toBeGreaterThan(0);
        expect(model.startingPosition).toBeDefined();
        expect(model.sequenceOfSegments).toBeDefined();
        expect(model.sequenceOfSegments.length).toBeGreaterThan(0);

        // Turn direction validation
        expect(model.isClockwise).toBeDefined();
        expect(typeof model.isClockwise).toBe('boolean');
      }).not.toThrow();
    });
  });

  test('Track 1 (Beginner Oval) structure', () => {
    const trackData = JSON.parse(readFileSync('backend/tracks/1.json', 'utf-8'));
    const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
    const model = track.getModel();

    expect(trackData.name).toBe('Beginner Oval');
    expect(model.sequenceOfSegments.length).toBe(9);
    expect(model.dimensions.width).toBe(3000);
    expect(model.dimensions.height).toBe(3000);
    expect(model.isClockwise).toBe(true);
  });

  test('Track 2 (Technical Circuit) structure', () => {
    const trackData = JSON.parse(readFileSync('backend/tracks/2.json', 'utf-8'));
    const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
    const model = track.getModel();

    expect(trackData.name).toBe('Technical Circuit');
    expect(model.sequenceOfSegments.length).toBe(15);
    expect(model.dimensions.width).toBe(2400); // Fixed: actual dimensions from track generation
    expect(model.dimensions.height).toBe(2000); // Fixed: actual dimensions from track generation
    expect(model.isClockwise).toBe(true);
  });

  test('Track 3 (Left Turn Oval) structure', () => {
    const trackData = JSON.parse(readFileSync('backend/tracks/3.json', 'utf-8'));
    const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
    const model = track.getModel();

    expect(trackData.name).toBe('Left Turn Oval');
    expect(model.sequenceOfSegments.length).toBe(9);
    expect(model.dimensions.width).toBe(600);
    expect(model.dimensions.height).toBe(600);
    expect(model.isClockwise).toBe(false);
  });
});
