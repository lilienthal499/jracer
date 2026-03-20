jracer.Track = function (sequenceOfComponents, gridSize) {
  'use strict';

  function Cursor(startingPoint) {
    let cardinalDirection = jracer.Track.NORTH;
    const position = startingPoint.copy();
    let positions = [];

    this.moveAhead = function () {
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
    };

    this.rotate = function (clockwise) {
      if (clockwise) {
        cardinalDirection = cardinalDirection - 0.5 * Math.PI; // Turn right
      } else {
        cardinalDirection = cardinalDirection + 0.5 * Math.PI; // Turn left
      }
      cardinalDirection = (cardinalDirection + 2 * Math.PI) % (2 * Math.PI);
    };

    this.getPosition = function () {
      return position;
    };

    this.getCardinalDirection = function () {
      return cardinalDirection;
    };

    this.getPositions = function () {
      const result = positions;
      positions = [];
      return result;
    };
  }

  function SizeMeter() {
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

    this.addStart = function () {
      cursor = new Cursor(new jracer.Vector());
      cursor.moveAhead();
    };

    this.addFinish = function () {
      // determineNewExtremes();
      const currentPosition = cursor.getPosition();
      if (
        currentPosition.x !== 0 ||
        currentPosition.y !== 0 ||
        cursor.getCardinalDirection() !== jracer.Track.NORTH
      ) {
        throw new Error('Finish does not match Start!');
      }
    };

    this.addCurve = function (clockwise, curveSize) {
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
    };

    this.addStraight = function () {
      cursor.moveAhead();
    };

    this.getSize = function () {
      return new jracer.Vector(
        Math.abs(minimum.x) + maximum.x + 1,
        Math.abs(minimum.y) + maximum.y + 1
      );
    };

    this.getStartingPoint = function () {
      return new jracer.Vector(Math.abs(minimum.x), Math.abs(minimum.y));
    };
  }

  function ModelCreator(startPosition, size) {
    let cursor;
    const sequence = [];
    const grid = [];

    function setGrid(positions, component) {
      console.dir(positions);
      console.dir(component);
      positions.forEach((position) => {
        if (grid[position.x][position.y] === undefined) {
          grid[position.x][position.y] = component;
        } else {
          throw new Error('Overlapping Track!');
        }
      });
    }

    this.addStart = function () {
      if (cursor !== undefined) {
        throw new Error('Only one \'Start\' allowed');
      }
      cursor = new Cursor(startPosition);
      const component = new jracer.Track.HomeStraight(cursor);
      sequence.push(component);
      component.setSequenceNumber(sequence.length);
      setGrid(cursor.getPositions(), component);
    };

    this.addFinish = function () {
      // determineNewExtremes();
      // var currentPosition = cursor.getPosition();
      // if (currentPosition.x !== 0 || currentPosition.y !== 0) {
      // throw "Finish does not match Start!";
      // }
      const component = new jracer.Track.HomeStraight(cursor);
      sequence.push(component);
      component.setSequenceNumber(sequence.length);
    };

    this.addCurve = function (clockwise, curveSize) {
      const component = new jracer.Track.Turn(cursor, clockwise, curveSize);
      sequence.push(component);
      component.setSequenceNumber(sequence.length);
      setGrid(cursor.getPositions(), component);
    };

    this.addStraight = function () {
      const component = new jracer.Track.Straight(cursor);
      sequence.push(component);
      component.setSequenceNumber(sequence.length);
      setGrid(cursor.getPositions(), component);
    };

    this.getSequence = function () {
      return sequence;
    };

    this.getGrid = function () {
      return grid;
    };

    function initializeGrid() {
      // eslint-disable-next-line no-restricted-syntax
      for (let index = 0; index < size.x; index = index + 1) {
        grid[index] = [];
      }
      // console.dir(grid);
    }
    initializeGrid();
  }

  function parseSequenceOfComponents(parser) {
    sequenceOfComponents.forEach((component) => {
      switch (component) {
        case jracer.Track.START:
          parser.addStart();
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
        // case jracer.Track.Custom:
        // break;
        default:
          throw new Error(`Invalid Track Elememt ${component}`);
      }
    });
  }

  const sizeMeter = new SizeMeter();
  parseSequenceOfComponents(sizeMeter);
  // console.dir(sizeMeter.getSize());
  // console.dir(sizeMeter.getStartingPoint());
  const modelCreator = new ModelCreator(
    sizeMeter.getStartingPoint(),
    sizeMeter.getSize()
  );
  parseSequenceOfComponents(modelCreator);
  // console.dir(modelCreator.getSequence());
  // console.log(sequenceOfComponents.length);
  // console.log(modelCreator.getSequence().length);

  this.getModel = function () {
    console.dir(sizeMeter.getSize());
    console.dir(sizeMeter.getStartingPoint());
    console.dir(modelCreator.getGrid());
    console.dir(
      modelCreator.getGrid()[sizeMeter.getStartingPoint().x][
        sizeMeter.getStartingPoint().y
      ]
    );
    console.dir(
      modelCreator.getGrid()[sizeMeter.getStartingPoint().x][
        sizeMeter.getStartingPoint().y
      ].getSequenceNumber()
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
  };
};

jracer.Track.Drawer = function (canvas, sequenceOfComponents, gridSize) {
  'use strict';

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

    //console.log("SA " + turn.startCardinalDirection / Math.PI );
    //console.log("EA " + turn.endCardinalDirection / Math.PI );

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

  canvas.beginPath();

  sequenceOfComponents.forEach((component) => {
    if (component instanceof jracer.Track.Turn) {
      drawTurn(component, true);
    }
  });

  canvas.closePath();

  // ===== ENHANCED TRACK SURFACE =====
  canvas.globalCompositeOperation = 'source-over';

  // Darker asphalt with subtle gradient
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

  // ===== OUTER BORDER - Racing Kerbs (Red & White) =====
  canvas.globalCompositeOperation = 'source-atop';

  // Red base for kerbs
  canvas.strokeStyle = 'rgb(200,30,30)';
  canvas.lineWidth = gridSize / 10;
  canvas.stroke();

  // White stripes on kerbs (dashed pattern)
  canvas.setLineDash([gridSize / 8, gridSize / 8]);
  canvas.strokeStyle = 'rgb(255,255,255)';
  canvas.lineWidth = gridSize / 10;
  canvas.stroke();
  canvas.setLineDash([]); // Reset dash

  // White track edge line
  canvas.strokeStyle = 'rgb(255,255,255)';
  canvas.lineWidth = gridSize / 25;
  canvas.stroke();

  // ===== CUT OUT INNER TRACK =====
  canvas.beginPath();

  sequenceOfComponents.forEach((component) => {
    if (component instanceof jracer.Track.Turn) {
      drawTurn(component, false);
    }
  });
  canvas.closePath();
  canvas.globalCompositeOperation = 'destination-out';
  canvas.fill();

  // ===== INNER BORDER - Racing Kerbs =====
  canvas.globalCompositeOperation = 'source-atop';

  // Red base for inner kerbs
  canvas.strokeStyle = 'rgb(200,30,30)';
  canvas.lineWidth = gridSize / 10;
  canvas.stroke();

  // White stripes on inner kerbs
  canvas.setLineDash([gridSize / 8, gridSize / 8]);
  canvas.strokeStyle = 'rgb(255,255,255)';
  canvas.lineWidth = gridSize / 10;
  canvas.stroke();
  canvas.setLineDash([]); // Reset dash

  // White inner edge line
  canvas.strokeStyle = 'rgb(255,255,255)';
  canvas.lineWidth = gridSize / 25;
  canvas.stroke();
};

jracer.Track.Component = function () {
  'use strict';
  let sequenceNumber;

  this.setSequenceNumber = function (number) {
    sequenceNumber = number;
  };

  this.getSequenceNumber = function () {
    return sequenceNumber;
  };
};

jracer.Track.Turn = function (cursor, clockwise, size) {
  'use strict';
  let firstOffset;
  let secondOffset;

  jracer.Track.Component.call(this);

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

  this.clockwise = clockwise;
  this.size = size;
  this.centerOfCircle = cursor.getPosition().copy();
  this.startCardinalDirection = cursor.getCardinalDirection();

  switch (size) {
    case 1:
      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      this.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 0.5;
      this.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 0.5;

      cursor.moveAhead();
      break;

    case 2:
      cursor.moveAhead();

      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      this.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 1.5;
      this.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 1.5;

      cursor.moveAhead();
      cursor.moveAhead();
      break;

    case 3:
      cursor.moveAhead();

      firstOffset = directionToOffset(cursor.getCardinalDirection(), false);
      cursor.rotate(clockwise);
      secondOffset = directionToOffset(cursor.getCardinalDirection(), true);

      this.centerOfCircle.x += 0.5 + firstOffset.x * 0.5 + secondOffset.x * 2.5;
      this.centerOfCircle.y += 0.5 + firstOffset.y * 0.5 + secondOffset.y * 2.5;

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

  this.endCardinalDirection = cursor.getCardinalDirection();
};

jracer.Track.HomeStraight = function (cursor) {
  'use strict';
  jracer.Track.Component.call(this);
  cursor.moveAhead();
};

jracer.Track.Straight = function (cursor) {
  'use strict';
  jracer.Track.Component.call(this);
  cursor.moveAhead();
};

jracer.Track.NORTH = Math.PI;
jracer.Track.EAST = 0.5 * Math.PI;
jracer.Track.SOUTH = 0;
jracer.Track.WEST = 1.5 * Math.PI;

jracer.Track.START = 'START';
jracer.Track.FINISH = 'FINISH';
jracer.Track.STRAIGHT = 'STRAIGHT';
jracer.Track.LEFT_TURN = 'LEFT_TURN';
jracer.Track.RIGHT_TURN = 'RIGHT_TURN';
jracer.Track.WIDE_LEFT_TURN = 'WIDE_LEFT_TURN';
jracer.Track.WIDE_RIGHT_TURN = 'WIDE_RIGHT_TURN';
jracer.Track.EXTRA_WIDE_LEFT_TURN = 'EXTRA_WIDE_LEFT_TURN';
jracer.Track.EXTRA_WIDE_RIGHT_TURN = 'EXTRA_WIDE_RIGHT_TURN';
jracer.Track.CUSTOM = 'CUSTOM'; //Future Use
