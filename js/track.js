class Cursor {
  constructor(startingPoint) {
    this.cardinalDirection = jracer.Track.NORTH;
    this.position = startingPoint.copy();
    this.positions = [];
  }

  moveAhead() {
    this.positions.push(this.position.copy());

    switch (this.cardinalDirection) {
      case jracer.Track.NORTH:
        this.position.y = this.position.y + 1;
        break;
      case jracer.Track.EAST:
        this.position.x = this.position.x + 1;
        break;
      case jracer.Track.SOUTH:
        this.position.y = this.position.y - 1;
        break;
      case jracer.Track.WEST:
        this.position.x = this.position.x - 1;
        break;
      default:
        throw new Error('Invalid cardinal direction!');
    }
  }

  rotate(clockwise) {
    if (clockwise) {
      this.cardinalDirection = this.cardinalDirection - 0.5 * Math.PI; // Turn right
    } else {
      this.cardinalDirection = this.cardinalDirection + 0.5 * Math.PI; // Turn left
    }
    this.cardinalDirection = (this.cardinalDirection + 2 * Math.PI) % (2 * Math.PI);
  }

  getPosition() {
    return this.position;
  }

  getCardinalDirection() {
    return this.cardinalDirection;
  }

  getPositions() {
    const result = this.positions;
    this.positions = [];
    return result;
  }
}

class SizeMeter {
  constructor() {
    this.maximum = new jracer.Vector();
    this.minimum = new jracer.Vector();
    this.cursor = null;
  }

  determineNewExtremes() {
    const currentPosition = this.cursor.getPosition();

    if (this.maximum.x < currentPosition.x) {
      this.maximum.x = currentPosition.x;
    }

    if (this.maximum.y < currentPosition.y) {
      this.maximum.y = currentPosition.y;
    }

    if (this.minimum.x > currentPosition.x) {
      this.minimum.x = currentPosition.x;
    }

    if (this.minimum.y > currentPosition.y) {
      this.minimum.y = currentPosition.y;
    }
  }

  addStart() {
    this.cursor = new Cursor(new jracer.Vector());
    this.cursor.moveAhead();
  }

  addFinish() {
    const currentPosition = this.cursor.getPosition();
    if (
      currentPosition.x !== 0 ||
      currentPosition.y !== 0 ||
      this.cursor.getCardinalDirection() !== jracer.Track.NORTH
    ) {
      throw new Error('Finish does not match Start!');
    }
  }

  addCurve(clockwise, curveSize) {
    switch (curveSize) {
      case 1:
        this.cursor.rotate(clockwise);
        this.cursor.moveAhead();
        break;

      case 2:
        this.cursor.moveAhead();
        this.cursor.rotate(clockwise);
        this.cursor.moveAhead();
        this.cursor.moveAhead();
        break;

      case 3:
        this.cursor.moveAhead();
        this.cursor.rotate(clockwise);
        this.cursor.moveAhead();
        this.cursor.rotate(!clockwise);
        this.cursor.moveAhead();
        this.cursor.rotate(clockwise);
        this.cursor.moveAhead();
        this.cursor.moveAhead();
        break;

      default:
        throw new Error(`Invalid curve size: ${curveSize}`);
    }

    this.determineNewExtremes();
  }

  addStraight() {
    this.cursor.moveAhead();
  }

  getSize() {
    return new jracer.Vector(
      Math.abs(this.minimum.x) + this.maximum.x + 1,
      Math.abs(this.minimum.y) + this.maximum.y + 1
    );
  }

  getStartingPoint() {
    return new jracer.Vector(Math.abs(this.minimum.x), Math.abs(this.minimum.y));
  }
}

class ModelCreator {
  constructor(startPosition, size) {
    this.cursor = null;
    this.sequence = [];
    this.grid = [];
    this.initializeGrid(size);
  }

  initializeGrid(size) {
    // eslint-disable-next-line no-restricted-syntax
    for (let index = 0; index < size.x; index = index + 1) {
      this.grid[index] = [];
    }
  }

  setGrid(positions, component) {
    console.dir(positions);
    console.dir(component);
    positions.forEach(position => {
      if (this.grid[position.x][position.y] === undefined) {
        this.grid[position.x][position.y] = component;
      } else {
        throw new Error('Overlapping Track!');
      }
    });
  }

  addStart(startPosition) {
    if (this.cursor !== null) {
      throw new Error("Only one 'Start' allowed");
    }
    this.cursor = new Cursor(startPosition);
    const component = new jracer.Track.HomeStraight(this.cursor);
    this.sequence.push(component);
    component.setSequenceNumber(this.sequence.length);
    this.setGrid(this.cursor.getPositions(), component);
  }

  addFinish() {
    const component = new jracer.Track.HomeStraight(this.cursor);
    this.sequence.push(component);
    component.setSequenceNumber(this.sequence.length);
  }

  addCurve(clockwise, curveSize) {
    const component = new jracer.Track.Turn(this.cursor, clockwise, curveSize);
    this.sequence.push(component);
    component.setSequenceNumber(this.sequence.length);
    this.setGrid(this.cursor.getPositions(), component);
  }

  addStraight() {
    const component = new jracer.Track.Straight(this.cursor);
    this.sequence.push(component);
    component.setSequenceNumber(this.sequence.length);
    this.setGrid(this.cursor.getPositions(), component);
  }

  getSequence() {
    return this.sequence;
  }

  getGrid() {
    return this.grid;
  }
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

jracer.Track = class {
  constructor(sequenceOfComponents, gridSize) {
    const sizeMeter = new SizeMeter();
    parseSequenceOfComponents(sizeMeter, sequenceOfComponents);

    const modelCreator = new ModelCreator(
      sizeMeter.getStartingPoint(),
      sizeMeter.getSize()
    );
    parseSequenceOfComponents(modelCreator, sequenceOfComponents, sizeMeter.getStartingPoint());

    this.sizeMeter = sizeMeter;
    this.modelCreator = modelCreator;
    this.gridSize = gridSize;
  }

  getModel() {
    console.dir(this.sizeMeter.getSize());
    console.dir(this.sizeMeter.getStartingPoint());
    console.dir(this.modelCreator.getGrid());
    console.dir(
      this.modelCreator.getGrid()[this.sizeMeter.getStartingPoint().x][
        this.sizeMeter.getStartingPoint().y
      ]
    );
    console.dir(
      this.modelCreator
        .getGrid()
        [
          this.sizeMeter.getStartingPoint().x
        ][this.sizeMeter.getStartingPoint().y].getSequenceNumber()
    );
    return {
      dimensions: {
        width: this.sizeMeter.getSize().x * this.gridSize,
        height: this.sizeMeter.getSize().y * this.gridSize
      },
      startingPosition: {
        x: this.sizeMeter.getStartingPoint().x * this.gridSize + 0.5 * this.gridSize,
        y: this.sizeMeter.getStartingPoint().y * this.gridSize + 0.5 * this.gridSize
      },
      gridSize: this.gridSize,
      sequenceOfComponents: this.modelCreator.getSequence(),
      grid: this.modelCreator.getGrid()
    };
  }
};

jracer.Track.Drawer = class {
  constructor(canvas, sequenceOfComponents, gridSize) {
    this.canvas = canvas;
    this.sequenceOfComponents = sequenceOfComponents;
    this.gridSize = gridSize;
    this.draw();
  }

  drawTurn(turn, innerLoop) {
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
      radius = this.gridSize * (turnSize - 0.7);
    } else {
      radius = this.gridSize * (turnSize - 0.3);
    }

    this.canvas.arc(
      turn.centerOfCircle.x * this.gridSize,
      turn.centerOfCircle.y * this.gridSize,
      radius,
      startAngle,
      endAngle,
      turn.clockwise
    );
  }

  drawGridLines() {
    this.canvas.strokeStyle = 'rgba(0,0,0,0.9)';
    this.canvas.lineWidth = 3;
    const width = jracer.model.track.dimensions.width;
    const height = jracer.model.track.dimensions.height;

    let x = 0;
    while (x <= width) {
      this.canvas.beginPath();
      this.canvas.moveTo(x, 0);
      this.canvas.lineTo(x, height);
      this.canvas.stroke();
      x += this.gridSize;
    }

    let y = 0;
    while (y <= height) {
      this.canvas.beginPath();
      this.canvas.moveTo(0, y);
      this.canvas.lineTo(width, y);
      this.canvas.stroke();
      y += this.gridSize;
    }
  }

  draw() {
    this.canvas.beginPath();

    this.sequenceOfComponents.forEach(component => {
      if (component instanceof jracer.Track.Turn) {
        this.drawTurn(component, true);
      }
    });

    this.canvas.closePath();

    // ===== ENHANCED TRACK SURFACE =====
    this.canvas.globalCompositeOperation = 'source-over';

    // Darker asphalt with subtle gradient
    const gradient = this.canvas.createRadialGradient(
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
    this.canvas.fillStyle = gradient;
    this.canvas.fill();

    // ===== OUTER BORDER - Racing Kerbs (Red & White) =====
    this.canvas.globalCompositeOperation = 'source-atop';

    // Red base for kerbs
    this.canvas.strokeStyle = 'rgb(200,30,30)';
    this.canvas.lineWidth = this.gridSize / 10;
    this.canvas.stroke();

    // White stripes on kerbs (dashed pattern)
    this.canvas.setLineDash([this.gridSize / 8, this.gridSize / 8]);
    this.canvas.strokeStyle = 'rgb(255,255,255)';
    this.canvas.lineWidth = this.gridSize / 10;
    this.canvas.stroke();
    this.canvas.setLineDash([]); // Reset dash

    // White track edge line
    this.canvas.strokeStyle = 'rgb(255,255,255)';
    this.canvas.lineWidth = this.gridSize / 25;
    this.canvas.stroke();

    // ===== CUT OUT INNER TRACK =====
    this.canvas.beginPath();

    this.sequenceOfComponents.forEach(component => {
      if (component instanceof jracer.Track.Turn) {
        this.drawTurn(component, false);
      }
    });
    this.canvas.closePath();
    this.canvas.globalCompositeOperation = 'destination-out';
    this.canvas.fill();

    // ===== INNER BORDER - Racing Kerbs =====
    this.canvas.globalCompositeOperation = 'source-atop';

    // Red base for inner kerbs
    this.canvas.strokeStyle = 'rgb(200,30,30)';
    this.canvas.lineWidth = this.gridSize / 10;
    this.canvas.stroke();

    // White stripes on inner kerbs
    this.canvas.setLineDash([this.gridSize / 8, this.gridSize / 8]);
    this.canvas.strokeStyle = 'rgb(255,255,255)';
    this.canvas.lineWidth = this.gridSize / 10;
    this.canvas.stroke();
    this.canvas.setLineDash([]); // Reset dash

    // White inner edge line
    this.canvas.strokeStyle = 'rgb(255,255,255)';
    this.canvas.lineWidth = this.gridSize / 25;
    this.canvas.stroke();

    if (jracer.config.track.showGrid) {
      this.drawGridLines();
    }
  }
};

jracer.Track.Component = class {
  constructor() {
    this.sequenceNumber = null;
  }

  setSequenceNumber(number) {
    this.sequenceNumber = number;
  }

  getSequenceNumber() {
    return this.sequenceNumber;
  }
};

jracer.Track.Turn = class extends jracer.Track.Component {
  constructor(cursor, clockwise, size) {
    super();

    this.clockwise = clockwise;
    this.size = size;
    this.centerOfCircle = cursor.getPosition().copy();
    this.startCardinalDirection = cursor.getCardinalDirection();

    const directionToOffset = (direction, afterRotate) => {
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
    };

    let firstOffset;
    let secondOffset;

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
  }
};

jracer.Track.HomeStraight = class extends jracer.Track.Component {
  constructor(cursor) {
    super();
    cursor.moveAhead();
  }
};

jracer.Track.Straight = class extends jracer.Track.Component {
  constructor(cursor) {
    super();
    cursor.moveAhead();
  }
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
