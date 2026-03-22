(function () {
  'use strict';

  function createCursor(startingPoint) {
    let cardinalDirection = jracer.Track.NORTH;
    const position = startingPoint.copy();
    let positions = [];

    function moveAhead() {
      positions.push(position.copy());

      switch (cardinalDirection) {
        case jracer.Track.NORTH:
          position.y = position.y + 1;
          break;
        case jracer.Track.EAST:
          position.x = position.x + 1;
          break;
        case jracer.Track.SOUTH:
          position.y = position.y - 1;
          break;
        case jracer.Track.WEST:
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
    const maximum = new jracer.Vector();
    const minimum = new jracer.Vector();
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
      cursor = createCursor(new jracer.Vector());
      cursor.moveAhead();
    }

    function addFinish() {
      const currentPosition = cursor.getPosition();
      if (
        currentPosition.x !== 0 ||
      currentPosition.y !== 0 ||
      cursor.getCardinalDirection() !== jracer.Track.NORTH
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
      return new jracer.Vector(
        Math.abs(minimum.x) + maximum.x + 1,
        Math.abs(minimum.y) + maximum.y + 1
      );
    }

    function getStartingPoint() {
      return new jracer.Vector(Math.abs(minimum.x), Math.abs(minimum.y));
    }

    return { addStart, addFinish, addCurve, addStraight, getSize, getStartingPoint };
  }

  function createModelCreator(startPosition, size) {
    let cursor = null;
    const sequence = [];
    const grid = [];

    function initializeGrid() {
    // eslint-disable-next-line no-restricted-syntax
      for (let index = 0; index < size.x; index = index + 1) {
        grid[index] = [];
      }
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
      if (cursor !== null) {
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
    sequenceOfComponents.forEach(component => {
      switch (component) {
        case jracer.Track.START:
          parser.addStart(startPosition);
          break;
        case jracer.Track.FINISH:
          parser.addFinish();
          break;
        case jracer.Track.LEFT_TURN:
          parser.addCurve(false, 1);
          break;
        case jracer.Track.RIGHT_TURN:
          parser.addCurve(true, 1);
          break;
        case jracer.Track.WIDE_LEFT_TURN:
          parser.addCurve(false, 2);
          break;
        case jracer.Track.WIDE_RIGHT_TURN:
          parser.addCurve(true, 2);
          break;
        case jracer.Track.EXTRA_WIDE_LEFT_TURN:
          parser.addCurve(false, 3);
          break;
        case jracer.Track.EXTRA_WIDE_RIGHT_TURN:
          parser.addCurve(true, 3);
          break;
        case jracer.Track.STRAIGHT:
          parser.addStraight();
          break;
        default:
          throw new Error(`Invalid Track Elememt ${component}`);
      }
    });
  }

  function createTrack(sequenceOfComponents, gridSize) {
    const sizeMeter = createSizeMeter();
    parseSequenceOfComponents(sizeMeter, sequenceOfComponents);

    const modelCreator = createModelCreator(
      sizeMeter.getStartingPoint(),
      sizeMeter.getSize()
    );
    parseSequenceOfComponents(modelCreator, sequenceOfComponents, sizeMeter.getStartingPoint());

    function getModel() {
      console.dir(sizeMeter.getSize());
      console.dir(sizeMeter.getStartingPoint());
      console.dir(modelCreator.getGrid());
      console.dir(
        modelCreator.getGrid()[sizeMeter.getStartingPoint().x][
          sizeMeter.getStartingPoint().y
        ]
      );
      console.dir(
        modelCreator
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
        sequenceOfComponents: modelCreator.getSequence(),
        grid: modelCreator.getGrid()
      };
    }

    return { getModel };
  }

  jracer.createTrack = createTrack;

  // Track constants and utilities
  jracer.Track = {
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

  function createTrackDrawer(canvas, sequenceOfComponents, gridSize) {
    function drawTurn(turn, innerLoop) {
      let turnSize = turn.size;
      let startAngle;
      let endAngle;
      let radius;
      if (turn.size === 2) {
        turnSize = 2;
      }
      startAngle = turn.startCardinalDirection;
      endAngle = turn.endCardinalDirection;
      if (!turn.clockwise) {
        startAngle = (startAngle + Math.PI) % (2 * Math.PI);
        endAngle = (endAngle + Math.PI) % (2 * Math.PI);
      }

      if (innerLoop !== turn.clockwise) {
        radius = gridSize * (turnSize - 0.7);
      } else {
        radius = gridSize * (turnSize - 0.3);
      }

      canvas.arc(
        turn.centerOfCircle.x * gridSize,
        turn.centerOfCircle.y * gridSize,
        radius,
        startAngle,
        endAngle,
        turn.clockwise
      );
    }

    function drawGridLines() {
      canvas.strokeStyle = 'rgba(0,0,0,0.9)';
      canvas.lineWidth = 3;
      const width = jracer.model.track.dimensions.width;
      const height = jracer.model.track.dimensions.height;

      let x = 0;
      while (x <= width) {
        canvas.beginPath();
        canvas.moveTo(x, 0);
        canvas.lineTo(x, height);
        canvas.stroke();
        x += gridSize;
      }

      let y = 0;
      while (y <= height) {
        canvas.beginPath();
        canvas.moveTo(0, y);
        canvas.lineTo(width, y);
        canvas.stroke();
        y += gridSize;
      }
    }

    function draw() {
      canvas.beginPath();

      sequenceOfComponents.forEach(component => {
        if (component.type === 'turn') {
          drawTurn(component, true);
        }
      });

      canvas.closePath();

      canvas.globalCompositeOperation = 'source-over';

      const gradient = canvas.createRadialGradient(
        jracer.model.track.dimensions.width / 2,
        jracer.model.track.dimensions.height / 2,
        100,
        jracer.model.track.dimensions.width / 2,
        jracer.model.track.dimensions.height / 2,
        Math.max(
          jracer.model.track.dimensions.width,
          jracer.model.track.dimensions.height
        )
      );
      gradient.addColorStop(0, 'rgb(75,75,75)');
      gradient.addColorStop(0.5, 'rgb(60,60,60)');
      gradient.addColorStop(1, 'rgb(50,50,50)');
      canvas.fillStyle = gradient;
      canvas.fill();

      canvas.globalCompositeOperation = 'source-atop';

      canvas.strokeStyle = 'rgb(200,30,30)';
      canvas.lineWidth = gridSize / 10;
      canvas.stroke();

      canvas.setLineDash([gridSize / 8, gridSize / 8]);
      canvas.strokeStyle = 'rgb(255,255,255)';
      canvas.lineWidth = gridSize / 10;
      canvas.stroke();
      canvas.setLineDash([]);

      canvas.strokeStyle = 'rgb(255,255,255)';
      canvas.lineWidth = gridSize / 25;
      canvas.stroke();

      canvas.beginPath();

      sequenceOfComponents.forEach(component => {
        if (component.type === 'turn') {
          drawTurn(component, false);
        }
      });
      canvas.closePath();
      canvas.globalCompositeOperation = 'destination-out';
      canvas.fill();

      canvas.globalCompositeOperation = 'source-atop';

      canvas.strokeStyle = 'rgb(200,30,30)';
      canvas.lineWidth = gridSize / 10;
      canvas.stroke();

      canvas.setLineDash([gridSize / 8, gridSize / 8]);
      canvas.strokeStyle = 'rgb(255,255,255)';
      canvas.lineWidth = gridSize / 10;
      canvas.stroke();
      canvas.setLineDash([]);

      canvas.strokeStyle = 'rgb(255,255,255)';
      canvas.lineWidth = gridSize / 25;
      canvas.stroke();

      if (jracer.config.track.showGrid) {
        drawGridLines();
      }
    }

    draw();
  }

  jracer.Track.Drawer = createTrackDrawer;

  function createTrackComponent() {
    let sequenceNumber = null;

    function setSequenceNumber(number) {
      sequenceNumber = number;
    }

    function getSequenceNumber() {
      return sequenceNumber;
    }

    return { setSequenceNumber, getSequenceNumber };
  }

  jracer.Track.Component = createTrackComponent;

  function createTurn(cursor, clockwise, size) {
    const component = createTrackComponent();

    component.type = 'turn';
    component.clockwise = clockwise;
    component.size = size;
    component.centerOfCircle = cursor.getPosition().copy();
    component.startCardinalDirection = cursor.getCardinalDirection();

    function directionToOffset(direction, afterRotate) {
      const offset = new jracer.Vector();

      switch (direction) {
        case jracer.Track.NORTH:
          offset.y = -1;
          break;
        case jracer.Track.EAST:
          offset.x = -1;
          break;
        case jracer.Track.SOUTH:
          offset.y = 1;
          break;
        case jracer.Track.WEST:
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

  jracer.Track.Turn = createTurn;

  function createHomeStraight(cursor) {
    const component = createTrackComponent();
    component.type = 'homestraight';
    cursor.moveAhead();
    return component;
  }

  jracer.Track.HomeStraight = createHomeStraight;

  function createStraight(cursor) {
    const component = createTrackComponent();
    component.type = 'straight';
    cursor.moveAhead();
    return component;
  }

  jracer.Track.Straight = createStraight;

})();
