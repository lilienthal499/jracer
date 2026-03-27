import { Vector } from './vector.js';

// Angle constants for 90-degree rotations and full circle normalization
const NINETY_DEGREES = 0.5 * Math.PI;
const FULL_CIRCLE = 2 * Math.PI;

// Track constants and component definitions
// Directions use radians where SOUTH=0 and angles increase counter-clockwise
export const Track = {
  // Cardinal directions (in radians, for rendering)
  NORTH: Math.PI,
  EAST: NINETY_DEGREES,
  SOUTH: 0,
  WEST: 1.5 * Math.PI,

  // Track component types (used in track configuration arrays)
  START: 'START',
  FINISH: 'FINISH',
  STRAIGHT: 'STRAIGHT',
  LEFT_TURN: 'LEFT_TURN', // 90° turn, 1 grid cell
  RIGHT_TURN: 'RIGHT_TURN', // 90° turn, 1 grid cell
  WIDE_LEFT_TURN: 'WIDE_LEFT_TURN', // 90° turn, 2 grid cells (gentler curve)
  WIDE_RIGHT_TURN: 'WIDE_RIGHT_TURN', // 90° turn, 2 grid cells
  EXTRA_WIDE_LEFT_TURN: 'EXTRA_WIDE_LEFT_TURN', // 90° turn, 3 grid cells (widest curve)
  EXTRA_WIDE_RIGHT_TURN: 'EXTRA_WIDE_RIGHT_TURN', // 90° turn, 3 grid cells
  CUSTOM: 'CUSTOM' // Future Use
};

// ============================================================================
// PUBLIC API
// ============================================================================

// Main track creation function - Two-pass generation system
// Pass 1 (SizeMeter): Calculate bounding box by simulating track layout
// Pass 2 (SegmentBuilder): Generate actual segments with collision detection and rendering data
//
// Parameters:
//   sequenceOfSegments: Array of Track constants defining layout (from config.js)
//   gridSize: Size of each grid cell in pixels (default 200)
//   trackWidth: Width of track as fraction of grid cell (0.4 = 40% of cell)
export function createTrack(sequenceOfSegments, gridSize, trackWidth) {
  'use strict';
  // Pass 1: Calculate minimum grid size needed for this track layout
  const sizeMeter = createSizeMeter();
  parseSequenceOfSegments(sizeMeter, sequenceOfSegments);

  // Pass 2: Build actual track with proper positioning and collision data
  const segmentBuilder = createSegmentBuilder(sizeMeter.getStartingPoint(), sizeMeter.getSize(), gridSize, trackWidth);
  parseSequenceOfSegments(segmentBuilder, sequenceOfSegments, sizeMeter.getStartingPoint());

  // Create off-track segment (singleton)
  // Returned when car is outside track boundaries or in unassigned grid cells
  const offTrackSegment = createOffTrackSegment();

  // Calculate edge offsets from track width
  // Track is centered on turn radius, so split width in half
  const halfTrackWidth = trackWidth / 2;
  const edgeOffsetInner = 0.5 + halfTrackWidth; // 0.5 + 0.2 = 0.7
  const edgeOffsetOuter = 0.5 - halfTrackWidth; // 0.5 - 0.2 = 0.3

  // Fast grid-based collision lookup
  // Converts pixel coordinates to grid coordinates and returns the segment at that position
  function getSegmentAtPosition(x, y) {
    const gridX = Math.ceil(x / gridSize) - 1;
    const gridY = Math.ceil(y / gridSize) - 1;

    try {
      return segmentBuilder.getGrid()[gridX][gridY] || offTrackSegment;
    } catch (TypeError) {
      return offTrackSegment; // Out of bounds
    }
  }

  // Return complete track model with all data needed for physics and rendering
  function getModel() {
    // console.dir(sizeMeter.getSize());
    // console.dir(sizeMeter.getStartingPoint());
    // console.dir(segmentBuilder.getGrid());
    // console.dir(segmentBuilder.getGrid()[sizeMeter.getStartingPoint().x][sizeMeter.getStartingPoint().y]);
    // console.dir(segmentBuilder.getGrid()[sizeMeter.getStartingPoint().x][sizeMeter.getStartingPoint().y].getSequenceNumber());
    return {
      dimensions: {
        width: sizeMeter.getSize().x * gridSize,
        height: sizeMeter.getSize().y * gridSize
      },
      startingPosition: {
        // Place cars in center of start grid cell
        x: sizeMeter.getStartingPoint().x * gridSize + 0.5 * gridSize,
        y: sizeMeter.getStartingPoint().y * gridSize + 0.5 * gridSize
      },
      gridSize,
      sequenceOfSegments: segmentBuilder.getSequence(), // For lap counting
      grid: segmentBuilder.getGrid(), // For collision detection
      offTrackSegment,
      // Track width and calculated edge offsets (for rendering and collision)
      trackWidth,
      edgeOffsetInner,
      edgeOffsetOuter,
      // Track direction
      isClockwise: segmentBuilder.isClockwise(),
      // Query methods
      getSegmentAtPosition
    };
  }

  return { getModel };
}

// ============================================================================
// TWO-PASS GENERATION SYSTEM
// ============================================================================

// SizeMeter: First pass of track generation - calculates bounding box
// Simulates track layout to determine minimum grid size needed
// Starts at origin (0,0) and tracks min/max coordinates visited
function createSizeMeter() {
  'use strict';
  const maximum = new Vector(); // Max x,y reached during simulation
  const minimum = new Vector(); // Min x,y reached (can be negative)
  let cursor;

  // Update bounding box based on cursor's current position
  function determineNewExtremes() {
    const currentPosition = cursor.getPosition();
    maximum.x = Math.max(maximum.x, currentPosition.x);
    maximum.y = Math.max(maximum.y, currentPosition.y);
    minimum.x = Math.min(minimum.x, currentPosition.x);
    minimum.y = Math.min(minimum.y, currentPosition.y);
  }

  function addStart() {
    cursor = createCursor(new Vector()); // Start at origin (0,0) facing north
    cursor.moveAhead();
  }

  // Validates that track forms a closed loop
  // Finish must return to origin facing north to connect with start
  function addFinish() {
    const currentPosition = cursor.getPosition();
    if (currentPosition.x !== 0 || currentPosition.y !== 0 || cursor.getCardinalDirection() !== Track.NORTH) {
      throw new Error('Finish does not match Start!');
    }
  }

  // Simulate a curve by moving cursor and updating bounding box
  // curveSize: 1=tight turn, 2=wide turn, 3=extra wide turn
  // Each size has a specific movement pattern to create smooth curves
  //
  // Grid cell patterns (X = occupied cell):
  //   Size 1:  X        (1 cell, L-shape)
  //   Size 2:  XX       (3 cells, extended L)
  //            X
  //   Size 3:    XX     (5 cells, S-curve for smoothness)
  //             XX
  //            X
  function addCurve(clockwise, curveSize) {
    switch (curveSize) {
      case 1: // Tight turn: rotate then move
        cursor.rotate(clockwise);
        cursor.moveAhead();
        break;

      case 2: // Wide turn: move, rotate, move 2x
        cursor.moveAhead();
        cursor.rotate(clockwise);
        cursor.moveAhead();
        cursor.moveAhead();
        break;

      case 3: // Extra wide turn: S-curve pattern for smooth arc
        cursor.moveAhead();
        cursor.rotate(clockwise);
        cursor.moveAhead();
        cursor.rotate(!clockwise); // Counter-rotate for smooth transition
        cursor.moveAhead();
        cursor.rotate(clockwise);
        cursor.moveAhead();
        cursor.moveAhead();
        break;

      default:
        throw new Error(`Invalid curve size: ${curveSize}`);
    }

    determineNewExtremes();
  }

  function addStraight() {
    cursor.moveAhead();
  }

  // Calculate total grid dimensions needed
  // +1 because we need inclusive bounds
  function getSize() {
    return new Vector(Math.abs(minimum.x) + maximum.x + 1, Math.abs(minimum.y) + maximum.y + 1);
  }

  // Calculate offset to translate track to positive coordinates
  // Returns where the start should be positioned in the final grid
  function getStartingPoint() {
    return new Vector(Math.abs(minimum.x), Math.abs(minimum.y));
  }

  return {
    addStart,
    addFinish,
    addCurve,
    addStraight,
    getSize,
    getStartingPoint
  };
}

// SegmentBuilder: Second pass of track generation - creates actual track segments
// Builds the grid data structure and sequence array used for collision detection and lap counting
// Parameters:
//   startPosition: where to place the start line in the grid (from SizeMeter)
//   size: grid dimensions (from SizeMeter)
//   gridSize: size in pixels of each grid cell
//   trackWidth: width of track as fraction of grid cell (0.4 = 40% of cell width)
function createSegmentBuilder(startPosition, size, gridSize, trackWidth) {
  'use strict';
  let cursor = null;
  const sequence = []; // Ordered array of track segments for lap counting
  const grid = []; // 2D array for fast collision lookup: grid[x][y] -> segment
  let turnBalance = 0; // Tracks net rotation: positive=clockwise, negative=counter-clockwise

  // Initialize grid with empty arrays for each X column
  // Y dimension grows dynamically as segments are added
  function initializeGrid() {
    // Create size.x empty arrays and spread them into grid
    // X dimension must be pre-initialized; Y dimension grows dynamically on assignment
    grid.push(...Array.from({ length: size.x }, () => []));
  }

  // Assign a segment to all grid cells it occupies
  // Throws error if track overlaps itself (impossible track configuration)
  function setGrid(positions, segment) {
    // console.dir(positions);
    // console.dir(segment);
    positions.forEach(position => {
      if (grid[position.x][position.y] === undefined) {
        grid[position.x][position.y] = segment;
      } else {
        throw new Error('Overlapping Track!');
      }
    });
  }

  // Add start segment (special straight marked as "homestraight")
  function addStart() {
    if (cursor) {
      throw new Error("Only one 'Start' allowed");
    }
    cursor = createCursor(startPosition);
    const segment = createHomeStraight(cursor, gridSize, trackWidth);
    sequence.push(segment);
    segment.sequenceNumber = sequence.length; // Sequence numbers used for lap detection
    setGrid(cursor.getPositions(), segment);
  }

  // Add finish segment (does NOT add to grid, acts as validation only)
  function addFinish() {
    const segment = createHomeStraight(cursor, gridSize, trackWidth);
    sequence.push(segment);
    segment.sequenceNumber = sequence.length;
    // Note: Finish segment not added to grid (cursor hasn't moved yet)
  }

  // Add a turn segment (size 1-3, clockwise or counter-clockwise)
  function addCurve(clockwise, curveSize) {
    const segment = createTurn(cursor, clockwise, curveSize, gridSize, trackWidth);
    sequence.push(segment);
    segment.sequenceNumber = sequence.length;
    setGrid(cursor.getPositions(), segment);

    // Track turn balance to determine overall track direction
    turnBalance += clockwise ? 1 : -1;
  }

  // Add a straight segment
  function addStraight() {
    const segment = createStraight(cursor, gridSize, trackWidth);
    sequence.push(segment);
    segment.sequenceNumber = sequence.length;
    setGrid(cursor.getPositions(), segment);
  }

  function getSequence() {
    return sequence;
  }

  function getGrid() {
    return grid;
  }

  // Determine if track runs clockwise (more right turns than left)
  function isClockwise() {
    return turnBalance > 0;
  }

  initializeGrid();

  return { addStart, addFinish, addCurve, addStraight, getSequence, getGrid, isClockwise };
}

// ============================================================================
// PARSING UTILITIES
// ============================================================================

// Parse track component array and build track using provided parser
// parser: Either SizeMeter (for bounding box calculation) or SegmentBuilder (for actual generation)
// sequenceOfSegments: Array of Track component constants (e.g., [START, STRAIGHT, LEFT_TURN, FINISH])
// This function is called twice during track creation - once for each parser
function parseSequenceOfSegments(parser, sequenceOfSegments, startPosition) {
  'use strict';
  sequenceOfSegments.forEach(segment => {
    switch (segment) {
      case Track.START:
        parser.addStart(startPosition);
        break;
      case Track.FINISH:
        parser.addFinish();
        break;
      case Track.LEFT_TURN:
        parser.addCurve(false, 1); // false = counter-clockwise
        break;
      case Track.RIGHT_TURN:
        parser.addCurve(true, 1); // true = clockwise
        break;
      case Track.WIDE_LEFT_TURN:
        parser.addCurve(false, 2);
        break;
      case Track.WIDE_RIGHT_TURN:
        parser.addCurve(true, 2);
        break;
      case Track.EXTRA_WIDE_LEFT_TURN:
        parser.addCurve(false, 3);
        break;
      case Track.EXTRA_WIDE_RIGHT_TURN:
        parser.addCurve(true, 3);
        break;
      case Track.STRAIGHT:
        parser.addStraight();
        break;
      default:
        throw new Error(`Invalid Track Elememt ${segment}`);
    }
  });
}

// Cursor: Tracks position and direction during track generation
// Acts like a "turtle graphics" cursor that moves through grid cells
// Positions are in grid coordinates (not pixels)
function createCursor(startingPoint) {
  'use strict';
  let cardinalDirection = Track.NORTH; // Always starts facing north
  const position = startingPoint.copy();
  let positions = []; // Accumulates grid positions visited since last getPositions() call

  // Move forward one grid cell in current direction
  // Records position before moving (for grid cell assignment)
  function moveAhead() {
    positions.push(position.copy());

    switch (cardinalDirection) {
      case Track.NORTH:
        position.y = position.y + 1;
        break;
      case Track.EAST:
        position.x = position.x + 1;
        break;
      case Track.SOUTH:
        position.y = position.y - 1;
        break;
      case Track.WEST:
        position.x = position.x - 1;
        break;
      default:
        throw new Error('Invalid cardinal direction!');
    }
  }

  // Rotate 90 degrees (clockwise = right turn, counter-clockwise = left turn)
  function rotate(clockwise) {
    if (clockwise) {
      cardinalDirection = cardinalDirection - NINETY_DEGREES;
    } else {
      cardinalDirection = cardinalDirection + NINETY_DEGREES;
    }
    // Normalize angle to [0, 2π) range
    cardinalDirection = (cardinalDirection + FULL_CIRCLE) % FULL_CIRCLE;
  }

  function getPosition() {
    return position;
  }

  function getCardinalDirection() {
    return cardinalDirection;
  }

  // Get all positions recorded since last call, then clear the buffer
  // Used to assign grid cells to track segments
  function getPositions() {
    const result = positions;
    positions = [];
    return result;
  }

  return { moveAhead, rotate, getPosition, getCardinalDirection, getPositions };
}

// ============================================================================
// SEGMENT CREATORS
// ============================================================================

// Base track segment - provides common interface for all segment types
// Each segment has:
//   - sequenceNumber: Position in track (1-based, used for lap counting)
//   - isOnTrack(): Collision detection function (checks if pixel position is on track)
//   - getSequenceNumber(): Accessor for lap detection (used by physics engine)
function createTrackSegment() {
  'use strict';
  const segment = {
    sequenceNumber: null,

    // Accessor for sequence number (used by physics engine and HUD)
    getSequenceNumber: function () {
      return this.sequenceNumber;
    },

    // Default collision check (overridden by specific segment types)
    isOnTrack: function (position) {
      return true;
    }
  };

  return segment;
}

// Straight segment - single grid cell in current direction
// Collision detection: check perpendicular distance from center line
function createStraight(cursor, gridSize, trackWidth) {
  'use strict';
  const segment = createTrackSegment();
  segment.type = 'straight';
  segment.gridPosition = cursor.getPosition().copy();
  segment.cardinalDirection = cursor.getCardinalDirection();

  // TODO: Extract collision logic to pure function for testability
  // function isStraightOnTrack(position, gridPosition, cardinalDirection, gridSize, trackWidth)
  segment.isOnTrack = function (position) {
    // Convert pixel position to grid coordinates (0-based grid cells)
    // e.g., position 200px with gridSize=200 → normalized = 1.0 (center of grid cell 1)
    const normalizedPosition = {
      x: position.x / gridSize,
      y: position.y / gridSize
    };

    // Check perpendicular distance from track center line
    // Vertical segments (NORTH/SOUTH): check horizontal distance (x-axis)
    // Horizontal segments (EAST/WEST): check vertical distance (y-axis)
    const isVertical = segment.cardinalDirection === Track.NORTH || segment.cardinalDirection === Track.SOUTH;
    const center = (isVertical ? segment.gridPosition.x : segment.gridPosition.y) + 0.5;
    const carPosition = isVertical ? normalizedPosition.x : normalizedPosition.y;
    const distance = Math.abs(carPosition - center);

    return distance <= trackWidth / 2;
  };

  cursor.moveAhead(); // Advance cursor for next segment
  return segment;
}

// Home straight - special straight segment for start/finish line
// Identical to regular straight but marked with different type for rendering
function createHomeStraight(cursor, gridSize, trackWidth) {
  'use strict';
  const segment = createStraight(cursor, gridSize, trackWidth);
  segment.type = 'homestraight'; // Used by renderer to draw start/finish line
  return segment;
}

// Turn segment - creates 90-degree curves with different radii
// Collision detection: radial distance check (car must be between inner/outer radius)
// Rendering: Uses circle center, start/end directions, and size to draw arc
//
// Turn geometry is complex because:
// 1. Center must be calculated based on entry/exit directions
// 2. Different sizes need different center offsets
// 3. Cursor must follow the arc pattern used in SizeMeter
function createTurn(cursor, clockwise, size, gridSize, trackWidth) {
  'use strict';
  const segment = createTrackSegment();

  segment.type = 'turn';
  segment.clockwise = clockwise;
  segment.size = size; // 1=tight, 2=wide, 3=extra wide
  segment.gridPosition = cursor.getPosition().copy(); // Grid position where turn begins
  segment.startCardinalDirection = cursor.getCardinalDirection();

  // TODO: Extract collision logic to pure function for testability
  // function isTurnOnTrack(position, centerOfCircle, size, gridSize, trackWidth)
  // TODO: Add tests for edge cases:
  //   - Car exactly at inner radius boundary
  //   - Car exactly at outer radius boundary
  //   - Car at center of turn circle
  //   - Different turn sizes (1, 2, 3)
  //   - Maximum track width (trackWidth approaching 1.0)
  segment.isOnTrack = function (position) {
    // Calculate track edge offsets from center line
    const halfTrackWidth = trackWidth / 2;
    const edgeOffsetInner = 0.5 + halfTrackWidth;
    const edgeOffsetOuter = 0.5 - halfTrackWidth;

    // Calculate inner and outer radii in pixels
    // Radius measured from turn size minus edge offset
    const innerRadius = gridSize * (size - edgeOffsetInner);
    const outerRadius = gridSize * (size - edgeOffsetOuter);

    // Convert center from grid coordinates to pixel coordinates
    const centerPixel = {
      x: segment.centerOfCircle.x * gridSize,
      y: segment.centerOfCircle.y * gridSize
    };

    // Calculate distance from car position to circle center
    const dx = position.x - centerPixel.x;
    const dy = position.y - centerPixel.y;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Car is on-track if distance is between inner and outer radius (annulus shape)
    return distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius;
  };

  // Calculate offset vector based on cardinal direction
  // Used to position the turn's circle center relative to grid position
  // afterRotate: invert the offset (used for calculating post-rotation position)
  function directionToOffset(direction, afterRotate) {
    const offset = new Vector();

    switch (direction) {
      case Track.NORTH:
        offset.y = -1;
        break;
      case Track.EAST:
        offset.x = -1;
        break;
      case Track.SOUTH:
        offset.y = 1;
        break;
      case Track.WEST:
        offset.x = 1;
        break;
    }
    if (afterRotate) {
      offset.x *= -1;
      offset.y *= -1;
    }
    return offset;
  }

  // Calculate the actual circle center based on turn size and direction
  // Center is offset from gridPosition to create smooth arcs
  //
  // Grid cell patterns (X = occupied cell):
  //   Size 1:  X        (1 cell, L-shape, center offset 0.5)
  //   Size 2:  XX       (3 cells, extended L, center offset 1.5)
  //            X
  //   Size 3:    XX     (5 cells, S-curve, center offset 2.5)
  //             XX
  //            X
  const centerOfCircle = segment.gridPosition.copy();

  // Move cursor forward for wide/extra-wide turns before calculating offsets
  if (size === 2 || size === 3) {
    cursor.moveAhead();
  }

  // Calculate offsets based on entry and exit directions
  const firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
  cursor.rotate(clockwise);
  const secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

  // Calculate circle center based on turn size
  // Each size has different offset multipliers for smooth arcs
  let secondOffsetMultiplier;
  switch (size) {
    case 1: // Tight turn: 1 grid cell radius
      secondOffsetMultiplier = 0.5;
      cursor.moveAhead();
      break;

    case 2: // Wide turn: 2 grid cell radius
      secondOffsetMultiplier = 1.5;
      cursor.moveAhead();
      cursor.moveAhead();
      break;

    case 3: // Extra wide turn: 3 grid cell radius (with S-curve for smoothness)
      secondOffsetMultiplier = 2.5;
      // Extra wide turns use S-curve pattern (rotate, counter-rotate, rotate)
      cursor.moveAhead();
      cursor.rotate(!clockwise);
      cursor.moveAhead();
      cursor.rotate(clockwise);
      cursor.moveAhead();
      cursor.moveAhead();
      break;

    default:
      throw new Error(`Invalid curve size: ${size}`);
  }

  // Apply offsets to calculate actual circle center
  centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * secondOffsetMultiplier;
  centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * secondOffsetMultiplier;

  // Store the calculated center
  segment.centerOfCircle = centerOfCircle;
  segment.endCardinalDirection = cursor.getCardinalDirection();

  return segment;
}

// Off-track segment - singleton representing any position not on the track
// Used as fallback when getSegmentAtPosition() finds no valid segment
// Sequence number 0 indicates "not on track" for lap counting
function createOffTrackSegment() {
  'use strict';
  const segment = createTrackSegment();
  segment.type = 'offtrack';
  segment.sequenceNumber = 0; // Special sequence number for off-track

  segment.isOnTrack = function (position) {
    return false; // Always returns false
  };

  return segment;
}
