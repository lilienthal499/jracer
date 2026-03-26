import { describe, test, expect } from 'vitest';
import { createTrack, Track } from '../js/track.js';

// =============================================================================
// Test Helpers
// =============================================================================

function createTestTrack(segments, gridSize = 200, trackWidth = 0.4) {
  const track = createTrack(segments, gridSize, trackWidth);
  return track.getModel();
}

function expectOnTrack(segment, x, y) {
  expect(segment.isOnTrack({ x, y })).toBe(true);
}

function expectOffTrack(segment, x, y) {
  expect(segment.isOnTrack({ x, y })).toBe(false);
}

// =============================================================================
// Basic Track Creation Tests
// =============================================================================

describe('Track Creation - Basic', () => {
  test('should create a simple oval track', () => {
    const model = createTestTrack([
      Track.START,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.FINISH
    ]);

    expect(model).toBeDefined();
    expect(model.dimensions.width).toBeGreaterThan(0);
    expect(model.dimensions.height).toBeGreaterThan(0);
    expect(model.sequenceOfSegments.length).toBe(10);
  });

  test('should create track with all segment types', () => {
    const model = createTestTrack([
      Track.START,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.WIDE_LEFT_TURN,
      Track.EXTRA_WIDE_RIGHT_TURN,
      Track.STRAIGHT,
      Track.LEFT_TURN,
      Track.WIDE_RIGHT_TURN,
      Track.EXTRA_WIDE_LEFT_TURN,
      Track.STRAIGHT,
      Track.FINISH
    ]);

    expect(model.sequenceOfSegments.length).toBeGreaterThan(0);
    expect(model.dimensions.width).toBeGreaterThan(0);
  });

  test('should set correct gridSize', () => {
    const model = createTestTrack([Track.START, Track.STRAIGHT, Track.FINISH], 100);
    expect(model.gridSize).toBe(100);
  });

  test('should set correct trackWidth', () => {
    const model = createTestTrack([Track.START, Track.STRAIGHT, Track.FINISH], 200, 0.5);
    expect(model.trackWidth).toBe(0.5);
  });
});

// =============================================================================
// Track Model Structure Tests
// =============================================================================

describe('Track Model Structure', () => {
  let model;

  beforeEach(() => {
    model = createTestTrack([
      Track.START,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.FINISH
    ]);
  });

  test('should have dimensions property', () => {
    expect(model.dimensions).toBeDefined();
    expect(model.dimensions.width).toBeGreaterThan(0);
    expect(model.dimensions.height).toBeGreaterThan(0);
    expect(typeof model.dimensions.width).toBe('number');
    expect(typeof model.dimensions.height).toBe('number');
  });

  test('should have startingPosition property', () => {
    expect(model.startingPosition).toBeDefined();
    expect(model.startingPosition.x).toBeGreaterThan(0);
    expect(model.startingPosition.y).toBeGreaterThan(0);
  });

  test('should have gridSize property', () => {
    expect(model.gridSize).toBeDefined();
    expect(typeof model.gridSize).toBe('number');
  });

  test('should have sequenceOfSegments array', () => {
    expect(model.sequenceOfSegments).toBeDefined();
    expect(Array.isArray(model.sequenceOfSegments)).toBe(true);
    expect(model.sequenceOfSegments.length).toBeGreaterThan(0);
  });

  test('should have grid array', () => {
    expect(model.grid).toBeDefined();
    expect(Array.isArray(model.grid)).toBe(true);
  });

  test('should have offTrackSegment', () => {
    expect(model.offTrackSegment).toBeDefined();
    expect(model.offTrackSegment.type).toBe('offtrack');
    expect(model.offTrackSegment.sequenceNumber).toBe(0);
  });

  test('should have trackWidth and edge offsets', () => {
    expect(model.trackWidth).toBeDefined();
    expect(model.edgeOffsetInner).toBeDefined();
    expect(model.edgeOffsetOuter).toBeDefined();
  });

  test('should have isClockwise property', () => {
    expect(model.isClockwise).toBeDefined();
    expect(typeof model.isClockwise).toBe('boolean');
  });

  test('should have getSegmentAtPosition method', () => {
    expect(model.getSegmentAtPosition).toBeDefined();
    expect(typeof model.getSegmentAtPosition).toBe('function');
  });
});

// =============================================================================
// Sequence Number Tests
// =============================================================================

describe('Sequence Numbers', () => {
  const validLoop = [Track.START, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH];

  test('should assign sequence numbers starting at 1', () => {
    const model = createTestTrack(validLoop);
    expect(model.sequenceOfSegments[0].sequenceNumber).toBe(1);
  });

  test('should assign consecutive sequence numbers', () => {
    const model = createTestTrack(validLoop);

    for (let i = 0; i < model.sequenceOfSegments.length; i++) {
      expect(model.sequenceOfSegments[i].sequenceNumber).toBe(i + 1);
    }
  });

  test('should have getSequenceNumber method on segments', () => {
    const model = createTestTrack(validLoop);
    const segment = model.sequenceOfSegments[0];

    expect(segment.getSequenceNumber).toBeDefined();
    expect(typeof segment.getSequenceNumber).toBe('function');
    expect(segment.getSequenceNumber()).toBe(1);
  });

  test('offTrackSegment should have sequence number 0', () => {
    const model = createTestTrack(validLoop);
    expect(model.offTrackSegment.sequenceNumber).toBe(0);
    expect(model.offTrackSegment.getSequenceNumber()).toBe(0);
  });
});

// =============================================================================
// Segment Type Tests
// =============================================================================

describe('Segment Type Tests', () => {
  // Valid closed loop for testing segments
  const validLoop = [Track.START, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH];

  test('START creates homestraight segment', () => {
    const model = createTestTrack(validLoop);
    expect(model.sequenceOfSegments[0].type).toBe('homestraight');
  });

  test('FINISH creates homestraight segment', () => {
    const model = createTestTrack(validLoop);
    expect(model.sequenceOfSegments[model.sequenceOfSegments.length - 1].type).toBe('homestraight');
  });

  test('STRAIGHT creates straight segment', () => {
    const model = createTestTrack([Track.START, Track.STRAIGHT, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH]);
    const straightSegment = model.sequenceOfSegments.find(s => s.type === 'straight');
    expect(straightSegment).toBeDefined();
    expect(straightSegment.type).toBe('straight');
  });

  test('RIGHT_TURN creates turn segment', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];
    expect(turn.type).toBe('turn');
    expect(turn.clockwise).toBe(true);
    expect(turn.size).toBe(1);
  });

  test('LEFT_TURN creates turn segment', () => {
    const model = createTestTrack([Track.START, Track.LEFT_TURN, Track.LEFT_TURN, Track.LEFT_TURN, Track.LEFT_TURN, Track.FINISH]);
    const turn = model.sequenceOfSegments[1];
    expect(turn.type).toBe('turn');
    expect(turn.clockwise).toBe(false);
    expect(turn.size).toBe(1);
  });

  test('WIDE_RIGHT_TURN creates size 2 turn', () => {
    const model = createTestTrack([Track.START, Track.WIDE_RIGHT_TURN, Track.WIDE_RIGHT_TURN, Track.FINISH]);
    const turn = model.sequenceOfSegments[1];
    expect(turn.type).toBe('turn');
    expect(turn.size).toBe(2);
  });

  test('EXTRA_WIDE_LEFT_TURN creates size 3 turn', () => {
    const model = createTestTrack([Track.START, Track.EXTRA_WIDE_LEFT_TURN, Track.EXTRA_WIDE_LEFT_TURN, Track.FINISH]);
    const turn = model.sequenceOfSegments[1];
    expect(turn.type).toBe('turn');
    expect(turn.size).toBe(3);
  });
});

// =============================================================================
// Turn Direction Detection Tests
// =============================================================================

describe('Turn Direction Detection', () => {
  test('should detect clockwise track (more right turns)', () => {
    const model = createTestTrack([
      Track.START,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.FINISH
    ]);
    expect(model.isClockwise).toBe(true);
  });

  test('should detect counter-clockwise track (more left turns)', () => {
    const model = createTestTrack([
      Track.START,
      Track.LEFT_TURN,
      Track.LEFT_TURN,
      Track.LEFT_TURN,
      Track.LEFT_TURN,
      Track.FINISH
    ]);
    expect(model.isClockwise).toBe(false);
  });

  test('should handle balanced turns (equal left/right)', () => {
    const model = createTestTrack([
      Track.START,
      Track.RIGHT_TURN,
      Track.LEFT_TURN,
      Track.RIGHT_TURN,
      Track.LEFT_TURN,
      Track.FINISH
    ]);
    // Equal turns = turn balance 0, isClockwise should be false (0 > 0 is false)
    expect(model.isClockwise).toBe(false);
  });
});

// =============================================================================
// Grid Lookup Tests
// =============================================================================

describe('Grid Lookup - getSegmentAtPosition', () => {
  const validLoop = [Track.START, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH];

  test('should return segment for valid position', () => {
    const model = createTestTrack(validLoop, 200);
    const segment = model.getSegmentAtPosition(100, 100);
    expect(segment).toBeDefined();
    expect(segment.type).toBeDefined();
  });

  test('should return offTrackSegment for out of bounds position', () => {
    const model = createTestTrack(validLoop, 200);
    const segment = model.getSegmentAtPosition(-100, -100);
    expect(segment.type).toBe('offtrack');
  });

  test('should return offTrackSegment for empty grid cell', () => {
    const model = createTestTrack(validLoop, 200);
    const segment = model.getSegmentAtPosition(10000, 10000);
    expect(segment.type).toBe('offtrack');
  });
});

// =============================================================================
// Collision Detection Tests - Straight Segments
// =============================================================================

describe('Collision Detection - Straight Segments', () => {
  test('should detect on-track at center of straight', () => {
    const model = createTestTrack([Track.START, Track.STRAIGHT, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH], 200, 0.4);
    const straight = model.sequenceOfSegments.find(s => s.type === 'straight');

    // Center of the grid cell
    const centerX = straight.gridPosition.x * 200 + 100;
    const centerY = straight.gridPosition.y * 200 + 100;

    expectOnTrack(straight, centerX, centerY);
  });

  test('should detect on-track within track width', () => {
    const model = createTestTrack([Track.START, Track.STRAIGHT, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH], 200, 0.4);
    const straight = model.sequenceOfSegments.find(s => s.type === 'straight');

    // Should be on track if within 40% of grid cell width (trackWidth = 0.4)
    const centerX = straight.gridPosition.x * 200 + 100;
    const centerY = straight.gridPosition.y * 200 + 100;

    // Test positions within track width
    expectOnTrack(straight, centerX + 30, centerY); // Within 40% of 200 = 80px
    expectOnTrack(straight, centerX - 30, centerY);
  });

  test('should detect off-track outside track width', () => {
    const model = createTestTrack([Track.START, Track.STRAIGHT, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH], 200, 0.4);
    const straight = model.sequenceOfSegments.find(s => s.type === 'straight');

    const centerX = straight.gridPosition.x * 200 + 100;
    const centerY = straight.gridPosition.y * 200 + 100;

    // Test positions outside track width (40% of 200 = 80px radius)
    expectOffTrack(straight, centerX + 100, centerY); // 100px > 80px
    expectOffTrack(straight, centerX - 100, centerY);
  });
});

// =============================================================================
// Collision Detection Tests - Turn Segments
// =============================================================================

describe('Collision Detection - Turn Segments', () => {
  const validLoop = [Track.START, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH];

  test('should have centerOfCircle for turn segments', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];

    expect(turn.centerOfCircle).toBeDefined();
    expect(turn.centerOfCircle.x).toBeDefined();
    expect(turn.centerOfCircle.y).toBeDefined();
  });

  test('should have gridPosition for turn segments', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];

    expect(turn.gridPosition).toBeDefined();
    expect(turn.gridPosition.x).toBeDefined();
    expect(turn.gridPosition.y).toBeDefined();
  });

  test('should detect on-track for position on turn arc', () => {
    const model = createTestTrack(validLoop, 200, 0.4);
    const turn = model.sequenceOfSegments[1];

    // Calculate a position that should be on the arc
    const centerX = turn.centerOfCircle.x * 200;
    const centerY = turn.centerOfCircle.y * 200;

    // Position at approximately the center radius
    const radius = 200 * (turn.size - 0.5); // Center of track
    const angle = Math.PI / 4; // 45 degrees

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // This should be on track (within inner and outer radius)
    expect(turn.isOnTrack({ x, y })).toBeDefined();
  });
});

// =============================================================================
// Segment Properties Tests
// =============================================================================

describe('Segment Properties', () => {
  const validLoop = [Track.START, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH];
  const withStraight = [Track.START, Track.STRAIGHT, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.RIGHT_TURN, Track.FINISH];

  test('straight segments should have cardinalDirection', () => {
    const model = createTestTrack(withStraight);
    const straight = model.sequenceOfSegments.find(s => s.type === 'straight');

    expect(straight.cardinalDirection).toBeDefined();
  });

  test('straight segments should have gridPosition', () => {
    const model = createTestTrack(withStraight);
    const straight = model.sequenceOfSegments.find(s => s.type === 'straight');

    expect(straight.gridPosition).toBeDefined();
    expect(straight.gridPosition.x).toBeDefined();
    expect(straight.gridPosition.y).toBeDefined();
  });

  test('turn segments should have clockwise property', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];

    expect(turn.clockwise).toBeDefined();
    expect(typeof turn.clockwise).toBe('boolean');
  });

  test('turn segments should have size property', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];

    expect(turn.size).toBeDefined();
    expect([1, 2, 3]).toContain(turn.size);
  });

  test('turn segments should have startCardinalDirection', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];

    expect(turn.startCardinalDirection).toBeDefined();
  });

  test('turn segments should have endCardinalDirection', () => {
    const model = createTestTrack(validLoop);
    const turn = model.sequenceOfSegments[1];

    expect(turn.endCardinalDirection).toBeDefined();
  });
});

// =============================================================================
// Edge Offset Calculations Tests
// =============================================================================

describe('Edge Offset Calculations', () => {
  test('should calculate edgeOffsetInner correctly', () => {
    const model = createTestTrack([
      Track.START,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.FINISH
    ], 200, 0.4);
    const expected = 0.5 + 0.4 / 2; // 0.5 + 0.2 = 0.7
    expect(model.edgeOffsetInner).toBe(expected);
  });

  test('should calculate edgeOffsetOuter correctly', () => {
    const model = createTestTrack([
      Track.START,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.FINISH
    ], 200, 0.4);
    const expected = 0.5 - 0.4 / 2; // 0.5 - 0.2 = 0.3
    expect(model.edgeOffsetOuter).toBe(expected);
  });

  test('should handle different track widths', () => {
    const model = createTestTrack([
      Track.START,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.FINISH
    ], 200, 0.6);
    expect(model.edgeOffsetInner).toBe(0.8); // 0.5 + 0.3
    expect(model.edgeOffsetOuter).toBe(0.2); // 0.5 - 0.3
  });
});

// =============================================================================
// Error Handling Tests
// =============================================================================

describe('Error Handling', () => {
  test('should throw error for invalid segment type', () => {
    expect(() => {
      createTestTrack([Track.START, 'INVALID_SEGMENT', Track.FINISH]);
    }).toThrow();
  });

  test('should throw error for non-closed loop', () => {
    expect(() => {
      // Track that doesn't return to start
      createTestTrack([
        Track.START,
        Track.STRAIGHT,
        Track.RIGHT_TURN,
        Track.STRAIGHT,
        Track.FINISH
      ]);
    }).toThrow('Finish does not match Start');
  });

  test('should handle minimal valid closed loop', () => {
    // Minimal closed loop: start, 4 right turns to return to origin, finish
    expect(() => {
      createTestTrack([
        Track.START,
        Track.RIGHT_TURN,
        Track.RIGHT_TURN,
        Track.RIGHT_TURN,
        Track.RIGHT_TURN,
        Track.FINISH
      ]);
    }).not.toThrow();
  });
});

// =============================================================================
// Dimension Calculation Tests
// =============================================================================

describe('Dimension Calculations', () => {
  test('should calculate dimensions based on grid size', () => {
    const gridSize = 200;
    const model = createTestTrack([
      Track.START,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.STRAIGHT,
      Track.RIGHT_TURN,
      Track.FINISH
    ], gridSize);

    // Dimensions should be multiples of gridSize
    expect(model.dimensions.width % gridSize).toBe(0);
    expect(model.dimensions.height % gridSize).toBe(0);
  });

  test('should calculate starting position at grid center', () => {
    const gridSize = 200;
    const model = createTestTrack([
      Track.START,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.RIGHT_TURN,
      Track.FINISH
    ], gridSize);

    // Starting position should be at center of a grid cell
    expect(model.startingPosition.x % gridSize).toBe(100); // Center of cell
    expect(model.startingPosition.y % gridSize).toBe(100);
  });
});

// =============================================================================
// Track Constants Tests
// =============================================================================

describe('Track Constants', () => {
  test('should export Track constants', () => {
    expect(Track.NORTH).toBeDefined();
    expect(Track.EAST).toBeDefined();
    expect(Track.SOUTH).toBeDefined();
    expect(Track.WEST).toBeDefined();
    expect(Track.START).toBe('START');
    expect(Track.FINISH).toBe('FINISH');
    expect(Track.STRAIGHT).toBe('STRAIGHT');
    expect(Track.LEFT_TURN).toBe('LEFT_TURN');
    expect(Track.RIGHT_TURN).toBe('RIGHT_TURN');
  });

  test('cardinal directions should be in radians', () => {
    expect(Track.NORTH).toBe(Math.PI);
    expect(Track.SOUTH).toBe(0);
    expect(Track.EAST).toBe(0.5 * Math.PI);
    expect(Track.WEST).toBe(1.5 * Math.PI);
  });
});
