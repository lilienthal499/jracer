import { Vector } from './vector.js';

export const Track = {
  NORTH: Math.PI,
  EAST: 0.5 * Math.PI,
  SOUTH: 0,
  WEST: 1.5 * Math.PI,
  START: 'START',
  FINISH: 'FINISH',
  STRAIGHT: 'STRAIGHT',
  LEFT_TURN: 'LEFT_TURN',
  RIGHT_TURN: 'RIGHT_TURN',
  WIDE_LEFT_TURN: 'WIDE_LEFT_TURN',
  WIDE_RIGHT_TURN: 'WIDE_RIGHT_TURN',
  EXTRA_WIDE_LEFT_TURN: 'EXTRA_WIDE_LEFT_TURN',
  EXTRA_WIDE_RIGHT_TURN: 'EXTRA_WIDE_RIGHT_TURN',
  CUSTOM: 'CUSTOM' //Future Use
};

function createCursor(startingPoint) {
  'use strict';
  let cardinalDirection = Track.NORTH;
  const position = startingPoint.copy();
  let positions = [];

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

  function rotate(clockwise) {
    if (clockwise) {
      cardinalDirection = cardinalDirection - 0.5 * Math.PI;
    } else {
      cardinalDirection = cardinalDirection + 0.5 * Math.PI;
    }
    cardinalDirection = (cardinalDirection + 2 * Math.PI) % (2 * Math.PI);
  }

  function getPosition() {
    return position;
  }

  function getCardinalDirection() {
    return cardinalDirection;
  }

  function getPositions() {
    const result = positions;
    positions = [];
    return result;
  }

  return { moveAhead, rotate, getPosition, getCardinalDirection, getPositions };
}

function createSizeMeter() {
  'use strict';
  const maximum = new Vector();
  const minimum = new Vector();
  let cursor;

  function determineNewExtremes() {
    const currentPosition = cursor.getPosition();
    maximum.x = Math.max(maximum.x, currentPosition.x);
    maximum.y = Math.max(maximum.y, currentPosition.y);
    minimum.x = Math.min(minimum.x, currentPosition.x);
    minimum.y = Math.min(minimum.y, currentPosition.y);
  }

  function addStart() {
    cursor = createCursor(new Vector());
    cursor.moveAhead();
  }

  function addFinish() {
    const currentPosition = cursor.getPosition();
    if (currentPosition.x !== 0 || currentPosition.y !== 0 || cursor.getCardinalDirection() !== Track.NORTH) {
      throw new Error('Finish does not match Start!');
    }
  }

  function addCurve(clockwise, curveSize) {
    switch (curveSize) {
      case 1:
        cursor.rotate(clockwise);
        cursor.moveAhead();
        break;

      case 2:
        cursor.moveAhead();
        cursor.rotate(clockwise);
        cursor.moveAhead();
        cursor.moveAhead();
        break;

      case 3:
        cursor.moveAhead();
        cursor.rotate(clockwise);
        cursor.moveAhead();
        cursor.rotate(!clockwise);
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

  function getSize() {
    return new Vector(Math.abs(minimum.x) + maximum.x + 1, Math.abs(minimum.y) + maximum.y + 1);
  }

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

function createTrackBuilder(startPosition, size, gridSize, trackWidth) {
  'use strict';
  let cursor = null;
  const sequence = [];
  const grid = [];
  let turnBalance = 0;

  function initializeGrid() {
    // Create size.x empty arrays and spread them into grid
    // X dimension must be pre-initialized; Y dimension grows dynamically on assignment
    grid.push(...Array.from({ length: size.x }, () => []));
  }

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

  function addStart() {
    if (cursor) {
      throw new Error("Only one 'Start' allowed");
    }
    cursor = createCursor(startPosition);
    const segment = createHomeStraight(cursor, gridSize, trackWidth);
    sequence.push(segment);
    segment.setSequenceNumber(sequence.length);
    setGrid(cursor.getPositions(), segment);
  }

  function addFinish() {
    const segment = createHomeStraight(cursor, gridSize, trackWidth);
    sequence.push(segment);
    segment.setSequenceNumber(sequence.length);
  }

  function addCurve(clockwise, curveSize) {
    const segment = createTurn(cursor, clockwise, curveSize, gridSize, trackWidth);
    sequence.push(segment);
    segment.setSequenceNumber(sequence.length);
    setGrid(cursor.getPositions(), segment);

    turnBalance += clockwise ? 1 : -1;
  }

  function addStraight() {
    const segment = createStraight(cursor, gridSize, trackWidth);
    sequence.push(segment);
    segment.setSequenceNumber(sequence.length);
    setGrid(cursor.getPositions(), segment);
  }

  function getSequence() {
    return sequence;
  }

  function getGrid() {
    return grid;
  }

  function isClockwise() {
    return turnBalance > 0;
  }

  initializeGrid();

  return { addStart, addFinish, addCurve, addStraight, getSequence, getGrid, isClockwise };
}

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
        parser.addCurve(false, 1);
        break;
      case Track.RIGHT_TURN:
        parser.addCurve(true, 1);
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

export function createTrack(sequenceOfSegments, gridSize, trackWidth) {
  'use strict';
  const sizeMeter = createSizeMeter();
  parseSequenceOfSegments(sizeMeter, sequenceOfSegments);

  const trackBuilder = createTrackBuilder(sizeMeter.getStartingPoint(), sizeMeter.getSize(), gridSize, trackWidth);
  parseSequenceOfSegments(trackBuilder, sequenceOfSegments, sizeMeter.getStartingPoint());

  // Create off-track segment (singleton)
  const offTrackSegment = createOffTrackSegment();

  // Calculate edge offsets from track width
  // Track is centered on turn radius, so split width in half
  const halfTrackWidth = trackWidth / 2;
  const edgeOffsetInner = 0.5 + halfTrackWidth; // 0.5 + 0.2 = 0.7
  const edgeOffsetOuter = 0.5 - halfTrackWidth; // 0.5 - 0.2 = 0.3

  function getSegmentAtPosition(x, y) {
    const gridX = Math.ceil(x / gridSize) - 1;
    const gridY = Math.ceil(y / gridSize) - 1;

    try {
      return trackBuilder.getGrid()[gridX][gridY] || offTrackSegment;
    } catch (TypeError) {
      return offTrackSegment;
    }
  }

  function getModel() {
    // console.dir(sizeMeter.getSize());
    // console.dir(sizeMeter.getStartingPoint());
    // console.dir(trackBuilder.getGrid());
    // console.dir(trackBuilder.getGrid()[sizeMeter.getStartingPoint().x][sizeMeter.getStartingPoint().y]);
    // console.dir(trackBuilder.getGrid()[sizeMeter.getStartingPoint().x][sizeMeter.getStartingPoint().y].getSequenceNumber());
    return {
      dimensions: {
        width: sizeMeter.getSize().x * gridSize,
        height: sizeMeter.getSize().y * gridSize
      },
      startingPosition: {
        x: sizeMeter.getStartingPoint().x * gridSize + 0.5 * gridSize,
        y: sizeMeter.getStartingPoint().y * gridSize + 0.5 * gridSize
      },
      gridSize,
      sequenceOfSegments: trackBuilder.getSequence(),
      grid: trackBuilder.getGrid(),
      offTrackSegment,
      // Track width and calculated edge offsets (for rendering and collision)
      trackWidth,
      edgeOffsetInner,
      edgeOffsetOuter,
      // Track direction
      isClockwise: trackBuilder.isClockwise(),
      // Query methods
      getSegmentAtPosition
    };
  }

  return { getModel };
}

// ============================================================================
// Track Segment Creation Functions
// ============================================================================

// ============================================================================
// Track Segment Creation Functions
// ============================================================================

function createTrackSegment() {
  'use strict';
  let sequenceNumber = null;

  function setSequenceNumber(number) {
    sequenceNumber = number;
  }

  function getSequenceNumber() {
    return sequenceNumber;
  }

  function isOnTrack(position) {
    // Default implementation (will be overridden in specific segment types)
    return true;
  }

  return { setSequenceNumber, getSequenceNumber, isOnTrack };
}

function createStraight(cursor, gridSize, trackWidth) {
  'use strict';
  const segment = createTrackSegment();
  segment.type = 'straight';
  segment.gridPosition = cursor.getPosition().copy();
  segment.cardinalDirection = cursor.getCardinalDirection();

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

  cursor.moveAhead();
  return segment;
}

function createHomeStraight(cursor, gridSize, trackWidth) {
  'use strict';
  const segment = createStraight(cursor, gridSize, trackWidth);
  segment.type = 'homestraight';
  return segment;
}

function createOffTrackSegment() {
  'use strict';
  const segment = createTrackSegment();
  segment.type = 'offtrack';
  segment.setSequenceNumber(0);

  segment.isOnTrack = function (position) {
    return false;
  };

  return segment;
}

function createTurn(cursor, clockwise, size, gridSize, trackWidth) {
  'use strict';
  const segment = createTrackSegment();

  segment.type = 'turn';
  segment.clockwise = clockwise;
  segment.size = size;
  segment.centerOfCircle = cursor.getPosition().copy();
  segment.startCardinalDirection = cursor.getCardinalDirection();

  segment.isOnTrack = function (position) {
    // Calculate track edge offsets from center line
    const halfTrackWidth = trackWidth / 2;
    const edgeOffsetInner = 0.5 + halfTrackWidth;
    const edgeOffsetOuter = 0.5 - halfTrackWidth;

    // Calculate inner and outer radii in pixels
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

    // Car is on-track if distance is between inner and outer radius
    return distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius;
  };

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

  let firstOffset;
  let secondOffset;

  switch (size) {
    case 1:
      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      segment.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 0.5;
      segment.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 0.5;

      cursor.moveAhead();
      break;

    case 2:
      cursor.moveAhead();

      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      segment.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 1.5;
      segment.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 1.5;

      cursor.moveAhead();
      cursor.moveAhead();
      break;

    case 3:
      cursor.moveAhead();

      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      segment.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 2.5;
      segment.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 2.5;

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

  segment.endCardinalDirection = cursor.getCardinalDirection();

  return segment;
}
