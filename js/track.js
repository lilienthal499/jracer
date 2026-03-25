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

    if (maximum.x < currentPosition.x) {
      maximum.x = currentPosition.x;
    }

    if (maximum.y < currentPosition.y) {
      maximum.y = currentPosition.y;
    }

    if (minimum.x > currentPosition.x) {
      minimum.x = currentPosition.x;
    }

    if (minimum.y > currentPosition.y) {
      minimum.y = currentPosition.y;
    }
  }

  function addStart() {
    cursor = createCursor(new Vector());
    cursor.moveAhead();
  }

  function addFinish() {
    const currentPosition = cursor.getPosition();
    if (
      currentPosition.x !== 0 ||
    currentPosition.y !== 0 ||
    cursor.getCardinalDirection() !== Track.NORTH
    ) {
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
    return new Vector(
      Math.abs(minimum.x) + maximum.x + 1,
      Math.abs(minimum.y) + maximum.y + 1
    );
  }

  function getStartingPoint() {
    return new Vector(Math.abs(minimum.x), Math.abs(minimum.y));
  }

  return { addStart, addFinish, addCurve, addStraight, getSize, getStartingPoint };
}

function createTrackBuilder(startPosition, size) {
  'use strict';
  let cursor = null;
  const sequence = [];
  const grid = [];

  function initializeGrid() {
    // Create size.x empty arrays and spread them into grid
    // X dimension must be pre-initialized; Y dimension grows dynamically on assignment
    grid.push(...Array.from({ length: size.x }, () => []));
  }

  function setGrid(positions, component) {
    console.dir(positions);
    console.dir(component);
    positions.forEach(position => {
      if (grid[position.x][position.y] === undefined) {
        grid[position.x][position.y] = component;
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
    const component = createHomeStraight(cursor);
    sequence.push(component);
    component.setSequenceNumber(sequence.length);
    setGrid(cursor.getPositions(), component);
  }

  function addFinish() {
    const component = createHomeStraight(cursor);
    sequence.push(component);
    component.setSequenceNumber(sequence.length);
  }

  function addCurve(clockwise, curveSize) {
    const component = createTurn(cursor, clockwise, curveSize);
    sequence.push(component);
    component.setSequenceNumber(sequence.length);
    setGrid(cursor.getPositions(), component);
  }

  function addStraight() {
    const component = createStraight(cursor);
    sequence.push(component);
    component.setSequenceNumber(sequence.length);
    setGrid(cursor.getPositions(), component);
  }

  function getSequence() {
    return sequence;
  }

  function getGrid() {
    return grid;
  }

  initializeGrid();

  return { addStart, addFinish, addCurve, addStraight, getSequence, getGrid };
}

function parseSequenceOfComponents(parser, sequenceOfComponents, startPosition) {
  'use strict';
  sequenceOfComponents.forEach(component => {
    switch (component) {
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
        throw new Error(`Invalid Track Elememt ${component}`);
    }
  });
}

export function createTrack(sequenceOfComponents, gridSize, trackWidth) {
  'use strict';
  const sizeMeter = createSizeMeter();
  parseSequenceOfComponents(sizeMeter, sequenceOfComponents);

  const trackBuilder = createTrackBuilder(
    sizeMeter.getStartingPoint(),
    sizeMeter.getSize()
  );
  parseSequenceOfComponents(trackBuilder, sequenceOfComponents, sizeMeter.getStartingPoint());

  // Calculate edge offsets from track width
  // Track is centered on turn radius, so split width in half
  const halfTrackWidth = trackWidth / 2;
  const edgeOffsetInner = 0.5 + halfTrackWidth;  // 0.5 + 0.2 = 0.7
  const edgeOffsetOuter = 0.5 - halfTrackWidth;  // 0.5 - 0.2 = 0.3

  function getModel() {
    console.dir(sizeMeter.getSize());
    console.dir(sizeMeter.getStartingPoint());
    console.dir(trackBuilder.getGrid());
    console.dir(
      trackBuilder.getGrid()[sizeMeter.getStartingPoint().x][
        sizeMeter.getStartingPoint().y
      ]
    );
    console.dir(
      trackBuilder
        .getGrid()[sizeMeter.getStartingPoint().x][sizeMeter.getStartingPoint().y].getSequenceNumber()
    );
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
      sequenceOfComponents: trackBuilder.getSequence(),
      grid: trackBuilder.getGrid(),
      // Track width and calculated edge offsets (for rendering and collision)
      trackWidth,
      edgeOffsetInner,
      edgeOffsetOuter
    };
  }

  return { getModel };
}

function createTrackComponent() {
  'use strict';
  let sequenceNumber = null;

  function setSequenceNumber(number) {
    sequenceNumber = number;
  }

  function getSequenceNumber() {
    return sequenceNumber;
  }

  return { setSequenceNumber, getSequenceNumber };
}

function createTurn(cursor, clockwise, size) {
  'use strict';
  const component = createTrackComponent();

  component.type = 'turn';
  component.clockwise = clockwise;
  component.size = size;
  component.centerOfCircle = cursor.getPosition().copy();
  component.startCardinalDirection = cursor.getCardinalDirection();

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

      component.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 0.5;
      component.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 0.5;

      cursor.moveAhead();
      break;

    case 2:
      cursor.moveAhead();

      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      component.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 1.5;
      component.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 1.5;

      cursor.moveAhead();
      cursor.moveAhead();
      break;

    case 3:
      cursor.moveAhead();

      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      component.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 2.5;
      component.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 2.5;

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

  component.endCardinalDirection = cursor.getCardinalDirection();

  return component;
}

function createHomeStraight(cursor) {
  'use strict';
  const component = createTrackComponent();
  component.type = 'homestraight';
  cursor.moveAhead();
  return component;
}

function createStraight(cursor) {
  'use strict';
  const component = createTrackComponent();
  component.type = 'straight';
  cursor.moveAhead();
  return component;
}
